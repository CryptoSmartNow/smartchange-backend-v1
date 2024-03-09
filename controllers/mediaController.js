const Media = require("../models/mediaModel");
const { internalServerError } = require("../utils/errorHandler");

const uploadMedia = async (request, response) => {
  const { title, description, duration, url } = request.body;

  try {

    // check if the required fields are being sent

    

  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};




module.exports = {
    uploadMedia
}