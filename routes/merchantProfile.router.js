const express = require("express");
const router = express.Router();

const {
    setUpMerchantProfile,
    uploadMerchantDocument,
    addAccountDetails,
    setQuickResponse,
    setActiveStatus,
    addBuyingRate,
    addSellingRate
} = require("../controllers/merchantController");
const authenticateMerchant = require("../middlewares/merchantAuthMiddleware");


router.post("/setup",authenticateMerchant,setUpMerchantProfile);
router.post("/upload_id",authenticateMerchant,uploadMerchantDocument);
router.post("/add_account",authenticateMerchant,addAccountDetails);
router.post("/set/quick_response",authenticateMerchant,setQuickResponse);
router.post("/set/active_status",authenticateMerchant,setActiveStatus);
router.post("/add_buying_rate",authenticateMerchant,addBuyingRate);
router.post("/add_selling_rate",authenticateMerchant,addSellingRate);




module.exports = router;