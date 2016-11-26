/**
 * Created by @dcolonv on 30/07/2015.
 * Publish and manage DistributionList information
 */
var constants = require('./constants');

/**
 * DistributionList Object Constructor
 * @constructor
 */
function DistributionList(){
    this.name = '';
}

//Assign the type in prototype to be used out of context in other functions.
DistributionList.prototype.type = constants.object_types.DISTRIBUTION_LIST;

module.exports = DistributionList;