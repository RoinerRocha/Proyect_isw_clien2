const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const category = new Schema({
  name: {type: String, unique:true}
});

module.exports = {
  "model": mongoose.model('categories', category),
  "schema": category
}
