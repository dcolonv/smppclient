/**
 * Created by @dcolonv on 27/06/2015.
 * Publish and manage the SMPP information
 */
//Modules required ============================
var net = require('net');
var Promise = require('promise');
var pduGenerator = require('./pdu_generator');
var pduDecoder = require('./pdu_decoder');
var sequence = require('./sequence');
var commands = require('./commands');


var pendingResponseSMList = {};//Pending Response submitted SM list, it is an object because the key is the sequence number used
var messagesToSubmit = []; //List of messages ready to be sent to the smsc
var pduSplitPacket = {}; //Has the split packet received in previous socket event
var commandsCallbacks = {}; //Has the commands callbacks assign by the user depending on the command_id
var enquire_link_timer; //Timer for enquire link pulses
var sm_submit_timer; //Timer for submit available SM pdu
var socket;


/**
 * Smpp Object Constructor
 * @constructor
 */
function Smpp (){
    this.isBound = false;
    this.system_id = "";
    this.password = "";
    this.system_type = "";
    this.interface_version = "34";
    this.addr_ton = "00";
    this.addr_npi = "00";
    this.address_range = "00";
    this.keep_alive = 0;
    this.throughput = 0;
}

/**
 * Smpp Bind Receiver Method
 * @param host
 * @param port
 * @returns {*}
 */
Smpp.prototype.bind_receiver = function (host, port) {
    return connectAndBind(host, port, this, commands.bind_receiver);
};

/**
 * Smpp Bind Transmitter Method
 * @param host
 * @param port
 * @returns {*}
 */
Smpp.prototype.bind_transmitter = function (host, port) {
    return connectAndBind(host, port, this, commands.bind_transmitter);
};

/**
 * Smpp Bind Transceiver Method
 * @param host
 * @param port
 * @returns {*}
 */
Smpp.prototype.bind_transceiver = function (host, port) {
    return connectAndBind(host, port, this, commands.bind_transceiver);
};

/**
 * Smpp Unbind Method, send Unbind PDU to the SMSC,
 * on Unbind_resp, disconnect.
 */
Smpp.prototype.unbind = function(callback){
    var seq_num = sequence.getSequence();
    var pdu = pduGenerator.unbind(seq_num);
    socket.write(pdu);
    callback(messagesToSubmit, pendingResponseSMList);
};

/**
 * Function to add the SM pdu to the array to be submitted in the next round.
 * This is used to respect the throughput limit
 * @param shortMessage
 */
Smpp.prototype.submit_sm = function(shortMessage){
    messagesToSubmit.push(shortMessage);
};


/**
 * Assign the event to execute when commandId is received
 * @param command_id
 * @param callback
 */
Smpp.prototype.on = function(command_id, callback){
    commandsCallbacks[command_id] = callback;
};

/**
 * Function to connect through a socket, return the Promise of Bounding
 * @param host
 * @param port
 * @param smpp
 * @param command_id
 * @returns {Promise}
 */
