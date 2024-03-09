const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "merchant" },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;
