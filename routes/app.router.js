const express = require("express");
const {
  getAllMerchantsForSell,
  getMerchantsForBuy,
  getMerchantProfile,
  searchForMedia,
} = require("../controllers/appController");
const router = express.Router();

router.get("/sell/all", getAllMerchantsForSell);
router.get("/buy/all", getMerchantsForBuy);
router.get("/profile/:id", getMerchantProfile);
router.get("/search", searchForMedia);

module.exports = router;
