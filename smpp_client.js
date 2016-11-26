/**
 * Created by @dcolonv on 7/9/2015.
 * Publish and manage the SMPP Client connections
 */
//Modules required ============================
var net = require('net');
var Promise = require('promise');
var pduGenerator = require('./pdu_generator');
var pduDecoder = require('./pdu_decoder');
var sequence = require('./sequence');
var commands = require('./commands');
var constants = require('./constants');


var pendingResponseSMList = {};//Pending Response submitted SM list, it is an object because the key is the sequence number used
var messagesToSubmit = []; //List of messages ready to be sent to the smsc
var pduSplitPacket = {}; //Has the split packet received in previous socket event
var commandsCallbacks = {}; //Has the commands callbacks assign by the user depending on the command_id
var enquire_link_timer; //Timer for enquire link pulses
var sm_submit_timer; //Timer for submit available SM pdu
var request_timeout; //Timeout use to control binding request timeout
var socket; //Socket of Net Connection


/**
 * Smpp Object Constructor
 * @constructor
 */
function SmppClient (){
    this.system_id = "";
    this.password = "";
    this.system_type = "";
    this.interface_version = "34";
    this.addr_ton = "00";
    this.addr_npi = "00";
    this.address_range = "00";
    this.keep_alive = 0;
    this.throughput = 0;
    this.timeout = 60000;
    this.status = constants.conection_status.CLOSED;
}

/**
 * Open a network connection as Client and return a Promise with the connection.
 * Initialize the socket with all the its functionality
 * @param host
 * @param port
 * @returns {Promise}
 */
SmppClient.prototype.connect = function(host, port){
    var smpp = this;
    return new Promise(function(fulfilled, rejected){
        //Try to open a connection with the host.
        socket = net.connect(port, host, function(){
            console.log('Connected to server %s:%s', host, port);
            //Change the smpp status to OPEN
            smpp.status = constants.conection_status.OPEN;
            //Execute the callback function for the fulfillment of the promise when connection was successful
            fulfilled();
        });

        //Execute this event on socket error
        socket.on('error', function() {
            //If there is one error on the socket, it execute the promise rejected callback
            rejected(new Error("Couldn't connect to the server: " + host + ":" + port));
            disconnect(smpp);
        });

        // On socket ending, destroy all pending process
        socket.on('end', function() {
            //release all the resources
            disconnect(smpp);
        });

        //On socket data received execute the pdu decoding and the corresponding callback
        socket.on('data', function (buffer) {
            processData(buffer);
        });
    });
};

/**
 * Close a connection
 */
SmppClient.prototype.disconnect = function(){
    disconnect(this);
};

/**
 * Create a client to listen any SMSC connection to attend Outbind requests
 * @param port
 * @returns {Promise}
 */
SmppClient.prototype.listen = function(port){
    var smpp = this;
    return new Promise(function(fulfilled, rejected){
        var server = net.createServer(function(con){
            console.log('Client connected on port: ' + port);
            socket = con;
            //Change the smpp status to OPEN
            smpp.status = constants.conection_status.OPEN;

            socket.on('end', function(){
                disconnect(smpp);
            });

            socket.on('data', function(buffer){
                processData(buffer);
            });
        });

        server.on('error', function(err){
            rejected(err);
        });

        server.on('end', function(){
            disconnect(smpp);
        });

        server.listen(port, function(){
            fulfilled();
        });
    });
};

/**
 * Smpp Bind Receiver Method
 * @returns {Promise}
 */
SmppClient.prototype.bind_receiver = function() {
    return bind(this, commands.bind_receiver.id);
};

/**
 * Smpp Bind Transmitter Method
 * @returns {Promise}
 */
SmppClient.prototype.bind_transmitter = function() {
    return bind(this, commands.bind_transceiver.id);
};

/**
 * Smpp Bind Transceiver Method
 * @returns {Promise}
 */
SmppClient.prototype.bind_transceiver = function() {
    return bind(this, commands.bind_transceiver.id);
};

/**
 * Smpp Unbind Method, send Unbind PDU to the SMSC,
 * on Unbind_resp, disconnect.
 */
SmppClient.prototype.unbind = function(callback){
    if(this.status === constants.conection_status.BOUND_RX
        || this.status === constants.conection_status.BOUND_TX
        || this.status === constants.conection_status.BOUND_TRX) {
        var seq_num = sequence.getSequence();
        var pdu = pduGenerator.unbind(seq_num);
        sendPdu(pdu);
        callback(undefined, messagesToSubmit, pendingResponseSMList);
    }
    else {
        callback(new Error('The connection is ' + this.status + ', and should be BOUND when trying to Unbind'));
    }
};

/**
 * Function to add the SM pdu to the array to be submitted in the next round.
 * This is used to respect the throughput limit
 * @param shortMessage
 */
SmppClient.prototype.submit_sm = function(shortMessage, callback){
    if(this.status === constants.conection_status.BOUND_RX
        || this.status === constants.conection_status.BOUND_TX
        || this.status === constants.conection_status.BOUND_TRX) {
        messagesToSubmit.push(shortMessage);
        callback();
    }
    else {
        callback(new Error('The connection is ' + this.status + ', and should be BOUND when trying to Submit_SM'));
    }
};

