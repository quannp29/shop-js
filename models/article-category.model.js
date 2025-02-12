const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const articleCategorySchema = new mongoose.Schema({
  title: String,
  description: String,
  thumbnail: String,
  status: String,
  position: Number,
  slug: { type: String, slug: "title", unique: true },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  createdBy: String,
  updatedBy: String,
  deletedBy: String
}, {
  timestamps: true
});

const ArticleCategory = mongoose.model("ArticleCategory", articleCategorySchema, "article-category");

module.exports = ArticleCategory;
