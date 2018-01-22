import mongoose from 'mongoose';
import Country from './country';

let Schema = mongoose.Schema;

mongoose.set('debug', true);

let ProvinceSchema = new Schema({
  name: { type: String, required: true },
  country: {type: Schema.Types.ObjectId, ref: 'Country'},
  tax: Number
});

module.exports = mongoose.model('Province', ProvinceSchema);