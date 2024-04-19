const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  banUser,
  reinstateUser,
} = require("../../controllers/adminControllers/usersControllers");
const authenticateAdmin = require("../../middlewares/adminAuthMiddleware");
const router = express.Router();

router.get("/get/all_users", authenticateAdmin, getAllUsers);
router.get("/get/:id", authenticateAdmin, getSingleUser);
router.post("/ban/:id", authenticateAdmin, banUser);
router.post("/reinstate/:id", authenticateAdmin, reinstateUser);

module.exports = router;
