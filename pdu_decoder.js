/**
 * Created by @dcolonv on 29/06/2015.
 * Module to Decode an SMPP PDU
 */
var commands = require('./commands');
var tags = require('./tags');
var commandDef = require('./command_definition');
var tagDef = require('./tag_definition');

/**
 * Parse a buffer and return parsed pduList and any pduSplitPacket
 * @param buffer
 * @param pduSplitPacket
 */
exports.parseBuffer = function(buffer, pduSplitPacket){
    var decodedPDUList = [];
    var errorList = [];
    //If pduSplitPacket contains any previous split package, attached at the beginning of the buffer
    if(pduSplitPacket && pduSplitPacket.length > 0){
        buffer = Buffer.concat([pduSplitPacket, buffer]);
        pduSplitPacket = null;
    }

    //Keep reading PDU parts until no more parts to read in the buffer, less than 16 bytes (8 octets)
    while(buffer.length >= 16) {
        var decodedPDU = {};
        //Read PDU Header mandatory on every pdu
        decodedPDU.command_length = buffer.slice(0, 4).readUInt32BE(0);
        decodedPDU.command_id = buffer.slice(4, 8).readUInt32BE(0);
        decodedPDU.status = buffer.slice(8, 12).readUInt32BE(0);
        decodedPDU.sequence_number = buffer.slice(12, 16).readUInt32BE(0);

        //If buffer length is less than the command length, assign the buffer as a split pdu packet
        //the buffer is deleted to close the cycle
        if(buffer.length < decodedPDU.command_length){
            pduSplitPacket = buffer;
            buffer = new Buffer(0);
        }
        else {
            //Get the command name by the command_id
            var commandName = commands.getCommandNameById(decodedPDU.command_id);
            //If command_id is not recognized
            //return err.status = 03, meaning Invalid Command ID
            if (!commandName) {
                var err = new Error('Command Id: ' + decodedPDU.command_id + ' is and unknown or invalid command_id');
                err.status = '03';
                err.sequence_number = decodedPDU.sequence_number;
                errorList.push(err);
            }
            //if command_length is greater than 16 it means the pdu has a body to read
            else if(decodedPDU.command_length > 16){
                //Separate the part of the buffer to work with
                decodedPDU.body = buffer.slice(16, decodedPDU.command_length);
                //Variable to control the last position read from the buffer (decodedPdu.body)
                decodedPDU.lastIndex = 0;
                //Looking for each of the command pdu mandatory fields, defined in command_definition
                commandDef[commandName].forEach(function(field){
                    //If field type is complex, do an internal loop for each sub field, create a list and attached to the decodedPDU
                    if (field.type === 'Complex'){
                        //Complex is a field with a variable number of different fields and previous types inside
                        var subDecodedPdu = {};
                        //If decoded pdu already has the complex size indicator number, use it.
                        if(typeof decodedPDU[field.size_indicator] === 'number') {
                            //initialize the field as an array in the decoded pdu
                            decodedPDU[field.name] = [];
                            for(var i = decodedPDU[field.size_indicator]; i-->0;){
                                field.sub_fields.forEach(function (subField) {
                                    decodeField(subField, subDecodedPdu);
                                });
                                decodedPDU[field.name].push(subDecodedPdu);
                            }
                        }
                    }
                    else {
                        //Otherwise just decode the field an attach to the decodedPDU
                        decodeField(field, decodedPDU);
                    }
                });

                //Read TLV Optional Fields
                //Read only if body part after read mandatory fields length is greater than 4, because only the tag and the length are 2 octets each.
                while(decodedPDU.body.slice(decodedPDU.lastIndex).length > 4){
                    var tlvObject = decodeTLVString(decodedPDU.body.slice(decodedPDU.lastIndex));
                    if(tlvObject){
                        var tagName = tags.getTagNameById(tlvObject.tag_id);
                        if(tagName) {
                            if(tagDef[tagName].type === 'Integer'){
                                decodedPDU[tagName] = tlvObject.value.readUInt32BE(0);
                            }
                            else {
                                decodedPDU[tagName] = decodeCOctetFixedString(tlvObject.value, tlvObject.length).value;
                            }
                            decodedPDU.lastIndex += tlvObject.lastIndex;
                        }
                    }
                }
            }

            //If PDU complete assign to the array of received PDU decoded, if not assign the pdu to the splitPduPacket variable
            decodedPDUList.push(decodedPDU);

            //assign to the buffer, the next part of the buffer after the just read pdu length
            buffer = buffer.slice(decodedPDU.command_length);
        }
    }

    //If the pdu has something after reading all the pieces, returned as a split packet, to be attached to the next incoming pdu
    if(buffer.length > 0){
        pduSplitPacket = buffer;
    }

    //Return the object with the decoded pdu list, the incomplete pdu and the list of error reading the packages
    return {decodedPDUList: decodedPDUList, pduSplitPacket: pduSplitPacket, errorList: errorList};
};

