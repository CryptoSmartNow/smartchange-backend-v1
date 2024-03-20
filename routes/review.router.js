const express = require("express");
const {
  newRating,
  getRatingForUser,
} = require("../controllers/reviewController");
const authenticateUser = require("../middlewares/userAuthMiddleware");
const router = express.Router();

router.post("/new", authenticateUser, newRating);
router.get("/get/user", getRatingForUser);

module.exports = router;
