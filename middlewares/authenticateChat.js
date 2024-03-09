const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtsecret = process.env.JWT_SECRET;
const User = require("../models/userModel");
const Merchant = require("../models/merchantModel");

const authenticateChat = async (token, role) => {
  try {
    const decoded = jwt.verify(token, jwtsecret);

    if (role === "user") {
      const user = await User.findById(decoded.id);

      if (!user) {
        return false;
      }

      if (user.blocked) {
        return false;
      }

      return decoded.id;
    } else if (role === "merchant") {
      const merchant = await Merchant.findById(decoded.id);

      if (!merchant) {
        return false;
      }

      if (merchant.blocked) {
        return false;
      }

      return decoded.id;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = authenticateChat;