/**
 * Function to add the SM Data pdu to the array to be submitted in the next round.
 * This is used to respect the throughput limit
 * @param dataMessage
 */
SmppClient.prototype.data_sm = function(dataMessage, callback){
    if(this.status === constants.conection_status.BOUND_RX
        || this.status === constants.conection_status.BOUND_TX
        || this.status === constants.conection_status.BOUND_TRX) {
        messagesToSubmit.push(dataMessage);
        callback();
    }
    else {
        callback(new Error('The connection is ' + this.status + ', and should be BOUND when trying to Data_SM'));
    }
};


/**
 * Assign the event to execute when command is received
 * @param command
 * @param callback
 */
SmppClient.prototype.on = function(command, callback){
    commandsCallbacks[command.id] = callback;
};

/**
 * Process Incoming Socket Data
 * @param buffer
 */
function processData(buffer){
    try {
        //Parse the buffer into pduList.
        var bufferDecoded = pduDecoder.parseBuffer(buffer, pduSplitPacket);

        //Assign the part of the pdu that is incomplete to be attached to the next pdu received in this socket.
        pduSplitPacket = bufferDecoded.pduSplitPacket;

        //Execute the corresponding process for each pdu
        bufferDecoded.decodedPDUList.forEach(function(decodedPdu){
            //If the pdu is a submit_sm response, attach the sent message before callback
            //To send all the SM to the connection.
            if(decodedPdu.command_id === commands.submit_sm_resp.id || decodedPdu.command_id === commands.submit_multi_resp.id || decodedPdu.command_id === commands.data_sm_resp.id){
                if(pendingResponseSMList[decodedPdu.sequence_number]){
                    //In pendingResponseSMList the object is referenced by sequence_number, attach to it the part of the message received in response.
                    pendingResponseSMList[decodedPdu.sequence_number].message_id = decodedPdu.message_id;
                    pendingResponseSMList[decodedPdu.sequence_number].status = decodedPdu.status;
                    pendingResponseSMList[decodedPdu.sequence_number].no_unsuccess = decodedPdu.no_unsuccess;
                    pendingResponseSMList[decodedPdu.sequence_number].unsuccess_smes = decodedPdu.unsuccess_smes;
                    //If command callback is defined execute sending the shortMessage or dataMessage as parameter
                    if (commandsCallbacks[decodedPdu.command_id]) {
                        commandsCallbacks[decodedPdu.command_id](pendingResponseSMList[decodedPdu.sequence_number]); //ShortMessage or DataMessage completed
                    }
                    //remove from the list to avoid unnecessary increasing
                    delete pendingResponseSMList[decodedPdu.sequence_number];
                }
            }
            else {
                //If command received is a deliver_sm, respond with a deliver_sm_resp
                switch(decodedPdu.command_id){
                    case commands.deliver_sm.id:
                        var seq_num = decodedPdu.sequence_number;
                        var pdu = pduGenerator.deliver_sm_resp(seq_num);
                        sendPdu(pdu);
                        break;
                    case commands.unbind.id:
                        var seq_num = decodedPdu.sequence_number;
                        var pdu = pduGenerator.unbind_resp(seq_num);
                        sendPdu(pdu);
                        break;
                }
                //If command callback is defined execute
                if (commandsCallbacks[decodedPdu.command_id])
                    commandsCallbacks[decodedPdu.command_id](decodedPdu);
            }
        });

        //Send a generic_nack pdu to the SMSC for each error in PDUs.
        bufferDecoded.errorList.forEach(function(err){
            //If any error decoding binding PDU, send a generic_nack to the pdu originator.
            console.log(err);
            //Get the generic_nack pdu and send it to the socket
            generic_nack(err.status, err.sequence_number);
        });
    }
    catch (err){
        //If any error decoding binding PDU, send a generic_nack to the pdu originator.
        console.log(err);

        //Try to get the incoming sequence number if exists and can parse it
        var pduSequenceNumber;
        if(buffer && buffer.length > 16 && buffer.slice(12, 16).readUInt32BE(0)){
            pduSequenceNumber = buffer.slice(12, 16).readUInt32BE(0);
        }

        //Get the generic_nack pdu and send it to the socket
        generic_nack(err.status, pduSequenceNumber);
    }
}

/**
 * Send a Bind Request and Return the Promise of bounding,
 * if bind_response is received analyze it, if status 0 execute fulfill callback, if not, execute rejected callback
 * @param smpp
 * @param command_id
 * @returns {Promise}
 */
