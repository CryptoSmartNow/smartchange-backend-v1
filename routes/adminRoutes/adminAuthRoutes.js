const express = require("express");
const authenticateAdmin = require("../../middlewares/adminAuthMiddleware");
const {
  registerAdmin,
  loginAdmin,
  createAdmin,
} = require("../../controllers/adminAuthController");
const router = express.Router();

router.post("/register_super_admin", registerAdmin);
router.post("/login", loginAdmin);
router.post("/create_sub_admin", authenticateAdmin, createAdmin);

module.exports = router;
