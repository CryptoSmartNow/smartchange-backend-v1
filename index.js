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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth/user", userAuthRoutes);
app.use("/api/v1/auth/merchant", merchantAuthRoutes);
app.use("/api/v1/profile/merchant", merchantProfileRoutes);

httpServer.listen(port, () => {
  console.log("Server Started");
});
