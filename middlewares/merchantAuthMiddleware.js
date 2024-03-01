const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtsecret = process.env.JWT_SECRET;
const { handleError } = require("../utils/errorHandler");
const Merchant = require("../models/merchantModel");

const authenticateMerchant = async (request, response, next) => {
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    const token = request.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, jwtsecret);
      request.merchant = decoded.id;

      const merchant = await Merchant.findById(decoded.id);

      if (!merchant) {
        return response
          .status(401)
          .json(
            handleError(
              401,
              "Unauthorized",
              "The Client is Trying to Access an Authorized Endpoint with an Invalid Token"
            )
          );
      }

      if (merchant.blocked) {
        return response
          .status(401)
          .json(
            handleError(
              401,
              "Unauthorized",
              "the merchant is blocked and can not access this endpoint"
            )
          );
      }

      if (!merchant.logged) {
        return response
          .status(401)
          .json(
            handleError(
              401,
              "Unauthorized",
              "You are not Logged in, please Login and try again"
            )
          );
      }

      next();
    } catch (error) {
      response
        .status(401)
        .json(
          handleError(
            401,
            "Unauthorized",
            "The Client is Trying to Access an Authorized Endpoint with an Invalid Token"
          )
        );
      console.log(error);
    }
  } else {
    response
      .status(401)
      .json(
        handleError(
          401,
          "Unauthorized",
          "Authorization Header with Bearer Token Required"
        )
      );
  }
};

module.exports = authenticateMerchant;
