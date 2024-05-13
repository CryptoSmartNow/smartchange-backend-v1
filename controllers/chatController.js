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

const checkConversation = async (request, response) => {
  const merchantId = request.body.merchantId;
  const id = request.user;
  try {
    const usersHaveChat = await Chat.findOne({
      user: id,
      merchant: merchantId,
    });
    const chat = usersHaveChat
      ? usersHaveChat
      : await Chat.create({
          user: id,
          merchant: merchantId,
          lastMessageTime: new Date().toISOString(),
        });

    response.status(200).json({ status: true, chat });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

const markMessagesAsRead = async (request, response) => {
  const { conversationId } = request.body;
  const id = request.user;

  try {
    // Mark unread messages as seen
    await Message.updateMany(
      { receiver: id, seen: false, chat: conversationId },
      { $set: { seen: true } }
    );
    response
      .status(200)
      .json({ status: true, message: "Messaged Marked as Read" });
  } catch (error) {
    console.log(error);
    response.status(400).json(internalServerError(error));
  }
};

const newMessage = async (request, response) => {
  const { role, senderHash, conversationId, message, receiverHash } =
    request.body;

  try {
    // Find the sender and receiver based on the role
    const sender =
      role === "user"
        ? await User.findOne({ messaging_token: senderHash })
        : await Merchant.findOne({ messaging_token: senderHash });
    const receiver =
      role === "user"
        ? await Merchant.findOne({ messaging_token: receiverHash })
        : await User.findOne({ messaging_token: receiverHash });

    const chat = await Chat.findOne({
      user: role === "user" ? sender._id : receiver._id,
      merchant: role === "merchant" ? sender._id : receiver._id,
    });

    // Create a new message
    const newMessage = await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      chat: chat._id,
      message: message,
      receiverHash,
      senderModel: role,
      receiverModel: role === "user" ? "merchant" : "user",
    });

    // Update the last message in the chat
    chat.lastMessage = newMessage._id;
    await chat.save();
  } catch (error) {
    console.log(error);
    response.status(500).json(internalServerError(error));
  }
};

module.exports = {
  getChatsForMerchant,
  getChatsForUser,
  getMessages,
  checkConversation,
  newMessage
};
