/**
 * Created by @dcolonv on 04/05/2015.
 */
var SmppServer = require('./smpp_server');
var commands = require('./commands');
var ShortMessage = require('./short_message');
var DataMessage = require('./data_message');
var SMEAddress = require('./sme_address');
var DistributionList = require('./distribution_List');

var fs = require('fs');

var server = new SmppServer();
server.keep_alive = 20000;
server.throughput = 0;
server.timeout = 5000;

server.on(commands.bind_receiver, function(bind_receiver){
    console.log("Server: Bind Receiver");
    //server.bind_receiver_resp();
});

server.connect('127.0.0.1', 7778).then(function(){
    server.outbind(function(err){
        if(err)
            return console.log(err.message);
        console.log("Server: Outbind sent");
    });
}).catch(function(err){
    console.log(err.message);
});
