/**
 * Created by @dcolonv on 30/07/2015.
 * Publish and manage SME Address informations
 */
var constants = require('./constants');

/**
 * SMEAddress Object Constructor
 * @constructor
 */
function SMEAddress(){
    this.dest_addr_ton = 0;
    this.dest_addr_npi = 0;
    this.destination_addr = '';
}

//Assign the type in prototype to be used out of context in other functions.
SMEAddress.prototype.type = constants.object_types.SME_ADDRESS;

module.exports = SMEAddress;