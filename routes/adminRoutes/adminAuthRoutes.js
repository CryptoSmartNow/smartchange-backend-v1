const express = require("express");
const authenticateAdmin = require("../../middlewares/adminAuthMiddleware");
const {
  registerAdmin,
  loginAdmin,
  createAdmin,
  getActivitiesLog,
  getAllSubAdmins,
} = require("../../controllers/adminAuthController");
const router = express.Router();

router.post("/register_super_admin", registerAdmin);
router.post("/login", loginAdmin);
router.post("/create_sub_admin", authenticateAdmin, createAdmin);
router.get("/get/log", authenticateAdmin, getActivitiesLog);
router.get("/get/admins/all", authenticateAdmin, getAllSubAdmins);

module.exports = router;
