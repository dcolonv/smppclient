/**
 * Created by @dcolonv on 06/07/2015.
 * Publish and manage the SMPP Short Message information
 */

/**
 * ShortMessage Object Constructor
 * @constructor
 */
function ShortMessage(){
    this.service_type = '';
    this.source_addr_ton = 0;
    this.source_addr_npi = 0;
    this.source_addr = '';
    this.dest_addresses = [];
    this.esm_class = 0;
    this.protocol_id = 0;
    this.priority_flag = 0;
    this.schedule_delivery_time = '';
    this.validity_period = '';
    this.registered_delivery = 0;
    this.replace_if_present_flag = 0;
    this.data_coding = 0;
    this.sm_default_msg_id = 0;
    this.short_message = '';
    this.message_id = '';
    this.status = 0;
    this.optionals = {
        user_message_reference: '',
        source_port: '',
        source_addr_subunit: '',
        destination_port: '',
        dest_addr_subunit: '',
        sar_msg_ref_num: '',
        sar_total_segments: '',
        sar_segment_seqnum: '',
        more_message_to_send: '',
        payload_type: '',
        message_payload: '',
        privacy_indicator: '',
        callback_num: '',
        callback_num_pres_ind: '',
        callback_num_atag: '',
        source_subaddress: '',
        dest_subaddress: '',
        user_response_code: '',
        display_time: '',
        sms_signal: '',
        ms_validity: '',
        ms_msg_wait_facilities: '',
        number_of_messages: '',
        alert_on_message_delivery: '',
        language_indicator: '',
        its_reply_type: '',
        its_session_info: '',
        ussd_service_op: ''
    };
}

module.exports = ShortMessage;