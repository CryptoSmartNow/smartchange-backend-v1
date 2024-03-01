const User = require("../models/userModel");
const getTimeDifference = require("../utils/calculateTIme");
const sendEmail = require("../utils/emailSystem");
const { handleError, internalServerError } = require("../utils/errorHandler");
require("dotenv").config();
const jwtsecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateUniqeHash = require("../utils/generateHash");

const signUp = async (request, response) => {
  const { email, password } = request.body;

  try {
    // Check if required fields are sent
    if (!email || !password) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Email and Password are Required",
            "email and passwords are required fields in the request body"
          )
        );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Email Format",
            "the email format sent by the client is invalid"
          )
        );
    }

    // NoSQL injection check
    if (email.includes("$")) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Bad Request",
            "the input sent by the client is forbidden"
          )
        );
    }

    //Check if there is already a user with this email

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Email Already in use",
            "the email provided by the client is already associated with another user"
          )
        );
    }

    //hash the users password before saving to database

    const passwordHash = await bcrypt.hash(password, 10);

    //generate a messagingToken and Associate it with the User

    const messaging_token = generateUniqeHash(10);

    //sign up the user with the validated credentials

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      messaging_token,
      logged: true,
      validated: true,
    });

    //sign a json token for the user

    const token = jwt.sign({ id: user._id }, jwtsecret);

    response
      .status(201)
      .json({ status: true, message: "Sign Up Successfull", token });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const login = async (request, response) => {
  const { email, password } = request.body;

  try {
    // Check if required fields are sent
    if (!email || !password) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Email and Password are Required",
            "email and passwords are required fields in the request body"
          )
        );
    }

    // Find the User in the database

    const user = await User.findOne({ email });

    //send an error response of the User was not found

    if (!user) {
      return response
        .status(401)
        .json(
          handleError(
            401,
            "Invalid Credentials",
            "the email sent by the client did not return any user"
          )
        );
    }

    //check if the password that was sent, is valid for the current user

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    //send an error response if the password is incorrect

    if (!passwordIsValid) {
      return response
        .status(401)
        .json(
          handleError(
            401,
            "Invalid Credentials",
            "the password sent  by the client for this user is invalid"
          )
        );
    }

    //check if the user is blocked from the platform

    if (user.blocked) {
      return response
        .status(401)
        .json(
          handleError(
            401,
            "Account Disabled",
            "the user is blocked and can not be logged in"
          )
        );
    }

    //sign a json token and make a successful Login

    const token = jwt.sign({ id: user._id }, jwtsecret);

    //mark the user as logged

    user.logged = true;
    await user.save();

    response
      .status(200)
      .json({ status: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const setUpProfile = async (request, response) => {
  const id = request.user;

  const { fullName, phoneNo, avatar } = request.body;

  try {
    // Check if required fields are sent
    if (!fullName || !phoneNo) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Full name and phone number are required",
            "the client is not sending one of these 'fullName' or 'phoneNo'"
          )
        );
    }

    //find the user and update

    await User.findOneAndUpdate(
      { _id: id },
      { fullName, phoneNo, profilePicture: avatar }
    );

    response
      .status(200)
      .json({ status: true, message: "Profile Setup Successful" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const getLoggedUser = async (request, response) => {
  const id = request.user;

  try {
    const user = await User.findOne(
      { _id: id },
      { passwordHash: 0, logged: 0, validated: 0, validation: 0 }
    );

    response.status(200).json({ status: true, user });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

module.exports = {
  signUp,
  login,
  setUpProfile,
  getLoggedUser,
};
