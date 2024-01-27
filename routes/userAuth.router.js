const express = require("express");
const { signUp,login,setUpProfile,getLoggedUser } = require("../controllers/userAuthController");
const authenticateUser = require("../middlewares/userAuthMiddleware");
const router = express.Router();

router.post("/signup",signUp);
router.post("/login",login);
router.post("/profile/setup",authenticateUser,setUpProfile);
router.get("/get",authenticateUser,getLoggedUser);









module.exports = router;