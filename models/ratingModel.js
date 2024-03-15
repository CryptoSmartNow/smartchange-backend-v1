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
      ref: "user",
    },
    stars: {
      type: Number,
      default: 1,
      enum: [1, 2, 3, 4, 5],
    },
  },
  { timestamps: true }
);

const Rating = mongoose.model("rating", ratingSchema);

module.exports = Rating;
