const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const news = new Schema({
  title: { type: String },
  short_description: { type: String },
  permalink: {type: String},
  date: {type: String},
  news_sources_id: {type: String},
  user_id: {type: String},
  category_id: {type: String}
});
module.exports = {
  "model": mongoose.model('news', news),
  "schema": news
}