/**
 * Created by @dcolonv on 29/06/2015.
 * Module to manage utilities for string, arrays, buffers, etc.
 */

/**
 * Convert a ASCII string into a buffer, with C-Octet format
 * @param str
 * @param nullAttached
 * @returns {*}
 */
exports.convertStringToOctetBuffer = function(str, nullAttached){
    //Create a new buffer, with string or empty if undefined
    var bufferOctet = new Buffer(str || '');
    if(nullAttached)
        //Get the buffer of the text and attach the null ending.
        return Buffer.concat([bufferOctet, new Buffer([nullAttached])]);
    //if bufferOctet length is greater than zero return it, if not return 0x00 (null) buffer.
    return bufferOctet.length > 0 ? bufferOctet : new Buffer(['0x00']);
};

/**
 * Returns a new null buffer
 * @returns {Buffer}
 */
exports.nullBuffer = function(){
    return new Buffer(['0x00']);
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
 * Completes with zero the with of the string.
 * @param str
 * @param width
 * @returns {string}
 */
function zeroLeftPadding(str, width){
    return new Array(width + 1 - str.length).join('0') + str;
}
