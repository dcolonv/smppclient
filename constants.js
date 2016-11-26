/**
 * Created by @dcolonv on 6/8/2015.
 * Module containing all smpp connector types as constants
 */

module.exports = {
    object_types: {
        SME_ADDRESS: 'SMEAddress',
        DISTRIBUTION_LIST: 'DistributionList',
        SHORT_MESSAGE: 'ShortMessage',
        DATA_MESSAGE: 'DataMessage'
    },
    pdu_fields_types: {
        C_OCTET: 'C-Octet',
        INTEGER: 'Integer',
        C_OCTET_FIXED: 'C-Octet-Fixed',
        COMPLEX: 'Complex'
    },
    conection_status: {
        OPEN: 'OPEN', //Connected, bind pending
        BOUND_TX: 'BOUND_TX', //Connected and bound as Transmitter only
        BOUND_RX: 'BOUND_RX', //Connected and bound as Receiver only
        BOUND_TRX: 'BOUND_TRX', //Connected and bound as Transceiver
        CLOSED: 'CLOSED' //Unbound and disconnected
    },
    NULL_OCTET: 0x00
};