/**
 * Decode the field and attach it with the name of the field to the decodedPDU
 * as a referenced variable decodedPDU doesn't need to be returned.
 * @param field
 * @param decodedPDU
 */
function decodeField(field, decodedPDU){
    if (field.type === 'Integer') {
        //Integer has a fixed length, the buffer part from last index read to field.size
        var intObject = decodeInteger(decodedPDU.body.slice(decodedPDU.lastIndex), field.size);
        if(intObject) {
            decodedPDU[field.name] = intObject.value;
            decodedPDU.lastIndex += intObject.lastIndex;
        }
    }
    else if (field.type === 'C-Octet') {
        //C-Octet is read until a null byte is found (0x00)
        var cOctetObject = decodeCOctetString(decodedPDU.body.slice(decodedPDU.lastIndex));
        if (cOctetObject) {
            decodedPDU[field.name] = cOctetObject.value;
            decodedPDU.lastIndex += cOctetObject.lastIndex;
        }
    }
    else if (field.type === 'C-Octet-Fixed') {
        //Size is the size indicator of the field or the field size indicated in the definition.
        var size = decodedPDU[field.size_indicator] || field.size;
        //C-Octet-Fixed is zero or the size indicated
        var cOctetObject = decodeCOctetFixedString(decodedPDU.body.slice(decodedPDU.lastIndex), size);
        if (cOctetObject) {
            decodedPDU[field.name] = cOctetObject.value;
            decodedPDU.lastIndex += cOctetObject.lastIndex;
        }
    }
}

/**
 * Read the buffer until find a null 0x00 octet, or size is reached, in case of not having the corresponding length return undefined
 * Return a Number from COctet and the last position read of the buffer until the size
 * @param buffer
 * @param size
 * @returns {*}
 */
function decodeInteger(buffer, size){
    if(buffer[0] === 0x00){
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
}

/**
 * Read the buffer until find a null 0x00 octet, in case of not finding the octet return undefined
 * Return string from COctet and the last position read of the buffer
 * @param buffer
 * @returns {{value: string, lastIndex: (number|*)}}
 */
function decodeCOctetString(buffer){
    for(i = 0; i < buffer.length; i++){
        if(buffer[i] === 0x00){
            return {
                value: buffer.slice(0, i).toString(),
                lastIndex: i+1 //Plus 1 because is the last index read
            }
        }
    }
}

/**
 * Read the buffer until find a null 0x00 octet, or size is reached, in case of not having the corresponding length return undefined
 * Return string from COctet and the last position read of the buffer until the size
 * @param buffer
 * @returns {{value: string, lastIndex: (number|*)}}
 */
function decodeCOctetFixedString(buffer, size){
    if(buffer[0] === 0x00){
        return {
            value: buffer[0].toString(),
            lastIndex: 1 //1 because is the last index read of this part of the buffer
        }
    }
    else if(buffer.length >= size) {
        return {
            value: buffer.slice(0, size).toString(),
            lastIndex: size + 1 //Plus 1 because is the last index read
        }
    }
}

/**
 * Decode PDU TLV fields from Octets and return the decoded fields plus the last index for reference to next TLV field
 * @param buffer
 * @returns {{tag: *, length: *, value: string, lastIndex: *}}
 */
function decodeTLVString(buffer){
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
}
