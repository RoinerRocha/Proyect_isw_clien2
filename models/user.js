const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
  fname: { type: String },
  lname: { type: String },
  email: {type: String, unique:true},
  password: {type: String},
  role: {type: String}
});
module.exports = {
  "model": mongoose.model('users', user),
  "schema": user
}
