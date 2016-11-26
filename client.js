/**
 * Created by @dcolonv on 04/05/2015.
 */
var SmppClient = require('./smpp_client');
var commands = require('./commands');
var ShortMessage = require('./short_message');
var DataMessage = require('./data_message');
var SMEAddress = require('./sme_address');
var DistributionList = require('./distribution_List');

var fs = require('fs');

var con1 = new SmppClient();
con1.system_id = 'alt';
con1.password = 'alt';
con1.system_type = 'smpp1';
con1.keep_alive = 20000;
con1.throughput = 0;
con1.timeout = 5000;


con1.listen(7778).then(function(){
    console.log('Client: client start listening on port ' + 7778);
    client.on(commands.outbind, function(outbind){
        console.log('Client: outbind received!, system_id: %s, password: %s', outbind.system_id, outbind.password);
        if(outbind.system_id === 'alt') {
            client.bind_receiver().then(function () {
                console.log(client.status);
            }).catch(function (err) {
                console.log(err.message);
            });
        }
        else{
            console.log('User not authenticated!');
            client.disconnect();
        }
    });
}).catch(function(err){
    console.log(err.message);
});


var logArray = [];
/*con1.bind_receiver('localhost', 7777).then(function(){
    con1.on(commands.enquire_link_resp, function(enquire_link_resp){
        //console.log('Enquire Link Response recibido, status: %s, sequence: %d', message.status, message.sequence_number);
    });

    con1.on(commands.submit_sm_resp, function(shortMessage){
        var logMessage = "Message: " + shortMessage.short_message + ", telefonos: " + shortMessage.dest_addresses.length + ", shortCode: " + shortMessage.source_addr +
            ", status: " + shortMessage.status + ", messageId: " + shortMessage.message_id + "\n";
        logArray.push(logMessage);
        if(shortMessage.short_message === 'Esto es un mensaje prueba: 9999'){
            console.log('termino de enviar y recibir.... ' + new Date());
        }
    });

    con1.on(commands.submit_multi_resp, function(shortMessage){
        var logMessage = "Message: " + shortMessage.short_message + ", telefonos: " + shortMessage.dest_addresses.length + ", shortCode: " + shortMessage.source_addr +
            ", status: " + shortMessage.status + ", messageId: " + shortMessage.message_id + ", no_unsuccess: " + shortMessage.no_unsuccess + ", unsuccess_smes: " + shortMessage.unsuccess_smes.length + "\n";
        logArray.push(logMessage);
    });

    con1.on(commands.deliver_sm, function(deliver_sm){
        var logMessage = "Message: " + deliver_sm.short_message + ", telefonos: " + deliver_sm.destination_addr + ", shortCode: " + deliver_sm.source_addr +
            ", status: " + deliver_sm.status + ", messagePayload: " + deliver_sm.message_payload+ "" + "\n";
        console.log(logMessage);
    });

    con1.on(commands.data_sm_resp, function(dataMessage){
        var logMessage = "Message: " + dataMessage.short_message + ", telefono: " + dataMessage.destination_addr + ", shortCode: " + dataMessage.source_addr +
            ", status: " + dataMessage.status + ", messageId: " + dataMessage.message_id + "\n";
        console.log(logMessage);
    });

    con1.on(commands.data_sm, function(data_sm){
        console.log("Data SM Received")
        console.log(data_sm);
    });

}).catch(function(error){
    console.log(error);
});

setTimeout(function(){
    if(con1.isBound) {
        console.log('empezar a enviar.... ' + new Date());
        for (i = 0; i < 1; i++) {
            var sme_address = new SMEAddress();
            sme_address.destination_addr = '+50688439135';
            sme_address.dest_addr_npi = 1;
            sme_address.dest_addr_ton = 1;
            var sme_address2 = new SMEAddress();
            sme_address2.destination_addr = '+50688439136';
            sme_address2.dest_addr_npi = 1;
            sme_address2.dest_addr_ton = 1;

            var dl = new DistributionList();
            dl.name = 'DistributionTest';

            //console.log('trying to send a message');
            var sm1 = new ShortMessage();
            sm1.dest_addresses.push(sme_address);

            sm1.registered_delivery = 0;
            sm1.source_addr = '3030';
            sm1.short_message = 'Esto es un mensaje prueba: ' + i;
            sm1.optionals.dest_subaddress = '+8888888';
           // con1.submit_sm(sm1);

            var dm1 = new DataMessage();
            dm1.destination_addr = '+50688439135';
            dm1.source_addr = '4040';

            con1.data_sm(dm1);
        }
    }
}, 3000);
*/
//Unbind test after 20 seconds
/*setTimeout(function(){
    if(con1.isBound)
        con1.unbind(function(err, messagesToSubmit, pendingResponseSMList){
            if(err)
                return console.log(err.message);
            console.log('Messages Pending to Send: ' + messagesToSubmit.length);
            console.log('Messages Pending of Response ' + pendingResponseSMList.length);
        });
}, 10000);*/


/*setTimeout(function(){
    console.log('logging on file...');
    fs.appendFile('messages.txt', logArray, function(err){
        if(err)
            return console.log(err);
    });
}, 11000);*/
