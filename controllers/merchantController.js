const sendEmail = require("../utils/emailSystem");
const { handleError, internalServerError } = require("../utils/errorHandler");
require("dotenv").config();
const jwtsecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const generateUniqeHash = require("../utils/generateHash");
const getTimeDifference = require("../utils/calculateTIme");
const Merchant = require("../models/merchantModel");

const signUpMerchant = async (request, response) => {
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

    //Check if there is already a merchant with this email

    const merchantExists = await Merchant.findOne({
      email: email.toLowerCase(),
    });

    if (merchantExists) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Email Already in use",
            "the email provided by the client is already associated with another merchant"
          )
        );
    }

    //hash the merchant's password before saving to database

    const passwordHash = await bcrypt.hash(password, 10);

    //generate a messagingToken and Associate it with the Merchant

    const messaging_token = generateUniqeHash(10);

    //sign up the merchant with the validated credentials

    const merchant = await Merchant.create({
      email: email.toLowerCase(),
      passwordHash,
      messaging_token,
      logged: true,
      validated: true,
    });

    //sign a json token for the merchant

    const token = jwt.sign({ id: merchant._id }, jwtsecret);

    response
      .status(201)
      .json({ status: true, message: "Sign Up Successfull", token });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const loginMerchant = async (request, response) => {
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

    // Find the Merchant in the database

    const merchant = await Merchant.findOne({ email });

    //send an error response of the Merchant was not found

    if (!merchant) {
      return response
        .status(401)
        .json(
          handleError(
            401,
            "Invalid Credentials",
            "the email sent by the client did not return any merchant"
          )
        );
    }

    //check if the password that was sent, is valid for the current merchant

    const passwordIsValid = await bcrypt.compare(
      password,
      merchant.passwordHash
    );

    //send an error response if the password is incorrect

    if (!passwordIsValid) {
      return response
        .status(401)
        .json(
          handleError(
            401,
            "Invalid Credentials",
            "the password sent  by the client for this merchant is invalid"
          )
        );
    }

    //check if the merchant is blocked from the platform

    if (merchant.blocked) {
      return response
        .status(401)
        .json(
          handleError(
            401,
            "Account Disabled",
            "the merchant is blocked and can not be logged in"
          )
        );
    }

    //check if the merchant have finished their unboarding process

    // if(!merchant.validated){
    //     return response.status(401).json(handleError(401, "Please Complete Onboarding Process","the merchant should be redirected to a pageto complete their onboarding process"))
    // }

    //sign a json token and make a successful Login

    const token = jwt.sign({ id: merchant._id }, jwtsecret);

    //mark the merchant as logged

    merchant.logged = true;
    await merchant.save();

    response
      .status(200)
      .json({ status: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const setUpMerchantProfile = async (request, response) => {
  const id = request.merchant;

  const { firstName, lastName, phoneNo, avatar } = request.body;

  try {
    // Check if required fields are sent

    if (!firstName || !phoneNo || !lastName) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "First name, Last name and phone number are required",
            "the client is not sending one of these 'firstName', 'phoneNo', 'lastName'"
          )
        );
    }

    // Find the Logged In Merchant and Update Him

    await Merchant.findOneAndUpdate(
      { _id: id },
      { firstName, lastName, phoneNo, profilePicture: avatar },
      { new: true }
    );

    response
      .status(200)
      .json({ status: true, message: "Personal Details Successful" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const uploadMerchantDocument = async (request, response) => {
  const id = request.merchant;

  const { idCard } = request.body;

  try {
    //check if the idCard is being sent in the request body

    if (!idCard) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Id Card Required",
            "the client did not send 'idCard' in the request body"
          )
        );
    }

    //find the Logged in user and update

    await Merchant.findOneAndUpdate({ _id: id }, { idCard }, { new: true });

    response
      .status(200)
      .json({ status: true, message: "Id Card Submitted for Validation" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const addAccountDetails = async (request, response) => {
  const { bankName, accountNumber, accountName } = request.body;

  const id = request.merchant;

  try {
    //check if the required fields are being sent

    if (!bankName) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Bank Name is Required",
            "the client did not send 'bankName' in the request body"
          )
        );
    }

    if (!accountNumber) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Account Number is Required",
            "the client did not send 'accountNumber' in the request body"
          )
        );
    }

    if (!accountName) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Account Name is Required",
            "the client did not sent 'accountName' in the request body"
          )
        );
    }

    //find the logged in merchant and add the payment method

    await Merchant.findOneAndUpdate(
      { _id: id },
      { accountDetails: { accountName, accountNumber, bankName } }
    );

    response
      .status(200)
      .json({ status: true, message: "Payment Details Added Sucessfully" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const setQuickResponse = async (request, response) => {
  const id = request.merchant;

  const { quickResponse } = request.body;

  try {
    // check if the required filed is being sent

    if (!quickResponse) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Quick Response is Required",
            "the client did not send 'quickResponse' in the request body"
          )
        );
    }

    //find the logged in user and add to his quick responses

    const merchant = await Merchant.findById(id);

    merchant.quickResponses.push(quickResponse);

    await merchant.save();

    response
      .status(200)
      .json({ status: true, message: "Quick Response Added Successfully" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const setActiveStatus = async (request, response) => {
  const id = request.merchant;

  const { status } = request.body;

  try {
    //check if the required fields are being sent

    if (!status) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Status is Required",
            "the client did not send 'status' in the request body"
          )
        );
    }

    //check if the status being sent is in the right format

    if (typeof status !== "boolean") {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Invalid Status Type",
            "status should be type of boolean, either 'true' or 'false'"
          )
        );
    }

    // find the logged in user and update active status

    await Merchant.findOneAndUpdate({ _id: id, active: status });

    response
      .status(200)
      .json({ status: true, message: "Active Status Updated Sucessfully" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const addBuyingRate = async (request, response) => {
  const id = request.merchant;

  const { currency, rate } = request.body;

  try {
    //check if the required fields are being sent

    if (!currency) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Currency is Required",
            "the client did not send 'currency' in the request body"
          )
        );
    }

    if (!rate) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Rate is Required",
            "the client did not send 'rate' in the request body"
          )
        );
    }

    //find the logged in user and add to his rates

    const merchant = await Merchant.findById(id);

    merchant.rates.buying.push({ currency, rate });

    await merchant.save();

    response.status(200).json({ status: true, message: "Buying Rate Added" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const addSellingRate = async (request, response) => {
  const id = request.merchant;

  const { currency, rate } = request.body;

  try {
    //check if the required fields are being sent

    if (!currency) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Currency is Required",
            "the client did not send 'currency' in the request body"
          )
        );
    }

    if (!rate) {
      return response
        .status(400)
        .json(
          handleError(
            400,
            "Rate is Required",
            "the client did not send 'rate' in the request body"
          )
        );
    }

    //find the logged in user and add to his rates

    const merchant = await Merchant.findById(id);

    merchant.rates.selling.push({ currency, rate });

    await merchant.save();

    response.status(200).json({ status: true, message: "Selling Rate Added" });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

const getMerchantProfile = async(request, response)=>{
  try{





  }catch(error){
    
  }
}
module.exports = {
  signUpMerchant,
  loginMerchant,
  setUpMerchantProfile,
  uploadMerchantDocument,
  addAccountDetails,
  setQuickResponse,
  setActiveStatus,
  addBuyingRate,
  addSellingRate,
};
