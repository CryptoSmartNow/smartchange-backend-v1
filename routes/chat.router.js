const express = require("express");
const authenticateMerchant = require("../middlewares/merchantAuthMiddleware");
const authenticateUser = require("../middlewares/userAuthMiddleware");
const {
  getChatsForMerchant,
  getChatsForUser,
  getMessages,
  checkConversation
} = require("../controllers/chatController");
const router = express.Router();

router.get("/get/merchant_chats", authenticateMerchant, getChatsForMerchant);
router.get("/get/user_chats", authenticateUser, getChatsForUser);
router.get("/get/messages_user", authenticateUser, getMessages);
router.get("/get/messages_merchant", authenticateMerchant, getMessages);
router.post("/check", authenticateUser, checkConversation);

module.exports = router;
