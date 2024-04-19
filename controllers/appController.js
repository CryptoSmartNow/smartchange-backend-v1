const { default: mongoose } = require("mongoose");
const Merchant = require("../models/merchantModel");
const { internalServerError, handleError } = require("../utils/errorHandler");

const getAllMerchantsForSell = async (request, response) => {
  try {
    const merchants = await Merchant.find(
      { validated: true, active: true, documentVerified: true },
      { passwordHash: 0 }
    );

    response.status(200).json({ status: true, merchants });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const getMerchantsForBuy = async (request, response) => {
  try {
    const merchants = await Merchant.find(
      { validated: true, active: true, documentVerified: true },
      { passwordHash: 0 }
    );

    response.status(200).json({ status: true, merchants });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const getMerchantProfile = async (request, response) => {
  const merchantId = request.params.id;

  try {
    if (!mongoose.isValidObjectId(merchantId)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid User Id",
            "the user identifier sent by the client, appears to be invalid"
          )
        );
    }

    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return response
        .status(404)
        .json(
          handleError(
            404,
            "Merchant Not Found",
            "the merchant requested by the cient was not found"
          )
        );
    }

    response.status(200).json({ status: true, merchant });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

module.exports = {
  getAllMerchantsForSell,
  getMerchantsForBuy,
  getMerchantProfile,
};
