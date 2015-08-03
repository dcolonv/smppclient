/**
 * Created by @dcolonv on 03/07/2015.
 * Module to manage SMPP Commands object
 */
module.exports = {
    generic_nack: 2147483648, //80000000
    bind_receiver: 1, //00000001
    bind_receiver_resp: 2147483649, //80000001
    bind_transmitter: 2, //00000002
    bind_transmitter_resp: 2147483650, //80000002
    bind_transceiver: 9, //00000009
    bind_transceiver_resp: 2147483657, //80000009
    enquire_link: 21, //00000015
    enquire_link_resp: 2147483669, //80000015
    unbind: 6, //00000006
    unbind_resp: 2147483654, //80000006
    submit_sm: 4, //00000004
    submit_sm_resp: 2147483652, //80000004,
    submit_multi: 33, //00000021
    submit_multi_resp: 2147483681, //80000021
    deliver_sm: 5, //00000005,
    deliver_sm_resp: 2147483653, //80000005
    //Function to loop all the properties and return the name of the command by its id
    getCommandNameById: function(id){
        for(var name in this){
            if(this[name] === id)
                return name;
        }
    }
};
