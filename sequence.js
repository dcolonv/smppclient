/**
 * Created by @dcolonv on 29/06/2015.
 * Module to manage SMPP request sequence number
 */
var sequence = 1;
var request_control = {};

module.exports.getSequence = function(){
    return sequence++;
};

module.exports.setRequestControl = function(seq, pdu){
    request_control[seq] = pdu;
};

module.exports.getRequestControl = function(seq){
    return request_control[seq];
};

module.exports.removeRequestControl = function(seq){
    request_control.remove(seq);
};

