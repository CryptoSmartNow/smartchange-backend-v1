const express = require("express");
const { getAllMerchantsForSell,getMerchantsForBuy,getMerchantProfile } = require("../controllers/appController");
const router = express.Router();


router.get("/sell/all",getAllMerchantsForSell);
router.get("/buy/all",getMerchantsForBuy);
router.get("/profile/:id",getMerchantProfile)




module.exports = router;
