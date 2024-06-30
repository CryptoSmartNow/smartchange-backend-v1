const express = require("express");
const {
  issueReceipt,
  getMerchantTransactions,
} = require("../controllers/transactionController");
const authenticateMerchant = require("../middlewares/merchantAuthMiddleware");
const router = express.Router();

router.post("/issue_receipt", authenticateMerchant, issueReceipt);
router.get("/history", authenticateMerchant, getMerchantTransactions);

module.exports = router;
