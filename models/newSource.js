const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newSource = new Schema({
  url: { type: String },
  name: {type: String},
  user_id: {type: String},
  category_id: {type: String}
});

module.exports = {
  "model": mongoose.model('newSources', newSource),
  "schema": newSource
}