/**
 * Created by @dcolonv on 06/07/2015.
 * Module of Tag Definitions for SMPP Optional Parameters
 */
var constants = require('./constants');

module.exports = {
    //The dest_addr_subunit parameter is used to route messages when received by a mobile station
    //For example to a smart card in the mobile station or to an external device connected to the mobile station
    dest_addr_subunit: {
        id: 5, //'0005' //GSM
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unknown (default)', //0x00
            1: 'MS Display', //0x01
            2: 'Mobile Equipment', //0x02
            3: 'Smart Cart 1 (expected to be SIM if a SIM exists in the MS', //0x03
            4: 'External Unit 1', //0x04
            other: 'Reserved' //0x05 - 0xFF
        }
    },
    //The    dest_network_type parameter is used to indicate a network type associated with the destination address of a message.
    //In case that the receiving system (e.g. SMSC) does not support the indicated network type, it may treat this a failure
    //and return a response PDU reporting the failure
    dest_network_type: {
        id: 6, //'0006' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unknown', //0x00
            1: 'GSM', //0x01
            2: 'ANSI-136/TDMA', //0x02
            3: 'IS-95/CDMA', //0x03
            4: 'PDC', //0x04
            5: 'PHS', //0x05
            6: 'iDEN', //0x06
            7: 'AMPS', //0x07
            8: 'Paging Network', //0x08
            other: 'Reserved' //0x09 - 0xFF
        }
    },
    //The dest_bearer_type parameter is used to request the desired bearer for delivery of the message to the destination address.
    // In the case that the receiving system (e.g. SMSC) does not support the indicated bearer type, it may treat this a failure
    // and return a response PDU reporting the failure.
    dest_bearer_type: {
        id: 7, //'0007' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unknown', //0x00
            1: 'SMS', //0x01
            2: 'Circuit Switched Data (CSD)', //0x02
            3: 'Packet Data', //0x03
            4: 'USSD', //0x04
            5: 'CDPD', //0x05
            6: 'DataTAC', //0x06
            7: 'FLEX/ReFLEX', //0x07
            8: 'Cell Broadcast(cellcast)', //0x08
            other: 'Reserved' //0x09 - 0xFF
        }
    },
    //This parameter defines the telematic interworking to be used by the delivering system for the destination address.
    // This is only useful when a specific dest_bearer_type parameter has also been specified as the value is bearer dependent.
    // In the case that the receiving system (e.g. SMSC) does not support the indicated telematic interworking,
    // it may treat this a failure and return a response PDU reporting a failure.
    dest_telematics_id: {
        id: 8, //'0008' //GSM
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Not Defined Yet'
        }
    },
    //The source_addr_subunit parameter is used to indicate where a message was originated in the mobile station
    //For example a smart card in the mobile station or an external device connected to the mobile station.
    source_addr_subunit: {
        id: 13, //'000D' //GSM
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unknown (default)', //0x00
            1: 'MS Display', //0x01
            2: 'Mobile Equipment', //0x02
            3: 'Smart Cart 1 (expected to be SIM if a SIM exists in the MS)', //0x03
            4: 'External Unit 1', //0x04
            other: 'Reserved' //0x05 - 0xFF
        }
    },
    //The source_network_type parameter is used to indicate the network type associated with the device that originated the message.
    source_network_type: {
        id: 14, //'000E' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unknown', //0x00
            1: 'GSM', //0x01
            2: 'ANSI-136/TDMA', //0x02
            3: 'IS-95/CDMA', //0x03
            4: 'PDC', //0x04
            5: 'PHS', //0x05
            6: 'iDEN', //0x06
            7: 'AMPS', //0x07
            8: 'Paging Network', //0x08
            other: 'Reserved' //0x09 - 0xFF
        }
    },
    //The source_bearer_type parameter indicates the wireless bearer over which the message originated.
    source_bearer_type: {
        id: 15, //'000F' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unknown', //0x00
            1: 'SMS', //0x01
            2: 'Circuit Switched Data (CSD)', //0x02
            3: 'Packet Data', //0x03
            4: 'USSD', //0x04
            5: 'CDPD', //0x05
            6: 'DataTAC', //0x06
            7: 'FLEX/ReFLEX', //0x07
            8: 'Cell Broadcast(cellcast)', //0x08
            other: 'Reserved' //0x09 - 0xFF
        }
    },
    //The source_telematics_id parameter indicates the type of telematics interface over which the message originated.
    source_telematics_id: {
        id: 16, //'0010' //GSM
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Not Defined Yet'
        }
    },
    //This parameter defines the number of seconds which the sender requests the SMSC to keep the message if undelivered
    // before it is deemed expired and not worth delivering. If the parameter is not present, the SMSC may apply a default value.
    qos_time_to_live: {
        id: 23, //'0017' //Generic
        size: 4,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Number of seconds for message to be retained by the receiving system'
        }
    },
    //The payload_type parameter defines the higher layer PDU type contained in the message payload.
    payload_type: {
        id: 25, //'0019' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Default. In the case of a WAP application, the default higher layer message type is a WDP message',
            1: 'WCMP Message. Wireless Control Message Protocol formatted data',
            other: 'Reserved'
        }
    },
    //The additional_status_info_text parameter gives an ASCII textual description of the meaning of a response PDU.
    //It is to be used by an implementation to allow easy diagnosis of problems.
    additional_status_info_text: {
        id: 29,  //'001D' //Generic
        size: 256,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values:{
            other: 'Free text to allow implementations to supply the most useful information for problem diagnosis'
        }
    },
    //The receipted_message_id parameter indicates the ID of the message being receipted in an SMSC Delivery Receipt.
    //This is the opaque SMSC message identifier that was returned in the message_id parameter of the SMPP response PDU
    //that acknowledged the submission of the original message.
    receipted_message_id: {
        id: 30,  //'001E' //Generic
        size: 659,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'SMSC handle of the message being received'
        }
    },
    //The ms_msg_wait_facilities parameter allows an indication to be provided to an MS that there are messages waiting for the subscriber on systems on the PLMN.
    //The indication can be an icon on the MS screen or other MMI indication.
    //The ms_msg_wait_facilities can also specify the type of message associated with the message waiting indication.
    ms_msg_wait_facilities: {
        id: 48,  //'0030' //GSM
        size: 1,
        type: constants.pdu_fields_types.INTEGER, //Bit Mask I00000TT
        values: {
            0: 'Set Indication Inactive, Voicemail Message Waiting', //0x00 = 00000000
            128: 'Set Indication Active, Voicemail Message Waiting', //0x80 = 10000000
            1: 'Set Indication Inactive, Fax Message Waiting', //0x01 = 00000001
            129: 'Set Indication Active, Fax Message Waiting', //0x81 = 10000001
            2: 'Set Indication Inactive, Electronic Mail Message Waiting', //0x02 = 00000010
            130: 'Set Indication Active, Electronic Mail Message Waiting', //0x82 = 10000010
            3: 'Set Indication Inactive, Other Message Waiting', //0x03 = 00000011
            131: 'Set Indication Active, Other Message Waiting', //0x83 = 10000011
            other: 'Unknown'
        }
    },
    //The privacy_indicator indicates the privacy level of the message.
    privacy_indicator: {
        id: 513, //'0201' //CDMA, TDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Privacy Level 0 (Not Restricted)(Default)',
            1: 'Privacy Level 1 (Restricted)',
            2: 'Privacy Level 2 (Confidential)',
            3: 'Privacy Level 3 (Secret)',
            other: 'Reserved' //0x04 - 0xFF
        }
    },
    //Specifies a subaddress with the originator of the message
    //The first octet of the data field is a Type of Subaddress tag and indicates the type of subaddressing information
    //included, and implies the type and length of subaddressing information which can accompany this tag value in the data field.
    source_subaddress: {
        id: 514, //'0202' //CDMA, TDMA
        size: 23,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Subaddress, complex Subaddress Type + Subaddress'
        }
    },
    //Specifies a subaddress with the destination of the message
    //The first octet of the data field is a Type of Subaddress tag and indicates the type of subaddressing information
    //included, and implies the type and length of subaddressing information which can accompany this tag value in the data field.
    //This parameter is not supported in the SMPP submit_multi PDU
    dest_subaddress: {
        id: 515, //'0203' //CDMA, TDMA
        size: 23,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Subaddress, complex Subaddress Type + Subaddress'
        }
    },
    //A reference by the originating SME to the short message
    user_message_reference: {
        id: 516,  //'0204' //Generic
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'reference by the originating SME to the short message'
        }
    },
    //A response code set by the user in a User Acknowledgement/Reply message. The response codes are application specific.
    user_response_code: {
        id: 517, //'0205' //CDMA, TDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: '0 to 255 (IS-95 CDMA), 0 to 15 (CMT-136 TDMA)'
        }
    },
    //Used to indicate the language of the short message
    language_indicator: {
        id: 525, //'020D' //CDMA, TDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Unspecified (default)',
            1: 'English',
            2: 'French',
            3: 'Spanish',
            4: 'German',
            5: 'Portuguese',
            other: 'Refer to [CMT-136] for other values'
        }
    },
    //Used to indicate the application port number associated with the source address of the message
    source_port: {
        id: 522, //'020A' //Generic
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Port number associated with the source address of the message'
        }
    },
    //Used to indicate the application port number associated with the destination address of the message
    destination_port: {
        id: 523, //'020B' //Generic
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Port number associated with the destination address of the message'
        }
    },
    //Used to indicate the reference number for a particular concatenated short message
    //This parameter shall contain a originator generated reference number so that a segmented short message may be
    //reassembled into a single original message. This allows the parallel transmission of several segmented messages.
    //This reference number shall remain constant for every segment which makes up a particular concatenated short message.
    //When present, the PDU must also contain the sar_total_segments and sar_segment_seqnum parameters.
    //Otherwise this parameter shall be ignored.
    sar_msg_ref_num: {
        id: 524, //'020C' //Generic
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Reference number for a particular concatenated short message'
        }
    },
    //Used to indicate the total number of short messages within the concatenated short message.
    //This parameter shall contain a value in the range 1 to 255 indicating the total number of fragments within the concatenated short message.
    //The value shall start at 1 and remain constant for every short message which makes up the concatenated short message.
    //When present, the PDU must also contain the sar_msg_ref_num and sar_segment_seqnum parameters.
    //Otherwise this parameter shall be ignored.
    sar_total_segments: {
        id: 526, //'020E' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Indicate the total number of short messages within the concatenated short message'
        }
    },
    //Used to indicate the sequence number of a particular short message within the concatenated short message.
    //This octet shall contain a value in the range 1 to 255 indicating the sequence number of a particular message within the
    //concatenated short message. The value shall start at 1 and increment by one for every message sent within the concatenated short message.
    //When present, the PDU must also contain the sar_total_segments and sar_msg_ref_num parameters.
    //Otherwise this parameter shall be ignored.
    sar_segment_seqnum: {
        id: 527, //'020F' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Indicate the sequence number of a particular short message within the concatenated short message'
        }
    },
    //The sc_interface_version parameter is used to indicate the SMPP version supported by the SMSC. It is returned in the bind response PDUs
    sc_interface_version: {
        id: 528, //'0210' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            51: 'Version 3.3 Supported', //0x33
            52: 'Version 3.4 Supported', //0x34
            other: '0 to 50 Earlier Version, Other values reserved'
        }
    },
    //Used to associate a display time of the short message on the MS
    display_time: {
        id: 4609, //'1201' //CDMA, TDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Temporary',
            1: 'Default',
            2: 'Invoke',
            other: 'Reserved'
        }
    },
    //Provide an MS with validity information associated with the received short message
    ms_validity: {
        id: 4612,  //'1204' //CDMA, TDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Store Indefinitely (default)',
            1: 'Power Down',
            2: 'SID based registration area',
            3: 'Display only',
            other: 'Reserved'
        }
    },
    //Used in the data_sm_resp PDU to indicate if delivery pending flag (DPF) was set for a delivery failure of the short message.
    //If the dpf_result parameter is not included in the data_sm_resp PDU, the ESME should assume that DPF is not set.
    //Currently this parameter is only applicable for the Transaction message mode.
    dpf_result: {
        id: 1056, //'0420' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'DPF not set',
            1: 'DPF set',
            other: 'Reserved'
        }
    },
    //An ESME may use the set_dpf parameter to request the setting of a delivery pending flag (DPF)
    //for certain delivery failure scenarios, such as
    //      - MS is unavailable for message delivery (as indicated by the HLR)
    //The SMSC should respond to such a request with an alert_notification PDU when it detects that the destination MS has become available.
    //The delivery failure scenarios under which DPF is set is SMSC implementation and network implementation specific.
    //If a delivery pending flag is set by the SMSC or network (e.g. HLR), then the SMSC should indicate this to the ESME in
    //the data_sm_resp message via the dpf_result parameter.
    set_dpf: {
        id: 1057, //'0421' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Setting of DPF for delivery failure to MS not requested',
            1: 'Setting of DPF for delivery failure to MS requested (default)',
            other: 'Reserved'
        }
    },
    //Used in the alert_notification operation to indicate the availability state of the MS to the ESME
    //If the SMSC does not include the parameter in the alert_notification operation, the ESME should assume that the MS is in an “available” state.
    ms_availability_status: {
        id: 1058, //'0422' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Available (Default)',
            1: 'Denied (suspended, no SMS capability, etc)',
            2: 'Unavailable',
            other: 'Reserved'
        }
    },
    //Used to indicate the actual network error code for a delivery failure. The network error code is technology specific.
    //Network type: 1 = ANSI-136, 2 = IS-95, 3 = GSM, 4 = Reserved
    network_error_code: {
        id: 1059, //'0423' //Generic
        size: 3,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Octet 1 = Network Type, Octet 2 and 3 = Error Code'
        }
    },
    //Parameter contains the user data. Used when message have a message larger than 255 octets
    message_payload: {
        id: 1060, //'0424' //Generic
        size: 0, //Maximum size is SMSC and network implementation specific
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Message larger than 255 octets'
        }
    },
    //The delivery_failure_reason parameter is used in the data_sm_resp operation to indicate the outcome of the message
    //delivery attempt (only applicable for transaction message mode). If a delivery failure due to a network error is indicated,
    //the ESME may check the network_error_code parameter (if present) for the actual network error code.
    //The delivery_failure_reason parameter is not included if the delivery attempt was successful.
    delivery_failure_reason: {
        id: 1061, //'0425' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Destination unavailable',
            1: 'Destination Address Invalid(suspended, no SMS capability, etc)',
            2: 'Permanent network error',
            3: 'Temporary network error',
            other: 'Reserved'
        }
    },
    //Used by the ESME in the submit_sm and data_sm operations to indicate to the SMSC that there are further messages for the same destination SME.
    //The SMSC may use this setting for network resource optimization.
    more_messages_to_send: {
        id: 1062, //'0426' //GSM
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'No more message to follow',
            1: 'More messages to follow (default)',
            other: 'Reserved'
        }
    },
    //Used by the SMSC in the deliver_sm and data_sm PDUs to indicate to the ESME the final message state for an SMSC Delivery Receipt.
    message_state: {
        id: 1063, //'0427' //Generic
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            1: 'ENROUTE',
            2: 'DELIVERED',
            3: 'EXPIRED',
            4: 'DELETED',
            5: 'UNDELIVERABLE',
            6: 'ACCEPTED',
            7: 'UNKNOWN',
            8: 'REJECTED',
            other: 'Reserved'
        }
    },
    //Parameter associates a call back number with the message. In TDMA networks, it is possible to send and receive
    //multiple callback numbers to/from TDMA mobile stations.
    //TODO Decrypt the bitmask
    callback_num: {
        id: 897, //'0381' //CDMA, TDMA, GSM, iDEN
        size: 19,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Bit Mask Complex'
        }
    },
    //Parameter controls the presentation indication and screening of the CallBackNumber at the mobile station.
    //If present, the callback_num parameter must also be present.
    //0000ppss
    //The Presentation Indicator is encoded in bits 2 and 3, Screening Indicator is encoded in bits 0 and 1
    callback_num_pres_ind: {
        id: 770, //'0302' //TDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER, //Bit Mask
        values: {
            0: 'Presentation Allowed - User provided, not screened', //00000000
            1: 'Presentation Allowed - User provided, verified and passed', //00000001
            2: 'Presentation Allowed - User provided, verified and failed', //00000010
            3: 'Presentation Allowed - Network provided', //00000011
            4: 'Presentation Restricted - User provided, not screened', //00000100
            5: 'Presentation Restricted - User provided, verified and passed', //00000101
            6: 'Presentation Restricted - User provided, verified and failed', //00000110
            7: 'Presentation Restricted - Network provided', //00000111
            8: 'Number Not Available - User provided, not screened', //00001000
            9: 'Number Not Available - User provided, verified and passed', //00001001
            10: 'Number Not Available - User provided, verified and failed', //00001010
            11: 'Number Not Available - Network provided', //00001011
            12: 'Reserved - User provided, not screened', //00001100
            13: 'Reserved - User provided, verified and passed', //00001101
            14: 'Reserved - User provided, verified and failed', //00001110
            15: 'Reserved - Network provided', //00001111
            other: 'BitMask Not Defined'
        }
    },
    //Parameter associates an alphanumeric display with the call back number
    //TODO Decrypt the bitmask
    callback_num_atag: {
        id: 771, //'0303' //TDMA
        size: 65,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Bit Mask Complex'
        }
    },
    //Parameter is used to indicate the number of messages stored in a mailbox
    number_of_messages: {
        id: 772,  //'0304' //CDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Number of messages stored in a mailbox'
        }
    },
    //Parameter is used to provide a TDMA MS with alert tone information associated with the received short message.
    sms_signal: {
        id: 4611, //'1203' //TDMA
        size: 2,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'Encoded as per [CMT-136]'
        }
    },
    //Parameter is set to instruct a MS to alert the user (in a MS implementation specific manner) when the short message arrives at the MS.
    alert_on_message_delivery: {
        id: 4876, //'130C' //CDMA
        size: 0,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            other: 'There is no Value part associated with this parameter'
        }
    },
    //Parameter is a required parameter for the CDMA Interactive Teleservice as defined by the Korean PCS carriers [KORITS].
    //It indicates and controls the MS user’s reply method to an SMS delivery message received from the ESME.
    its_reply_type: {
        id: 4992,  //'1380' //CDMA
        size: 1,
        type: constants.pdu_fields_types.INTEGER,
        values: {
            0: 'Digit',
            1: 'Number',
            2: 'Telephone No.',
            3: 'Password',
            4: 'Character Line',
            5: 'Menu',
            6: 'Date',
            7: 'Time',
            8: 'Continue',
            other: 'Reserved'
        }
    },
    //Parameter is a required parameter for the CDMA Interactive Teleservice
    //as defined by the Korean PCS carriers [KORITS]. It contains control information for the interactive session between an MS and an ESME.
    //TODO Decrypt the bitmask
    its_session_info: {
        id: 4995,  //'1383' //CDMA
        size: 2,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Bit Mask Complex'
        }
    },
    //Parameter is required to define the USSD service operation when SMPP is being used as an interface to a (GSM) USSD system.
    ussd_service_op: {
        id: 1281, //'0501' //GSM (USSD)
        size: 1,
        type: constants.pdu_fields_types.C_OCTET_FIXED,
        values: {
            other: 'Bit Mask Complex'
        }
    },
    // Function to loop all the properties and return the name of the tag by its id
    getTagNameById: function(id){
        for(var name in this){
            if(this[name].id === id)
                return name;
        }
    }
};
