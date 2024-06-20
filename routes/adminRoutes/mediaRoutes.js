const express = require("express");
const authenticateAdmin = require("../../middlewares/adminAuthMiddleware");
const {
  uploadMedia,
  getAllMedia,
} = require("../../controllers/mediaController");
const router = express.Router();

router.post("/upload", authenticateAdmin, uploadMedia);
router.post("/get/all", authenticateAdmin, getAllMedia);

module.exports = router;
