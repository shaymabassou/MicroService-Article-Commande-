const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
// articleId: { type: Number, required: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
