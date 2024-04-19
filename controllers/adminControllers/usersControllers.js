const { default: mongoose } = require("mongoose");
const Activity = require("../../models/activityModel");
const User = require("../../models/userModel");
const {
  internalServerError,
  handleError,
} = require("../../utils/errorHandler");

exports.getAllUsers = async (request, response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    response.status(200).json({ status: true, users });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.getSingleUser = async (request, response) => {
  const id = request.params.id;
  try {

    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid User Id ",
            "the user id sent by the client is invalid"
          )
        );
    }

    const user = await User.findById(id);

    response.status(200).json({ status: true, user });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.banUser = async (request, response) => {
  const id = request.params.id;
  try {

    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid User Id ",
            "the user id sent by the client is invalid"
          )
        );
    }

    const user = await User.findOneAndUpdate(
      { _id: id },
      { blocked: true },
      { new: true }
    );

    await Activity.create({
      admin: request.admin,
      action: `Banned ${user.fullName}`,
    });

    response.status(201).json({
      status: true,
      message: "User Banned Sucessfully",
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

exports.reinstateUser = async (request, response) => {
  const id = request.params.id;
  try {

    if (!mongoose.isValidObjectId(id)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid User Id ",
            "the user id sent by the client is invalid"
          )
        );
    }

    const user = await User.findOneAndUpdate(
      { _id: id },
      { blocked: false },
      { new: true }
    );

    await Activity.create({
      admin: request.admin,
      action: `Reinstated ${user.fullName}`,
    });

    response.status(201).json({
      status: true,
      message: "User Reinstated Sucessfully",
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};
