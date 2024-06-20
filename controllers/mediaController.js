const Media = require("../models/mediaModel");
const { internalServerError, handleError } = require("../utils/errorHandler");

const uploadMedia = async (request, response) => {
  const { mediaUrl, title } = request.body;

  try {
    if (!mediaUrl) {
      return response
        .status(422)
        .json(
          handleError(
            422,
            "Media URL is Required",
            "the client did not send the media url"
          )
        );
    }

    await Media.create({ mediaUrl, title });

    response
      .status(200)
      .json({ status: true, message: "Media Uploaded Successfully" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const getAllMedia = async (request, response) => {
  try {
    const videos = await Media.find().sort({ createdAt: -1 });

    response.status(200).json({ status: true, videos });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
};
