const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const { Server } = require("socket.io");
const { createServer } = require("http");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  transports: ["websocket", "polling"],
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
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
const mediaRoutes = require("./routes/adminRoutes/mediaRoutes");

const authenticateSocket = require("./middlewares/authenticateSocket");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
io.use(authenticateSocket);

app.use("/api/v1/auth/user", userAuthRoutes);
app.use("/api/v1/auth/merchant", merchantAuthRoutes);
app.use("/api/v1/profile/merchant", merchantProfileRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/app", appRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/user_management", adminUserManagementRoutes);
app.use("/api/v1/admin/merchant_management", adminMerchantRoutes);
app.use("/api/v1/admin/media", mediaRoutes);

app.get("/test", (req, res) => {
  res.status(200).json({ message: "Okay" });
});

// Messaging Related Models
const User = require("./models/userModel");
const Merchant = require("./models/merchantModel");
const Chat = require("./models/chatModel");
const Message = require("./models/messageModel");
const authenticateChat = require("./middlewares/authenticateChat");

io.on("connection", (socket) => {
  socket.on("conversation-opened", async ({ conversationId }) => {
    socket.join(`conversation-${conversationId}`);
    console.log(conversationId);

    const userId = socket.decodedJwt._id;

    await Message.updateMany(
      { receiver: userId, seen: false, chat: conversationId },
      { $set: { seen: true } }
    );
  });

  // Listen for "newMessage" events
  socket.on("newMessage", async (data) => {
    const { role, senderHash, conversationId, message, receiverHash } = data;
    try {
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

      // Emit the message to the both sockets

      socket.broadcast
        .to(`conversation-${conversationId}`)
        .emit("newMessage", data);
    } catch (error) {
      // Emit error message if any error occurs
      throw new Error(error);
    }
  });
  // Listen for "typing" events
  socket.on("typing", async (data) => {
    const { conversationId } = data;
    try {
      // Emit the message to the both sockets

      socket.broadcast
        .to(`conversation-${conversationId}`)
        .emit("typing", data);
    } catch (error) {
      // Emit error message if any error occurs
      socket.emit("messageError", { message: error.message });
    }
  });
  // Listen for "typing" events
  socket.on("stoppedTyping", async (data) => {
    const { conversationId } = data;
    try {
      // Emit the message to the both sockets

      socket.broadcast
        .to(`conversation-${conversationId}`)
        .emit("stoppedTyping", data);
    } catch (error) {
      // Emit error message if any error occurs
      socket.emit("messageError", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });
});

httpServer.listen(port, () => {
  console.log("Server Started");
});
