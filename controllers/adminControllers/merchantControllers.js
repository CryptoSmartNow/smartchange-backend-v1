const { default: mongoose } = require("mongoose");
const Activity = require("../../models/activityModel");
const Merchant = require("../../models/merchantModel");
const {
  internalServerError,
  handleError,
} = require("../../utils/errorHandler");

exports.getAllMerchants = async (request, response) => {
  try {
    const merchants = await Merchant.find().sort({ createdAt: -1 });

    response.status(200).json({ status: true, merchants });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.getSingleMerchant = async (request, response) => {
  const id = request.params.id;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Merchant Id ",
            "the Merchant id sent by the client is invalid"
          )
        );
    }

    const merchant = await Merchant.findById(id);

    response.status(200).json({ status: true, merchant });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.banMerchant = async (request, response) => {
  const id = request.params.id;
  try {
    if (!id) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Merchant id Missing",
            "the client did not send id as a query"
          )
        );
    }

    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Merchant Id ",
            "the Merchant id sent by the client is invalid"
          )
        );
    }

    const merchant = await Merchant.findOneAndUpdate(
      { _id: id },
      { blocked: true },
      { new: true }
    );

    await Activity.create({
      admin: request.admin,
      action: `Banned ${merchant.fullName}`,
    });

    response.status(201).json({
      status: true,
      message: "Merchant Banned Sucessfully",
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.reinstateMerchant = async (request, response) => {
  const id = request.params.id;
  try {
    if (!id) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Merchant id Missing",
            "the client did not send id as a query"
          )
        );
    }

    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Merchant Id ",
            "the Merchant id sent by the client is invalid"
          )
        );
    }

    const merchant = await Merchant.findOneAndUpdate(
      { _id: id },
      { blocked: false },
      { new: true }
    );

    await Activity.create({
      admin: request.admin,
      action: `Reinstated ${merchant.fullName}`,
    });

    response.status(201).json({
      status: true,
      message: "Merchant Reinstated Sucessfully",
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.approveMerchant = async (request, response) => {
  const id = request.params.id;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Merchant Id ",
            "the Merchant id sent by the client is invalid"
          )
        );
    }

    const merchant = await Merchant.findOneAndUpdate(
      { _id: id },
      { documentVerified: true },
      { new: true }
    );

    await Activity.create({
      admin: request.admin,
      action: `Approved ${merchant.fullName}`,
    });

    response.status(201).json({
      status: true,
      message: "Merchant Approved Sucessfully",
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.declineMerchant = async (request, response) => {
  const id = request.params.id;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Merchant Id ",
            "the Merchant id sent by the client is invalid"
          )
        );
    }

    const merchant = await Merchant.findOneAndUpdate(
      { _id: id },
      { documentVerified: false },
      { new: true }
    );

    await Activity.create({
      admin: request.admin,
      action: `Reversed Approval for ${merchant.fullName}`,
    });

    response.status(201).json({
      status: true,
      message: "Merchant Approval Reversed Sucessfully",
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};
