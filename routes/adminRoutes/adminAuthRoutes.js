const express = require("express");
const authenticateAdmin = require("../../middlewares/adminAuthMiddleware");
const {
  registerAdmin,
  loginAdmin,
  createAdmin,
  getActivitiesLog,
} = require("../../controllers/adminAuthController");
const router = express.Router();

router.post("/register_super_admin", registerAdmin);
router.post("/login", loginAdmin);
router.post("/create_sub_admin", authenticateAdmin, createAdmin);
router.get("/get/log", authenticateAdmin, getActivitiesLog);

module.exports = router;
