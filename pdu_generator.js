/**
 * Created by @dcolonv on 27/06/2015.
 * Smpp PDU Generator
 */
var utils = require('./utils');
var tags = require('./tags');
var commands = require('./commands');
var constants = require('./constants');

/**
 * * Generic Bind method
 * @param command_id '01' = Bind Receiver, '02' = Bind Transmitter, '09' = Bind Transceiver
 * @param seq_num
 * @param system_id
 * @param password
 * @param system_type
 * @param interface_version
 * @param addr_ton
 * @param addr_npi
 * @param address_range
 * @returns {Array.<T>|string}
 */
exports.bind = function (command_id, seq_num, system_id, password, system_type, interface_version, addr_ton, addr_npi, address_range){
    var pdu_header = getPduHeader(command_id, 0, seq_num);

    var octet_system_id = utils.convertStringToOctetBuffer(system_id, constants.NULL_OCTET);
    var octet_password = utils.convertStringToOctetBuffer(password, constants.NULL_OCTET);
    var octet_system_type = utils.convertStringToOctetBuffer(system_type, constants.NULL_OCTET);
    var octet_interface_version = utils.convertIntToOctetBuffer(interface_version);
    var octet_addr_ton = utils.convertIntToOctetBuffer(addr_ton);
    var octet_addr_npi = utils.convertIntToOctetBuffer(addr_npi);
    var octet_address_range = utils.convertStringToOctetBuffer(address_range, constants.NULL_OCTET);

    //Create the body of the pdu with all the mandatory octets
    var pdu_body = Buffer.concat([octet_system_id, octet_password,
        octet_system_type, octet_interface_version, octet_addr_ton, octet_addr_npi, octet_address_range]);

    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + pdu_body.length + 4), 8); //8 bytes = 4 octets

    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header, pdu_body]);
};

/**
 * Export Enquire Link Pdu Generator
 * @param seq_num
 * @returns {Array.<T>|string}
 */
exports.enquire_link = function(seq_num){
    var pdu_header = getPduHeader(commands.enquire_link.id, 0, seq_num);
    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 4), 8); //8 bytes = 4 octets
    return Buffer.concat([command_length, pdu_header]);
};

/**
 * Export Outbind Pdu Generator
 * @param seq_num
 * @returns {Array.<T>|string}
 */
exports.outbind = function(seq_num, system_id, password){
    var pdu_header = getPduHeader(commands.outbind.id, 0, seq_num);

    var octet_system_id = utils.convertStringToOctetBuffer(system_id, constants.NULL_OCTET);
    var octet_password = utils.convertStringToOctetBuffer(password, constants.NULL_OCTET);

    //Create the body of the pdu with all the mandatory octets
    var pdu_body = Buffer.concat([octet_system_id, octet_password]);

    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + pdu_body.length + 4), 8); //8 bytes = 4 octets
    //Attach the length of the pdu and returned the outbind pdu
    return Buffer.concat([command_length, pdu_header, pdu_body]);
};

/**
 * Exports Unbind Pdu Generator
 * @param seq_num
 * @returns {Array.<T>|string}
 */
exports.unbind = function(seq_num){
    var pdu_header = getPduHeader(commands.unbind.id, 0, seq_num);
    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 4), 8); //8 bytes = 4 octets
    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header]);
};

/**
 * Exports Generic Nack Pdu Generator
 * @param status
 * @param seq_num
 * @returns {Array.<T>|string}
 */
exports.generic_nack = function(status, seq_num){
    //If status is undefined assign 8 as default, meaning ESME_RSYSERR, System Error
    //If sequence number is undefined, assign 0 as default.
    var pdu_header = getPduHeader(commands.generic_nack.id, status || 8, seq_num || 0);
    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 4), 8); //8 bytes = 4 octets
    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header]);
};

/**
 * Exports Submit_Sm Pdu Generator
 * @param seq_num
 * @param shortMessage
 * @returns {Array.<T>|string}
 */
