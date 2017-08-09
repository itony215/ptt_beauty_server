var mongoose = require("mongoose");

const BeautyPageSchema = new mongoose.Schema({
  previewHref: {
    type: String
  },
  page: {
    type: String
  },
  articleId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date
  },
  author: {
    type: String
  }
});
BeautyPageSchema.index({ articleId: 1 }, { unique: true });
const BeautyPage = mongoose.model("BeautyPage", BeautyPageSchema);
module.exports = {
  BeautyPage
};
