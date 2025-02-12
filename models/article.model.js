const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const articleSchema = new mongoose.Schema({
  title: String,
  article_category_id: String,
  description: String,
  thumbnail: String,
  status: String,
  position: Number,
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: String,
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true
});

const Article = mongoose.model("Article", articleSchema, "articles");

module.exports = Article;