/**
 * Created by @dcolonv on 6/8/2015.
 * Publish and manage the SMPP Data Message information
 */
var constants = require('./constants');

/**
 * DataMessage Object Constructor
 * @constructor
 */
function DataMessage(){
    this.service_type = '';
    this.source_addr_ton = 0;
    this.source_addr_npi = 0;
    this.source_addr = '';
    this.dest_addr_ton = 0;
    this.dest_addr_npi = 0;
    this.destination_addr = '';
    this.esm_class = 0;
    this.registered_delivery = 0;
    this.data_coding = 0;
    this.optionals = {
        source_port: '',
        source_addr_subunit: '',
        source_network_type: '',
        source_bearer_type: '',
        source_telematics_id: '',
        destination_port: '',
        dest_addr_subunit: '',
        dest_network_type: '',
        dest_bearer_type: '',
        dest_telematics_id: '',
        sar_msg_ref_num: '',
        sar_total_segments: '',
        sar_segment_seqnum: '',
        more_message_to_send: '',
        qos_time_to_live: '',
        payload_type: '',
        message_payload: '',
        set_dpf: '',
        receipted_message_id: '',
        message_state: '',
        network_error_code: '',
        user_message_reference: '',
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
        its_session_info: ''
    };
}

//Assign the type in prototype to be used out of context in other functions.
DataMessage.prototype.type = constants.object_types.DATA_MESSAGE;

module.exports = DataMessage;