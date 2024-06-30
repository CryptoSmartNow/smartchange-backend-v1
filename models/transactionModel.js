const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "merchant",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;
