
var mongoose = require('mongoose');

var Schema = mongoose.Schema;



var wallSchema = Schema({
  elements: Array
});


var Wall = mongoose.model('wall', wallSchema);
module.exports = Wall;