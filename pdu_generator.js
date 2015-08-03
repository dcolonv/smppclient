/**
 * Created by @dcolonv on 27/06/2015.
 * Smpp PDU Generator
 */
var utils = require('./utils');
var tags = require('./tags');
var commands = require('./commands');

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

    var octet_system_id = utils.convertStringToOctetBuffer(system_id, '0x00');
    var octet_password = utils.convertStringToOctetBuffer(password, '0x00');
    var octet_system_type = utils.convertStringToOctetBuffer(system_type, '0x00');
    var octet_interface_version = utils.convertIntToOctetBuffer(interface_version);
    var octet_addr_ton = utils.convertIntToOctetBuffer(addr_ton);
    var octet_addr_npi = utils.convertIntToOctetBuffer(addr_npi);
    var octet_address_range = utils.convertStringToOctetBuffer(address_range, '0x00');

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
 * @param smpp
 * @param seq_num
 * @returns {Array.<T>|string}
 */
exports.enquire_link = function(seq_num){
    var pdu_header = getPduHeader(commands.enquire_link, 0, seq_num);
    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 4), 8); //8 bytes = 4 octets
    return Buffer.concat([command_length, pdu_header]);
};

/**
 * Exports Unbind Pdu Generator
 * @param smpp
 * @param seq_num
 */
exports.unbind = function(seq_num){
    var pdu_header = getPduHeader(commands.unbind, 0, seq_num);
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
    var pdu_header = getPduHeader(commands.generic_nack, status || 8, seq_num || 0);
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
    var pdu_header = getPduHeader(commands.submit_sm, 0, seq_num);

    var octet_service_type = utils.convertStringToOctetBuffer(shortMessage.service_type, '0x00');
    var octet_source_addr_ton = utils.convertIntToOctetBuffer(shortMessage.source_addr_ton);
    var octet_source_addr_npi = utils.convertIntToOctetBuffer(shortMessage.source_addr_npi);
    var octet_source_addr = utils.convertStringToOctetBuffer(shortMessage.source_addr, '0x00');

    //variable to get all the buffer part corresponding to destination address
    var octet_dest_addr = new Buffer('');

    //If destination addresses list length is greater than 1 or if is 1 but is distribution list, create the PDU as Submit_Multi
    if(shortMessage.dest_addresses.length > 1 || shortMessage.dest_addresses[0].type === 'DistributionList') {
        //Change the header
        pdu_header = getPduHeader(commands.submit_multi, 0, seq_num);
        //Set number of dests, field only present if is submit_multi pdu
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses.length)]);
        //build the destination addresses from the dest_addresses list
        for(var i=0; i<shortMessage.dest_addresses.length; i++){
            //if is a distribution list name, only attach the value 2 and the destination list name
            if(shortMessage.dest_addresses[i].type === 'DistributionList'){
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(2)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertStringToOctetBuffer(shortMessage.dest_addresses[i].dl_name, '0x00')]);
            }
            else{
                //otherwise attach the number 1 (indicating is a SME address and attach the address.
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(1)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses[i].dest_addr_ton)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addresses[i].dest_addr_npi)]);
                octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertStringToOctetBuffer(shortMessage.dest_addresses[i].destination_addr, '0x00')]);
            }
        }

    }
    else{
        //If only one sme address as destination
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addr_ton)]);
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertIntToOctetBuffer(shortMessage.dest_addr_npi)]);
        octet_dest_addr = Buffer.concat([octet_dest_addr, utils.convertStringToOctetBuffer(shortMessage.destination_addr, '0x00')]);
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

    var optionalsTLV = {};

    //if short message is longer than 254 octets, it is sent into payload_message and sm_length in zero
    if(octet_short_message.length > 254){
        //set sm_length in zero
        octet_sm_length = utils.nullBuffer();
        //set the optionalTLV message payload with the message
        optionalsTLV.message_payload = utils.convertTagBufferToTLVOctetBuffer(tags.message_payload, octet_short_message);
        //set short_message in null
        octet_short_message = utils.nullBuffer();
    }
    //For each Tag in Optional parameters assign the octet tlv with corresponding tag
    for(var tag in shortMessage.optionals){
        //Convert into TLV OctetBuffer the Tag and the Value
        if(shortMessage.optionals[tag])
            optionalsTLV[tag] = utils.convertTagBufferToTLVOctetBuffer(tags[tag], utils.convertStringToOctetBuffer(shortMessage.optionals[tag]));
    }

    //Create the pdu body with mandatory fields
    var pdu_body = Buffer.concat([octet_service_type, octet_source_addr_ton, octet_source_addr_npi, octet_source_addr,
        octet_dest_addr, octet_esm_class, octet_protocol_id, octet_priority_flag,
        octet_schedule_delivery_time, octet_validity_period, octet_registered_delivery, octet_replace_if_present_flag,
        octet_data_coding, octet_sm_default_msg_id, octet_sm_length, octet_short_message]);
    //For each Tag in Optional TLV parameters attach the tlv to the pdu_body
    for(var tag in optionalsTLV){
        pdu_body = Buffer.concat([pdu_body, optionalsTLV[tag]]);
    }

    //Length is the length of the header plus the length of the body plus 4 (integer corresponding to the length of the command)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + pdu_body.length + 4), 8); //8 bytes = 4 octets

    //Attach the length of the pdu and returned the bind_receiver pdu
    return Buffer.concat([command_length, pdu_header, pdu_body]);
};

exports.deliver_sm_resp = function(seq_num){
    var pdu_header = getPduHeader(commands.deliver_sm_resp, 0, seq_num);
    //This field is unused and is set to NULL
    var messageId = utils.nullBuffer(); //0x00
    //Length is the length of the header plus the length of the body plus 5 (integer corresponding to the length of the command + 0x00 of messageId)
    var command_length = utils.convertIntToOctetBuffer((pdu_header.length + 5), 8); //8 bytes = 4 octets
    return Buffer.concat([command_length, pdu_header, messageId]);
};

/**
 * Function to Get Common Header PDU
 * @param command_id
 * @param command_status_
 * @returns {Array.<T>|string}
 */
function getPduHeader(command_id, command_status, seq_num){
    var octet_command_id = utils.convertIntToOctetBuffer(command_id, 8); //8 bytes = 4 octets
    var octet_command_status = utils.convertIntToOctetBuffer(command_status, 8); //8 bytes = 4 octets
    var octet_sequence_number = utils.convertIntToOctetBuffer(seq_num, 8); //8 bytes = 4 octets
    return Buffer.concat([octet_command_id, octet_command_status, octet_sequence_number]);
}