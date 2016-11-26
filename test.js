
var smpp = require('./smpp_client');
var utils = require('./utils');
var sequence = require('./sequence');
var Promise = require('promise');
var ShortMessage = require('./short_message');
var SMEAddress = require('./sme_address');
var DistributionList = require('./distribution_list');
var constants = require('./constants');
var DataMessage = require('./data_message');
var tags = require('./tags');

var dm1 = new DataMessage();

dm1.destination_addr = '+50688413565';
dm1.optionals.display_time = 'alt';
dm1.test = ['hp;a'];


//variable to get all the buffer part corresponding to optionals tags
var octet_optionals = new Buffer(['0x00', '0x00', '0x00', '0xFF']);

console.log(octet_optionals.readUInt32BE(0));

