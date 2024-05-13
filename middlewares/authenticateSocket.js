const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

const authenticateSocket = (socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.query?.token || null;

  jwt.verify(token, jwtSecret, (err, decoded) => {
    console.log(decoded);
    if (err) return next(new Error("Authentication error"));
    socket.decodedJwt = decoded;
    next();
  });
};

module.exports = authenticateSocket;
