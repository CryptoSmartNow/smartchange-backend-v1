const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    ratingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userToRate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "merchant",
    },
    stars: {
      type: Number,
      default: 1,
      enum: [1, 2, 3, 4, 5],
    },
    message: {
      type: String,
      required: true,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Rating = mongoose.model("rating", ratingSchema);

module.exports = Rating;
