var mongoose = require('mongoose');
let Schema = mongoose.Schema;

mongoose.set('debug', true);

let CountrySchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }
});

module.exports = mongoose.model('Country', CountrySchema);