/**
 * Created by @dcolonv on 30/07/2015.
 */
function SMEAddress(){
    this.dest_addr_ton = 0;
    this.dest_addr_npi = 0;
    this.destination_addr = '';
}

SMEAddress.prototype.type = 'SMEAddress';

module.exports = SMEAddress;