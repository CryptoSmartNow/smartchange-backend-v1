const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { internalServerError, handleError } = require("../utils/errorHandler");

//Get Chats for the Logged in User

const getChatsForUser = async (request, response) => {
  const id = request.user;

  try {
    // find all chats related to the logged in user and populate
    // the necessary fields

    const chats = await Chat.find({ user: id })
      .sort({ updatedAt: -1 })
      .populate([
        {
          path: "merchant",
          select:
            "firstName lastName profilePicture messaging_token verified active",
        },
        { path: "lastMessage", select: "seen message attachment receiverHash" },
      ]);

    response.status(200).json({ status: true, chats });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

// Get Chats for the Logged in merchant

const getChatsForMerchant = async (request, response) => {
  const id = request.user;

  try {
    // find all chats related to the logged in merchant and populate
    // the necessary fields

    const chats = await Chat.find({ merchant: id })
      .sort({ updatedAt: -1 })
      .populate([
        { path: "user", select: "fullName profilePicture messaging_token" },
        { path: "lastMessage", select: "seen message attachment receiverHash" },
      ]);
    response.status(200).json({ status: true, chats });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

// get All the Messages for a Particular Chat

const getMessages = async (request, response) => {
  // get the id of the chat from the request query parameter

  const chatId = request.query.id;

  try {

    // check if the chat id is being sent in the query

    if (!chatId) {
      return response
        .status(422)
        .json(
          handleError(
            422,
            "Chat Id missing",
            "the id of the requested chat is required as an 'id' query parameter"
          )
        );
    }

    // find all the messages associated with this chat

    const messages = await Message.find({ chat: chatId }).populate(
      "sender receiver",
      "profilePicture messaging_token"
    );

    response.status(200).json({ status: true, messages });
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

module.exports = {
  getChatsForMerchant,
  getChatsForUser,
  getMessages,
};
