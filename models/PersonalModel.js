const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address_line_1: { type: String, required: true },
  address_line_2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true }
});

const personalSchema = new mongoose.Schema({
  account_id: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  cell_phone: { type: String, required: true },
  home_phone: { type: String },
  photo: { type: String },
  address: { type: addressSchema, required: true }
});

const PersonalModel= mongoose.model('UserInfo', personalSchema);

module.exports ={PersonalModel};