function bind(smpp, command_id){
    return new Promise( function(fulfilled, rejected) {
        if(smpp.status === constants.conection_status.OPEN) {
            //Assign a sequence number for binding pdu
            var seq_num = sequence.getSequence();
            //Create the pdu to bind the connection and send it to the socket
            var pdu = pduGenerator.bind(command_id, seq_num, smpp.system_id, smpp.password, smpp.system_type,
                smpp.interface_version, smpp.addr_ton, smpp.addr_npi, smpp.address_range);
            //Send to the socket
            sendPdu(pdu);

            //Start timeout for binding request, it will be destroyed when bind response comes.
            request_timeout = setTimeout(function () {
                //Call the promise rejected function
                rejected(new Error('Bind request sent, but it did not receive a response, timeout executed'));
            }, smpp.timeout);

            //Function to be executed as callback when any or bind response are received.
            function bindResponseReceived(decodedPdu) {
                if (decodedPdu && decodedPdu.status === 0 && decodedPdu.sequence_number == seq_num) {
                    //first to do is to kill the bind request timeout
                    clearTimeout(request_timeout);
                    console.log('Connection Bound: ' + smpp.system_id);
                    switch (command_id) {
                        case commands.bind_receiver.id:
                            smpp.status = constants.conection_status.BOUND_RX;
                            break;
                        case commands.bind_transmitter.id:
                            smpp.status = constants.conection_status.BOUND_TX;
                            break;
                        case commands.bind_transceiver.id:
                            smpp.status = constants.conection_status.BOUND_TRX;
                            break;
                    }

                    //This is only activated if the connection is bound
                    //If keep alive time is greater than 0, activate the enquire link timer
                    if (smpp.keep_alive > 0) {
                        if (smpp.status === constants.conection_status.BOUND_TX || smpp.status === constants.conection_status.BOUND_TRX || smpp.status === constants.conection_status.BOUND_RX) {
                            enquire_link_timer = setInterval(function () {
                                var seq_num = sequence.getSequence();
                                var pdu = pduGenerator.enquire_link(seq_num);
                                sendPdu(pdu);
                            }, smpp.keep_alive);
                        }
                    }

                    //Activate the timer for submit messages each second, when available in messageToSubmit array
                    //this is only valid if the bind is Transmitter or Transceiver
                    if (command_id === commands.bind_transmitter.id || command_id === commands.bind_transceiver.id) {
                        sm_submit_timer = setInterval(function () {
                            //If smpp is bound as TX or TRX get from the list of messageToSend and send them to the smsc
                            if (smpp.status === constants.conection_status.BOUND_TX || smpp.status === constants.conection_status.BOUND_TRX) {
                                //Throughput limit is bigger than zero, splice from 0 to throughput, if not splice all the array
                                //and for each element in the "removed" list, send it to the smsc.
                                (smpp.throughput > 0 ? messagesToSubmit.splice(0, smpp.throughput) : messagesToSubmit.splice(0)).forEach(function (shortMessage) {
                                    var seq_num = sequence.getSequence();
                                    var pdu = shortMessage.type === constants.object_types.DATA_MESSAGE ? pduGenerator.data_sm(seq_num, shortMessage) : pduGenerator.submit_sm(seq_num, shortMessage);
                                    sendPdu(pdu);
                                    //save into pendingResponseSM List the shortMessage with the sequence number used as key
                                    pendingResponseSMList[seq_num] = shortMessage;
                                });
                            }
                        }, 1000);
                    }
                    //Execute fulfillment of the Promise
                    fulfilled();
                }
                else {
                    //In case of status different to ESME_OK then execute the reject callback
                    rejected(new Error('Bind response received with status: ' + decodedPdu.status));
                }
            }

            //Register callbacks to be executed when bind response are received.
            commandsCallbacks[commands.bind_receiver_resp.id] = bindResponseReceived;
            commandsCallbacks[commands.bind_transceiver_resp.id] = bindResponseReceived;
            commandsCallbacks[commands.bind_transmitter_resp.id] = bindResponseReceived;
            //Assign to command callbacks the unbind function to execute when unbind_resp is received
            commandsCallbacks[commands.unbind_resp.id] = function (decodedPdu) {
                console.log('Data Received Unbind Response, status: %s, sequence: %d', decodedPdu.status, decodedPdu.sequence_number);
                //release all the resources
                disconnect(smpp);
            };
        }
        else {
            rejected(new Error(new Error('The connection is ' + smpp.status + ', and should be OPEN when trying to Bind')))
        }
    });
}

/**
 * Function to send a Generic Nack to the SMSC in case of error.
 * @param status
 * @param seq_num
 */
function generic_nack(status, seq_num){
    var pdu = pduGenerator.generic_nack(status, seq_num);
    sendPdu(pdu);
}

/**
 * Function to disconnect from server and release all the resources
 * @param smpp
 */
function disconnect(smpp){
    //Stop interval enquire_link timer
    clearInterval(enquire_link_timer);
    clearInterval(sm_submit_timer);
    //Destroy socket connection if exist and connection is different to closed
    if(socket && smpp.status !== constants.conection_status.CLOSED) {
        //Change connection status to CLOSE
        smpp.status = constants.conection_status.CLOSED;
        socket.destroy();
        socket = null;
        console.log('Disconnected from SMSC, system_id: %s', smpp.system_id);
    }
}

/**
 * Function to centralize the use of the socket
 * @param pdu
 */
function sendPdu(pdu){
    socket.write(pdu);
}
//Expose the object Smpp
module.exports = SmppClient;