const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    previewUrl: String,
    duration: {
      type: String,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("media", mediaSchema);

module.exports = Media;
