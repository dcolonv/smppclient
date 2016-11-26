/**
 * Created by @dcolonv on 03/07/2015.
 * Module to manage SMPP Commands object
 * Each command contains the id and its mandatory fields
 * Note on fields types:
 *      C-Octet: Is always size variable and the specified size is the max length permitted by the SMPP definition
 *      C-Octet-Fixed: Is always zero filled and the specified size is the fixed length. In case of no value is 0x00 null
 *      TLV: Tag Length Value:
 *         Tag: 4 bytes = 2 Octets (Identify the particular optional parameter)
 *         Length: 4 bytes = 2 Octets (The length of the value *not include length of the Tag and Length)
 *         Value: Variable
 */
var constants = require('./constants');

var fields = {
    //Identifies the ESME system
    system_id: {
        name: 'system_id',
        size: 16,
        type: constants.pdu_fields_types.C_OCTET
    },
    //The password may be used for security reasons to authenticate
    password: {
        name: 'password',
        size: 9,
        type: constants.pdu_fields_types.C_OCTET
    },
    //This field contains the SMSC message ID of the submitted message.
    //It may be used at a later stage to query the status of a message, cancel o replace the message
    //Is not returned if the command_status field is a non-zero value
    message_id: {
        name: 'message_id',
        size: 65,
        type: constants.pdu_fields_types.C_OCTET
    },
    //The number of messages to destination SME addresses that were unsuccessfully submitted to the SMSC.
    no_unsuccess: {
        name: 'no_unsuccess',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Type of number for destination SME
    dest_addr_ton: {
        name: 'dest_addr_ton',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Numbering Plan Indicator for destination SME
    dest_addr_npi: {
        name: 'dest_addr_npi',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Destination Address of destination SME
    destination_addr: {
        name: 'destination_addr',
        size: 21,
        type: constants.pdu_fields_types.C_OCTET
    },
    //Type of Number for source address
    source_addr_ton: {
        name: 'source_addr_ton',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Numbering Plan Indicator for source, if not known, set to NULL (Unknown)
    source_addr_npi: {
        name: 'source_addr_npi',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Address of SME which originated the message, if not known, set to NULL (Unknown)
    source_addr: {
        name: 'source_addr',
        size: 21,
        type: constants.pdu_fields_types.C_OCTET
    },
    //Indicates the success of failure of the submit_multi request to this SME address
    error_status_code: {
        name: 'error_status_code',
        size: 2,
        type: constants.pdu_fields_types.INTEGER
    },
    //Complex field, contains one or more (no_unsuccess quantity) SME Addresses or Distribution List Names to which submission was unsuccessful
    unsuccess_smes: {
        name: 'unsuccess_smes',
        type: constants.pdu_fields_types.COMPLEX,
        size_indicator: 'no_unsuccess',
        sub_fields: ['dest_addr_ton', 'dest_addr_npi', 'destination_addr', 'error_status_code']
    },
    //The service_type parameter can be used to indicate the SMS Application service associated with the message.
    service_type: {
        name: 'service_type',
        size: 6,
        type: constants.pdu_fields_types.C_OCTET
    },
    //Indicates Message Type and enhance network services
    esm_class: {
        name: 'esm_class',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Protocol identifier, Network specific field
    protocol_id: {
        name: 'protocol_id',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Designates the priority level of the message
    priority_flag: {
        name: 'priority_flag',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //This field is unused for deliver_sm. It must be set to NULL
    schedule_delivery_time: {
        name: 'schedule_delivery_time',
        size: 1,
        type: constants.pdu_fields_types.C_OCTET
    },
    //This field is unused for deliver_sm. It must be set to NULL
    validity_period: {
        name: 'validity_period',
        size: 1,
        type: constants.pdu_fields_types.C_OCTET
    },
    //Indicates if an ESME acknowledgement is required
    registered_delivery: {
        name: 'registered_delivery',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //This field is unused for deliver_sm. It must be set to NULL
    replace_if_present_flag: {
        name: 'registered_delivery',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Indicates the encoding scheme of the short message
    data_coding: {
        name: 'data_coding',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //This field is unused for deliver_sm. It must be set to NULL
    sm_default_msg_id: {
        name: 'sm_default_msg_id',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Length of short message user data in octets
    sm_length: {
        name: 'sm_length',
        size: 1,
        type: constants.pdu_fields_types.INTEGER
    },
    //Up to 254 octets of short message user data, when sending messages longer than 254 octets then message_payload
    //parameter should be used and the sm_length and short_message parameter should be set to zero or Null 0x00
    short_message: {
        name: 'short_message',
        size_indicator: 'sm_length',
        type: constants.pdu_fields_types.C_OCTET_FIXED
    }
};

module.exports = {
    generic_nack: {
        id: 2147483648 //80000000
    },
    bind_receiver: {
        id: 1 //00000001
    },
    bind_receiver_resp: {
        id: 2147483649, //80000001,
        fields: [fields.system_id]
    },
    bind_transmitter: {
        id: 2 //00000002
    },
    bind_transmitter_resp: {
        id: 2147483650, //80000002
        fields: [fields.system_id]
    },
    bind_transceiver: {
        id: 9 //00000009
    },
    bind_transceiver_resp: {
        id: 2147483657, //80000009
        fields: [fields.system_id]
    },
    enquire_link: {
        id: 21 //00000015
    },
    enquire_link_resp: {
        id: 2147483669 //80000015
    },
    outbind: {
        id: 11, //0000000B,
        fields: [fields.system_id, fields.password]
    },
    unbind: {
        id: 6 //00000006
    },
    unbind_resp: {
        id: 2147483654 //80000006
    },
    submit_sm: {
        id: 4 //00000004
    },
    submit_sm_resp: {
        id: 2147483652, //80000004
        fields: [fields.message_id]
    },
    submit_multi: {
        id: 33 //00000021
    },
    submit_multi_resp: {
        id: 2147483681, //80000021
        fields: [fields.message_id, fields.no_unsuccess, fields.unsuccess_smes]
    },
    deliver_sm: {
        id: 5, //00000005
        fields: [fields.service_type, fields.source_addr_ton, fields.source_addr_npi, fields.source_addr, fields.dest_addr_ton,
            fields.dest_addr_npi, fields.destination_addr, fields.esm_class, fields.protocol_id, fields.priority_flag,
            fields.schedule_delivery_time, fields.validity_period, fields.registered_delivery, fields.replace_if_present_flag,
            fields.data_coding, fields.sm_default_msg_id, fields.sm_length, fields.short_message]
    },
    deliver_sm_resp: {
        id: 2147483653 //80000005
    },
    data_sm: {
        id: 259, //00000103
        fields: [fields.service_type, fields.source_addr_ton, fields.source_addr_npi, fields.source_addr, fields.dest_addr_ton,
            fields.dest_addr_npi, fields.destination_addr, fields.esm_class, fields.registered_delivery, fields.data_coding]
    },
    data_sm_resp: {
        id: 2147483907, //80000103
        fields: [fields.message_id]
    },
    //Function to loop all the properties and return the name of the command by its id
    getCommandNameById: function(id){
        for(var name in this){
            if(this[name].id === id)
                return name;
        }
    }
};
