/**
 * Created by @dcolonv on 7/9/2015.
 * Publish and manage the SMPP Server connections
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
var socket; //Socket of Net Connection


/**
 * Smpp Object Constructor
 * @constructor
 */
function SmppServer (){
    this.keep_alive = 0;
    this.throughput = 0;
    this.timeout = 60000;
    this.status = constants.conection_status.CLOSED;
}

/**
 * Create a Server to listen any SMSC connection to attend Outbind requests
 * @param port
 * @returns {Promise}
 */
SmppServer.prototype.listen = function(port){
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
 * Close a connection
 */
SmppServer.prototype.disconnect = function(){
    disconnect(this);
};

/**
 * Function to send and Outbind request (Only SMSC send Outbind requests)
 * @param callback
 */
SmppServer.prototype.outbind = function(callback){
    if(this.status === constants.conection_status.OPEN) {
        var seq_num = sequence.getSequence();
        var pdu = pduGenerator.outbind(seq_num, this.system_id, this.password);
        sendPdu(pdu);
        callback();
    }
    else{
        callback(new Error('The connection is ' + this.status + ', and should be OPEN when trying to Outbind'));
    }
};

/**
 * Smpp Unbind Method, send Unbind PDU to the SMSC,
 * on Unbind_resp, disconnect.
 */
SmppServer.prototype.unbind = function(callback){
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
 * Function to add the SM Data pdu to the array to be submitted in the next round.
 * This is used to respect the throughput limit
 * @param dataMessage
 */
SmppServer.prototype.data_sm = function(dataMessage, callback){
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

SmppServer.prototype.bind_receiver_resp = function(sequence_number, status){
    var pdu = pduGenerator.bind_resp(commands.bind_receiver_resp.id, sequence_number, status);
};

/**
 * Assign the event to execute when command is received
 * @param command
 * @param callback
 */
SmppServer.prototype.on = function(command, callback){
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
module.exports = SmppServer;