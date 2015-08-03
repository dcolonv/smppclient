/**
 * Created by @dcolonv on 06/07/2015.
 * Module of Tag Definitions for SMPP Optional Parameters
 */
module.exports = {
    dest_addr_subunit: 5, //'0005' //GSM
    dest_network_type: 6, //'0006' //Generic
    dest_bearer_type: 7, //'0007' //Generic
    dest_telematics_id: 8, //'0008' //GSM
    source_addr_subunit: 13, //'000D' //GSM
    source_network_type: 14, //'000E' //Generic
    source_bearer_type: 15, //'000F' //Generic
    source_telematics_id: 16, //'0010' //GSM
    qos_time_to_live: 23, //'0017' //Generic
    payload_type: 25, //'0019' //Generic
    additional_status_info_text: 29, //'001D' //Generic
    receipted_message_id: 30, //'001E' //Generic
    ms_msg_wait_facilities: 48, //'0030' //GSM
    privacy_indicator: 513, //'0201' //CDMA, TDMA
    source_subaddress: 514, //'0202' //CDMA, TDMA
    dest_subaddress: 515, //'0203' //CDMA, TDMA
    user_message_reference: 516, //'0204' //Generic
    user_response_code: 517, //'0205' //CDMA, TDMA
    source_port: 522, //'020A' //Generic
    destination_port: 523, //'020B' //Generic
    sar_msg_ref_num: 524, //'020C' //Generic
    language_indicator: 525, //'020D' //CDMA, TDMA
    sar_total_segments: 526, //'020E' //Generic
    sar_segment_seqnum: 527, //'020F' //Generic
    sc_interface_version: 528, //'0210' //Generic
    callback_num_pres_ind: 770, //'0302' //TDMA
    callback_num_atag: 771, //'0303' //TDMA
    number_of_messages: 772, //'0304' //CDMA
    callback_num: 897, //'0381' //CDMA, TDMA, GSM, iDEN
    dpf_result: 1056, //'0420' //Generic
    set_dpf: 1057, //'0421' //Generic
    ms_availability_status: 1058, //'0422' //Generic
    network_error_code: 1059, //'0423' //Generic
    message_payload: 1060, //'0424' //Generic
    delivery_failure_reason: 1061, //'0425' //Generic
    more_messages_to_send: 1062, //'0426' //GSM
    message_state: 1063, //'0427' //Generic
    ussd_service_op: 1281, //'0501' //GSM (USSD)
    display_time: 4609, //'1201' //CDMA, TDMA
    sms_signal: 4611, //'1203' //TDMA
    ms_validity: 4612, //'1204' //CDMA, TDMA
    alert_on_message_delivery: 4876, //'130C' //CDMA
    its_reply_type: 4992, //'1380' //CDMA
    its_session_info: 4995, //'1383' //CDMA
    // Function to loop all the properties and return the name of the tag by its id
    getTagNameById: function(id){
        for(var name in this){
            if(this[name] === id)
                return name;
        }
    }
};
