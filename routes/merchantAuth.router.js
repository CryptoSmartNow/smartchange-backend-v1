const express = require("express");
const router = express.Router();

const {
  signUpMerchant,
  loginMerchant,
  getLoggedInMerchant,
} = require("../controllers/merchantController");
const authenticateMerchant = require("../middlewares/merchantAuthMiddleware");

router.post("/signup", signUpMerchant);
router.post("/login", loginMerchant);
router.get("/get", authenticateMerchant, getLoggedInMerchant);

module.exports = router;
