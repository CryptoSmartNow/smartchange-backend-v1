const express = require("express");
const authenticateAdmin = require("../../middlewares/adminAuthMiddleware");
const {
  getAllMerchants,
  banMerchant,
  getSingleMerchant,
  reinstateMerchant,
} = require("../../controllers/adminControllers/merchantControllers");
const router = express.Router();

router.get("/get/all_merchants", authenticateAdmin, getAllMerchants);
router.get("/get/:id", authenticateAdmin, getSingleMerchant);
router.post("/ban/:id", authenticateAdmin, banMerchant);
router.post("/reinstate/:id", authenticateAdmin, reinstateMerchant);

module.exports = router;
