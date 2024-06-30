const { default: mongoose } = require("mongoose");
const Transaction = require("../models/transactionModel");
const { internalServerError, handleError } = require("../utils/errorHandler");

exports.issueReceipt = async (request, response) => {
  const { amount, token } = request.body;
  const id = request.merchant;

  try {
    if (!amount || !token) {
      return response
        .status(422)
        .json(
          handleError(
            422,
            "Transaction amount or token traded is required",
            "the client did not send one or more of the required fields"
          )
        );
    }

    await Transaction.create({
      merchant: id,
      amount: String(amount),
      token: String(token),
    });

    response
      .status(200)
      .json({ status: true, message: "Receipt Successfully Issued" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

exports.getMerchantTransactions = async (request, response) => {
  const id = request.query.merchant;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(422)
        .json(
          handleError(
            422,
            "Invalid Merchant Id",
            "the id sent by the client as a merchant appears to be invalid"
          )
        );
    }

    const transactions = await Transaction.find({ merchant: id });

    response
      .status(200)
      .json({ status: true, transactions, total: transactions.length });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};
