require("dotenv").config();
const Admin = require("../models/adminModel");
const Merchant = require("../models/merchantModel");
const User = require("../models/userModel");
const generateUniqeHash = require("../utils/generateHash");
const { handleError, internalServerError } = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Activity = require("../models/activityModel");
const jwtsecret = process.env.JWT_SECRET;

const registerAdmin = async (request, response) => {
  const { fullName, email, password } = request.body;

  try {
    //Check if the required fields are being sent by the client

    if (!fullName || !email || !password) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "All Fields are Required",
            "fullName, email and password, are required in the request body"
          )
        );
    }

    //Check if there is already a super admin

    const adminExists = await Admin.findOne({ role: "admin" });

    if (adminExists) {
      response
        .status(401)
        .json(
          handleError(
            401,
            "There is already an Admin",
            "there can only be one Admin"
          )
        );
    }

    //hash the admins password

    const passwordHash = await bcrypt.hash(password, 10);

    //finally create the admin

    const admin = await Admin.create({
      fullName,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    //sign a jwt token for the admin, do the adin can be logged in imediately after the signup process

    const token = jwt.sign({ id: admin._id, role: "admin" }, jwtsecret);

    response.status(201).json({
      status: true,
      message: "Admin Account Created Successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const loginAdmin = async (request, response) => {
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

    //Check if the Email is Associated with any Admin

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Credentials",
            "the login credentials sent by the client appears to be incorrect"
          )
        );
    }

    // Check if the password is valid

    const passwordIsCorrect = await bcrypt.compare(password, admin.password);

    if (!passwordIsCorrect) {
      return response
        .status(400)
        .json(
          handleError(
            "Invalid Credentials",
            "the login credentials sent by the client appears to be incorrect"
          )
        );
    }

    //generate a token for the admin to authenticate requests

    const token = jwt.sign({ id: admin._id, role: admin.role }, jwtsecret);

    response
      .status(200)
      .json({ status: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const createAdmin = async (request, response) => {
  const { fullName, email, password } = request.body;

  try {
    //Check if the required fields are being sent by the client

    if (!fullName || !email || !password) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "All Fields are Required",
            "fullName, email and password, are required in the request body"
          )
        );
    }

    //Check if there is already an admin

    const adminExists = await Admin.findOne({ email: email.toLowerCase() });

    if (adminExists) {
      response
        .status(401)
        .json(
          handleError(
            401,
            "Email already exists",
            "this email is already associated with anotber admin"
          )
        );
    }

    //hash the admins password

    const passwordHash = await bcrypt.hash(password, 10);

    //finally create the admin

    const admin = await Admin.create({
      fullName,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    //sign a jwt token for the admin, so the admin can be logged in immediately after the signup process

    const token = jwt.sign({ id: admin._id, role: "moderator" }, jwtsecret);

    response.status(201).json({
      status: true,
      message: "Admin Created Successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

const getActivitiesLog = async (request, response) => {
  try {
    if (request.role !== "admin") {
      return response
        .status(401)
        .json({ status: false, message: "Only Super Admins can see Logs" });
    }

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .populate("admin");

    response.status(200).json({ status: true, activities });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  createAdmin,
  getActivitiesLog,
};