exports.submit_sm = function(seq_num, shortMessage){
    var pdu_header = getPduHeader(commands.submit_sm.id, 0, seq_num);

    var octet_service_type = utils.convertStringToOctetBuffer(shortMessage.service_type, constants.NULL_OCTET);
    var octet_source_addr_ton = utils.convertIntToOctetBuffer(shortMessage.source_addr_ton);
    var octet_source_addr_npi = utils.convertIntToOctetBuffer(shortMessage.source_addr_npi);
    var octet_source_addr = utils.convertStringToOctetBuffer(shortMessage.source_addr, constants.NULL_OCTET);

    //variable to get all the buffer part corresponding to destination address
    var octet_dest_addr = new Buffer('');

    //If destination addresses list length is greater than 1 or if is 1 but is distribution list, create the PDU as Submit_Multi
    if(shortMessage.dest_addresses.length > 1 || shortMessage.dest_addresses[0].type === constants.object_types.DISTRIBUTION_LIST) {
        //Change the header
        pdu_header = getPduHeader(commands.submit_multi.id, 0, seq_num);
        //Set number of dests, field only present if is submit_multi pdu
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses.length)]);
        //build the destination addresses from the dest_addresses list
        for(var i=0; i<shortMessage.dest_addresses.length; i++){
            //if is a distribution list name, only attach the value 2 and the destination list name
            if(shortMessage.dest_addresses[i].type === constants.object_types.DISTRIBUTION_LIST){
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(2)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertStringToOctetBuffer(shortMessage.dest_addresses[i].dl_name, constants.NULL_OCTET)]);
            }
            else{
                //otherwise attach the number 1 (indicating is a SME address and attach the address.
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(1)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses[i].dest_addr_ton)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses[i].dest_addr_npi)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertStringToOctetBuffer(shortMessage.dest_addresses[i].destination_addr, constants.NULL_OCTET)]);
            }
        }

    }
    else if(shortMessage.dest_addresses[0]){
        //If only one sme address as destination
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses[0].dest_addr_ton)]);
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses[0].dest_addr_npi)]);
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertStringToOctetBuffer(shortMessage.dest_addresses[0].destination_addr, constants.NULL_OCTET)]);
    }

    var octet_esm_class = utils.convertIntToOctetBuffer(shortMessage.esm_class);
    var octet_protocol_id = utils.convertIntToOctetBuffer(shortMessage.protocol_id);
    var octet_priority_flag = utils.convertIntToOctetBuffer(shortMessage.priority_flag);
    var octet_schedule_delivery_time = utils.convertStringToOctetBuffer(shortMessage.schedule_delivery_time);
    var octet_validity_period = utils.convertStringToOctetBuffer(shortMessage.validity_period);
    var octet_registered_delivery = utils.convertIntToOctetBuffer(shortMessage.registered_delivery);
    var octet_replace_if_present_flag = utils.convertIntToOctetBuffer(shortMessage.replace_if_present_flag);
    var octet_data_coding = utils.convertIntToOctetBuffer(shortMessage.data_coding);
    var octet_sm_default_msg_id = utils.convertIntToOctetBuffer(shortMessage.sm_default_msg_id);
    var octet_short_message = utils.convertStringToOctetBuffer(shortMessage.short_message);
    var octet_sm_length = utils.convertIntToOctetBuffer(octet_short_message.length);

    //variable to get all the buffer part corresponding to optionals tags
    var octet_optionals = new Buffer('');

    var optionalsTLV = {};

    //if short message is longer than 254 octets, it is sent into payload_message and sm_length in zero
    if(octet_short_message.length > 254){
        //set sm_length in zero
        octet_sm_length = utils.nullBuffer();
        //set short_message in null
        octet_short_message = utils.nullBuffer();
        //set the optionalTLV message payload with the message
        octet_optionals = Buffer.concat([octet_optionals, utils.convertTagBufferToTLVOctetBuffer(tags.message_payload, octet_short_message)]);
    }

    //For each Tag in Optional parameters assign the octet tlv with corresponding tag
    for(var tag in shortMessage.optionals){
        //Checks if shortMessage optional property contains value different to Empty, Undefined or Zero.
        if(shortMessage.optionals[tag])
            //Convert into TLV OctetBuffer the Tag and the Value
            octet_optionals = Buffer.concat([octet_optionals, utils.convertTagBufferToTLVOctetBuffer(tags[tag], utils.convertStringToOctetBuffer(shortMessage.optionals[tag]))]);
    }

    //Create the pdu body with mandatory fields
    var pdu_body = Buffer.concat([octet_service_type, octet_source_addr_ton, octet_source_addr_npi, octet_source_addr,
        octet_dest_addr, octet_esm_class, octet_protocol_id, octet_priority_flag,
        octet_schedule_delivery_time, octet_validity_period, octet_registered_delivery, octet_replace_if_present_flag,
        octet_data_coding, octet_sm_default_msg_id, octet_sm_length, octet_short_message, octet_optionals]);


    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + pdu_body.length + 4), 8); //8 bytes = 4 octets

    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header, pdu_body]);
};

