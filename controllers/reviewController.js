const { default: mongoose } = require("mongoose");
const Rating = require("../models/ratingModel");
const { internalServerError, handleError } = require("../utils/errorHandler");

const allowedRatings = [1, 2, 3, 4, 5];

const newRating = async (request, response) => {
  const id = request.user;

  const { message, star, merchantId } = request.body;

  try {
    // Check if the required fields are being sent by the client and if they are in the right format

    if (!message) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Message is Required",
            "the client did not send 'message' in the request body"
          )
        );
    }
    if (!star) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Rating is Required",
            "the Client did not send a star Rating"
          )
        );
    }

    if (!allowedRatings.includes(parseInt(star))) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Rating should me 1-5 stars",
            "the Client did not send the proper star rating"
          )
        );
    }

    if (!mongoose.isValidObjectId(merchantId)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Merchant Id",
            "the user the client request to rate, appears to be invalid"
          )
        );
    }

    // === Checks if the User has Reviewed this Merchant Before === ////

    // const userHasRatedBefore = await Rating.findOne({
    //   ratingUser: id,
    //   userToRate: merchantId,
    // });

    // if (userHasRatedBefore) {
    //   return response
    //     .status(400)
    //     .json(
    //       handleError(
    //         400,
    //         "You have already rated this user",
    //         "the client has already added rating for the user it's trying to rate"
    //       )
    //     );
    // }

    // Add a new rating if the user has not rated this merchant before

    await Rating.create({
      ratingUser: id,
      userToRate: merchantId,
      stars: star,
      message,
    });

    response
      .status(200)
      .json({ status: true, message: "Thanks for your feedback" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const getRatingForUser = async (request, response) => {
  const merchantId = request.query.id;

  try {
    // Check if the user id is being sent in the query

    if (!merchantId) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "User ID is required",
            "the client did not sent 'id' as a query parameter"
          )
        );
    }

    // check if the user id that was sent,is a valid user id

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

    // find the raings for that partcular user and send to the client

    const reviews = await Rating.find({
      userToRate: merchantId,
      flagged: false,
    })
      .populate("ratingUser", "profilePicture fullName")
      .sort({ createdAt: -1 });

    response.status(200).json({ status: true, reviews });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

module.exports = {
  newRating,
  getRatingForUser,
};
