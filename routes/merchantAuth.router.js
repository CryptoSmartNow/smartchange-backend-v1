const express = require("express");
const router = express.Router();

const {
    signUpMerchant,
    loginMerchant,
} = require("../controllers/merchantController");

router.post("/signup",signUpMerchant);
router.post("/login",loginMerchant);


module.exports = router;