/**
 * Exports Data_Sm Pdu Generator
 * @param seq_num
 * @param dataMessage
 * @returns {Array.<T>|string}
 */
exports.data_sm = function(seq_num, dataMessage){
    var pdu_header = getPduHeader(commands.data_sm.id, 0, seq_num);

    var octet_service_type = utils.convertStringToOctetBuffer(dataMessage.service_type, constants.NULL_OCTET);
    var octet_source_addr_ton = utils.convertIntToOctetBuffer(dataMessage.source_addr_ton);
    var octet_source_addr_npi = utils.convertIntToOctetBuffer(dataMessage.source_addr_npi);
    var octet_source_addr = utils.convertStringToOctetBuffer(dataMessage.source_addr, constants.NULL_OCTET);
    var octet_dest_addr_ton = utils.convertIntToOctetBuffer(dataMessage.dest_addr_ton);
    var octet_dest_addr_npi = utils.convertIntToOctetBuffer(dataMessage.dest_addr_npi);
    var octet_destination_addr = utils.convertStringToOctetBuffer(dataMessage.destination_addr, constants.NULL_OCTET);
    var octet_esm_class = utils.convertIntToOctetBuffer(dataMessage.esm_class);
    var octet_registered_delivery = utils.convertIntToOctetBuffer(dataMessage.registered_delivery);
    var octet_data_coding = utils.convertIntToOctetBuffer(dataMessage.data_coding);

    //variable to get all the buffer part corresponding to optionals tags
    var octet_optionals = new Buffer('');

    //For each Tag in Optional parameters assign the octet tlv with corresponding tag
    for(var tag in dataMessage.optionals){
        //Checks if shortMessage optional property contains value different to Empty, Undefined or Zero.
        if(dataMessage.optionals[tag])
            //Convert into TLV OctetBuffer the Tag and the Value
            octet_optionals = Buffer.concat([octet_optionals, utils.convertTagBufferToTLVOctetBuffer(tags[tag], utils.convertStringToOctetBuffer(dataMessage.optionals[tag]))]);
    }

    //Create the pdu body with mandatory fields
    var pdu_body = Buffer.concat([octet_service_type, octet_source_addr_ton, octet_source_addr_npi, octet_source_addr,
        octet_dest_addr_ton, octet_dest_addr_npi, octet_destination_addr, octet_esm_class, octet_registered_delivery,
        octet_data_coding, octet_optionals]);

    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + pdu_body.length + 4), 8); //8 bytes = 4 octets

    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header, pdu_body]);
};

/**
 * Exports Deliver_SM_Response Pdu Generator
 * @param seq_num
 * @returns {Array.<T>|string}
 */
exports.deliver_sm_resp = function(seq_num){
    var pdu_header = getPduHeader(commands.deliver_sm_resp.id, 0, seq_num);
    //This field is unused and is set to NULL
    var messageId = utils.nullBuffer(); //0x00
    //Length is the length of the header plus the length of the body plus 5 (integer corresponding to the length of the command + 0x00 of messageId)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 5), 8); //8 bytes = 4 octets
    return Buffer.concat([command_length, pdu_header, messageId]);
};

exports.unbind_resp = function(seq_num){
    var pdu_header = getPduHeader(commands.unbind_resp.id, 0, seq_num);
    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 4), 8); //8 bytes = 4 octets
    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header]);
};

/**
 * Function to Get Common Header PDU
 * @param command_id
 * @param command_status
 * @param seq_num
 * @returns {Array.<T>|string}
 */
function getPduHeader(command_id, command_status, seq_num){
    var octet_command_id = utils.convertIntToOctetBuffer(command_id, 8); //8 bytes = 4 octets
    var octet_command_status = utils.convertIntToOctetBuffer(command_status, 8); //8 bytes = 4 octets
    var octet_sequence_number = utils.convertIntToOctetBuffer(seq_num, 8); //8 bytes = 4 octets
    return Buffer.concat([octet_command_id, octet_command_status, octet_sequence_number]);
}