function connectAndBind (host, port, smpp, command_id){
    return new Promise(function(fulfilled, rejected){
        socket = net.connect(port, host, function(){
            console.log('Connected to server %s:%s', host, port);
            //Assign a sequence number for binding pdu
            var seq_num = sequence.getSequence();
            //Create the pdu to bind the connection and send it to the socket
            var pdu = pduGenerator.bind(command_id, seq_num, smpp.system_id, smpp.password, smpp.system_type,
                smpp.interface_version, smpp.addr_ton, smpp.addr_npi, smpp.address_range);
            socket.write(pdu);

            //This event only execute ONCE and then is removed because is only to listen the bind response packet
            socket.once('data', function(buffer) {
                try {
                    //Decode the BindPDU depending on seq_number.
                    var parsedBuffer = pduDecoder.parseBuffer(buffer, pduSplitPacket);
                    //The first pdu is the bind response
                    var decodedBindPdu = parsedBuffer.decodedPDUList[0];

                    //If decodedBindPdu sequence number is equals to the seq_number of the bind and the status is 0 (ESME_ROK)
                    if (decodedBindPdu && decodedBindPdu.sequence_number === seq_num && decodedBindPdu.status === 0){
                        console.log('Connection Bound: ' + smpp.system_id);
                        //Change bound flag to true.
                        smpp.isBound = true;
                        //Assign to command callbacks the unbind function to execute when unbind_resp is received
                        //Command_Id: 80000006
                        commandsCallbacks[commands.unbind_resp] = function(decodedPdu){
                            console.log('Data Received Unbind Response, status: %s, sequence: %d', decodedPdu.status, decodedPdu.sequence_number);
                            //release all the resources
                            disconnect(smpp);
                        };

                        //On socket data received execute the pdu decoding and the corresponding callback
                        //Register this socket event after executing binding successfully first.
                        socket.on('data', function (buffer) {
                            try {
                                //Parse the buffer into pduList.
                                var bufferDecoded = pduDecoder.parseBuffer(buffer, pduSplitPacket);

                                //Assign the part of the pdu that is incomplete to be attached to the next pdu received in this socket.
                                pduSplitPacket = bufferDecoded.pduSplitPacket;

                                //Execute the corresponding process for each pdu
                                bufferDecoded.decodedPDUList.forEach(function(decodedPdu){
                                    //If the pdu is a submit_sm response, attach the sent message before callback
                                    //To send all the SM to the connection.
                                    if(decodedPdu.command_id === commands.submit_sm_resp || decodedPdu.command_id === commands.submit_multi_resp){
                                        if(pendingResponseSMList[decodedPdu.sequence_number]){
                                            pendingResponseSMList[decodedPdu.sequence_number].message_id = decodedPdu.message_id;
                                            pendingResponseSMList[decodedPdu.sequence_number].status = decodedPdu.status;
                                            pendingResponseSMList[decodedPdu.sequence_number].no_unsuccess = decodedPdu.no_unsuccess;
                                            pendingResponseSMList[decodedPdu.sequence_number].unsuccess_smes = decodedPdu.unsuccess_smes;
                                            //If command callback is defined execute sending the shortMessage as parameter
                                            if (commandsCallbacks[decodedPdu.command_id]) {
                                                commandsCallbacks[decodedPdu.command_id](pendingResponseSMList[decodedPdu.sequence_number]); //ShortMessage completed
                                            }
                                            //remove from the list to avoid unnecessary increasing
                                            delete pendingResponseSMList[decodedPdu.sequence_number];
                                        }
                                    }
                                    else {
                                        //If command received is a deliver_sm, respond with a deliver_sm_resp
                                        if(decodedPdu.command_id === commands.deliver_sm) {
                                            var seq_num = decodedPdu.sequence_number;
                                            var pdu = pduGenerator.deliver_sm_resp(seq_num);
                                            socket.write(pdu);
                                        }
                                        //If command callback is defined execute
                                        if (commandsCallbacks[decodedPdu.command_id])
                                            commandsCallbacks[decodedPdu.command_id](decodedPdu, smpp);
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
                                //Get the generic_nack pdu and send it to the socket
                                generic_nack(err.status, 0);
                            }
                        });

                        //If keep alive time is greater than 0, activate the enquire link timer
                        if(smpp.keep_alive > 0) {
                            enquire_link_timer = setInterval(function () {
                                var seq_num = sequence.getSequence();
                                var pdu = pduGenerator.enquire_link(seq_num);
                                socket.write(pdu);
                            }, smpp.keep_alive);
                        }

                        //activate the timer for submit messages each second, when available in messageToSubmit array
                        sm_submit_timer = setInterval(function(){
                            //Throughput limit is bigger than zero, splice from 0 to throughput, if not splice all the array
                            //and for each element in the "removed" list, send it to the smsc.
                            (smpp.throughput > 0 ? messagesToSubmit.splice(0, smpp.throughput) : messagesToSubmit.splice(0)).forEach(function(shortMessage){
                                //If smpp is bound send to the smsc
                                if(smpp.isBound) {
                                    var seq_num = sequence.getSequence();
                                    var pdu = pduGenerator.submit_sm(seq_num, shortMessage);
                                    socket.write(pdu);
                                    //save into pendingResponseSM List the shortMessage with the sequence number used as key
                                    pendingResponseSMList[seq_num] = shortMessage;
                                }
                                else{
                                    //If smpp is not Bound, put the message back in the array to be sent later.
                                    messagesToSubmit.push(shortMessage);
                                }
                            });
                        },1000);

                        //Call the promise fulfilled function
                        fulfilled();
                    }
                    else{
                        //Call the promise rejected function
                        rejected(new Error("Connected successfully, but bind failed with error: " + decodedBindPdu.status));
                    }
                }
                catch (err){
                    //If any error decoding binding PDU, send a generic_nack to the pdu originator.
                    console.log(err);

                    //Get the incoming sequence number if exists and can parse it
                    var pduSequenceNumber;
                    if(pdu && pdu.length > 16 && pdu.slice(12, 16).readUInt32BE(0)){
                        pduSequenceNumber = pdu.slice(12, 16).readUInt32BE(0);
                    }

                    //Get the generic_nack pdu and send it to the socket
                    generic_nack(err.status, pduSequenceNumber);
                }
            });
        });

        //Execute this event on socket error
        socket.on('error', function() {
            //release all the resources
            disconnect(smpp);
            rejected(new Error("Couldn't connect to the server: " + host + ":" + port));
        });

        // On socket ending, destroy all pending process
        socket.on('end', function() {
            //release all the resources
            disconnect(smpp);
        });
    });
}

/**
 * Function to send a Generic Nack to the SMSC in case of error.
 * @param smpp
 * @param status
 * @param seq_num
 */
function generic_nack(status, seq_num){
    var pdu = pduGenerator.generic_nack(status, seq_num);
    socket.write(pdu);
}


/**
 * Function to disconnect from server and release all the resources
 * @param smpp
 */
function disconnect(smpp){
    //Change bound flag to false.
    smpp.isBound = false;
    //Stop interval enquire_link timer
    clearInterval(enquire_link_timer);
    clearInterval(sm_submit_timer);
    //Destroy socket connection if exist
    if(socket) {
        socket.destroy();
        socket = null;
        console.log('Disconnected From Server, system_id: %s', smpp.system_id);
    }
}


//Expose the object Smpp
module.exports = Smpp;