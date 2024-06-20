const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaSchema = new Schema(
  {
    title: String,
    mediaUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("media", mediaSchema);

module.exports = Media;
