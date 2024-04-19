const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const { Server } = require("socket.io");
const { createServer } = require("http");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "",
  },
});

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log(error));

const userAuthRoutes = require("./routes/userAuth.router");
const merchantAuthRoutes = require("./routes/merchantAuth.router");
const merchantProfileRoutes = require("./routes/merchantProfile.router");
const chatRoutes = require("./routes/chat.router");
const appRoutes = require("./routes/app.router");
const reviewRoutes = require("./routes/review.router");
const adminAuthRoutes = require("./routes/adminRoutes/adminAuthRoutes");
const adminUserManagementRoutes = require("./routes/adminRoutes/usersRouter");
const adminMerchantRoutes = require("./routes/adminRoutes/merchantsRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth/user", userAuthRoutes);
app.use("/api/v1/auth/merchant", merchantAuthRoutes);
app.use("/api/v1/profile/merchant", merchantProfileRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/app", appRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/user_management", adminUserManagementRoutes);
app.use("/api/v1/admin/merchant_management", adminMerchantRoutes);

// Messaging Related Models
const User = require("./models/userModel");
const Merchant = require("./models/merchantModel");
const Chat = require("./models/chatModel");
const Message = require("./models/messageModel");
const authenticateChat = require("./middlewares/authenticateChat");

// ===================== SOCKET.IO ZONE ==============================//

const userSocketMap = new Map();

io.on("connection", (socket) => {
  socket.on("authenticateUser", async (token) => {
    const id = await authenticateChat(token);

    if (!id) {
      return socket.emit("socketError", {
        message: "You have an Invalid Token",
      });
    } else {
      const socketExists = userSocketMap.get(id);

      socketExists
        ? userSocketMap.set(id + ":2", socket)
        : userSocketMap.set(id, socket);
    }
  });

  // Listen for "newMessage" events
  socket.on("newMessage", async (data) => {
    const { senderHash, receiverHash, message, role } = data;
    let sendingSocket, receivingSocket;

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

      // Throw error if sender or receiver is not found
      if (!sender || !receiver) {
        throw new Error("Invalid sender or receiver hash");
      }

      // Get the sender's and receiver's sockets
      sendingSocket = userSocketMap.get(sender._id.toString());
      receivingSocket =
        userSocketMap.get(receiver._id.toString()) ||
        userSocketMap.get(receiver._id.toString() + ":2");

      // Throw error if sender's  socket is not found
      if (!sendingSocket) {
        throw new Error("Unable to send message: socket not found");
      }

      // Check if users have chatted before
      const usersHaveChat = await Chat.findOne({
        user: role === "user" ? sender._id : receiver._id,
        merchant: role === "merchant" ? sender._id : receiver._id,
      });

      // Create a new chat if users have not chatted before
      const chat = usersHaveChat
        ? usersHaveChat
        : await Chat.create({
            user: role === "user" ? sender._id : receiver._id,
            merchant: role === "merchant" ? sender._id : receiver._id,
            lastMessageTime: new Date().toISOString(),
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

      // Mark unread messages as seen
      await Message.updateMany(
        { receiver: sender._id, seen: false, chat: chat._id },
        { $set: { seen: true } }
      );

      // Data to be emitted to sender and receiver
      const messageData = {
        senderHash,
        message,
        receiverHash,
        username: sender.username,
        profilePicture: sender.profilePicture,
        time: new Date().toISOString(),
      };

      // Emit the message to the receiver's socket

      if (receivingSocket) {
        receivingSocket.emit("newMessage", messageData);
      }

      receivingSocket.emit("newMessage", messageData);

      if (userSocketMap.get(receiver._id.toString() + ":2")) {
        userSocketMap
          .get(receiver._id.toString() + ":2")
          .emit("newMessage", messageData);
      }

      // Emit the message to the sender's other device if exists
      if (
        userSocketMap.get(sender._id.toString() + ":2") &&
        socket !== userSocketMap.get(sender._id.toString() + ":2")
      ) {
        userSocketMap
          .get(sender._id.toString() + ":2")
          .emit("newMessage", messageData);
      } else if (sendingSocket !== socket) {
        sendingSocket.emit("newMessage", messageData);
      }
    } catch (error) {
      // Emit error message if any error occurs
      socket.emit("messageError", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    // Remove the user ID mapping when a user disconnects
    userSocketMap.forEach(async (value, key) => {
      if (value === socket) {
        userSocketMap.delete(key);
      }
    });
  });
});

httpServer.listen(port, () => {
  console.log("Server Started");
});
