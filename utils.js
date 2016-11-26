/**
 * Created by @dcolonv on 29/06/2015.
 * Module to manage utilities for string, arrays, buffers, etc.
 */
var constants = require('./constants');

/**
 * Returns a new null buffer
 * @returns {Buffer}
 */
exports.nullBuffer = function(){
    return new Buffer([constants.NULL_OCTET]);
};

/**
 * Convert a ASCII string into a buffer, with C-Octet format
 * @param str
 * @param nullAttached
 * @returns {*}
 */
exports.convertStringToOctetBuffer = function(str, nullAttached){
    //Create a new buffer, with string or empty if undefined
    var bufferOctet = new Buffer(str || '');
    if(nullAttached === constants.NULL_OCTET)
        //Get the buffer of the text and attach the null ending.
        return Buffer.concat([bufferOctet, new Buffer([nullAttached])]);
    //if bufferOctet length is greater than zero return it, if not return 0x00 (null) buffer.
    return bufferOctet.length > 0 ? bufferOctet : new Buffer([constants.NULL_OCTET]);
};
/**
 * Convert an Integer into a buffer
 * @param num
 * @param width with the length in bytes 2 bytes = 1 octet
 * @returns {Buffer}
 */
exports.convertIntToOctetBuffer = function(num, width){
    width = width || 2;
    num = num || 0;
    var padStr = zeroLeftPadding(num.toString(16), width);
    var octetArray = [];
    for(var i = 0; i < padStr.length; i += 2) {
        octetArray.push('0x' + padStr.substr(i, 2));
    }
    return new Buffer(octetArray);
};

/**
 * Convert a Buffer and Tag into a TLV Octet
 * @param tag
 * @param buffer
 * @returns {Array.<T>|string}
 */
exports.convertTagBufferToTLVOctetBuffer = function(tag, buffer){
    //if buffer is not undefined and length is more than 0
    if(buffer && buffer.length > 0) {
        var tagOctet = this.convertIntToOctetBuffer(tag, 4); //4 bytes = 2 octets
        var valueOctet = this.convertIntToOctetBuffer(buffer.length, 4); //4 bytes = 2 octets

        return Buffer.concat([tagOctet, valueOctet, buffer]);
    }
};


/**
 * Read the buffer until find a null 0x00 octet, or size is reached, in case of not having the corresponding length return undefined
 * Return a Number from COctet and the last position read of the buffer until the size
 * @param buffer
 * @param size
 * @returns {*}
 */
exports.convertOctetBufferToInt = function(buffer, size){
    if(buffer[0] === constants.NULL_OCTET){
        return {
            value: 0,
            lastIndex: 1
        }
    }
    else if(buffer.length >= size){

        return {
            value: size > 1 ? (size > 2 ? buffer.slice(0, size).readUInt32BE(0) : buffer.slice(0, size).readUInt16BE(0)) : buffer.slice(0, size).readUInt8(0),
            lastIndex: size
        }
    }
};

/**
 * Read the buffer until find a null 0x00 octet, in case of not finding the octet return undefined
 * Return string from COctet and the last position read of the buffer
 * @param buffer
 * @returns {{value: string, lastIndex: (number|*)}}
 */
exports.convertOctetBufferToString = function(buffer){
    for(i = 0; i < buffer.length; i++){
        if(buffer[i] === constants.NULL_OCTET){
            return {
                value: buffer.slice(0, i).toString(),
                lastIndex: i+1 //Plus 1 because is the last index read
            }
        }
    }
};

/**
 * Read the buffer until find a null 0x00 octet, or size is reached, in case of not having the corresponding length return undefined
 * Return string from COctet and the last position read of the buffer until the size
 * @param buffer
 * @param size
 * @returns {*}
 */
exports.convertOctetFixedBufferToString = function(buffer, size){
    if(buffer[0] === constants.NULL_OCTET || !size){
        return {
            value: '',
            lastIndex: 1 //1 because is the last index read of this part of the buffer
        }
    }
    else if(buffer.length >= size) {
        return {
            value: buffer.slice(0, size).toString(),
            lastIndex: size + 1 //Plus 1 because is the last index read
        }
    }
};

/**
 * Decode PDU TLV fields from Octets and return the decoded fields plus the last index for reference to next TLV field
 * @param buffer
 * @returns {{tag: *, length: *, value: string, lastIndex: *}}
 */
exports.convertOctetBufferToTLV = function(buffer){
    //PDU TLV
    var tag = buffer.slice(0, 2).readUInt16BE(0);
    var length = buffer.slice(2, 4).readUInt16BE(0);
    var lastIndex = 4 + length;
    return {
        tag_id: tag,
        length: length,
        value: buffer.slice(4, lastIndex),
        lastIndex: lastIndex
    }
};


/**
 * Completes with zero the with of the string.
 * @param str
 * @param width
 * @returns {string}
 */
function zeroLeftPadding(str, width){
    return new Array(width + 1 - str.length).join('0') + str;
}
