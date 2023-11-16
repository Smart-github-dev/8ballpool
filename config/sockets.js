const socket = require("socket.io");
const session = require("express-session");

module.exports = function (http) {
  const corsOptions = {
    origin: "*", // Set the allowed origin
    methods: ["GET", "POST"], // Set the allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Set the allowed headers
  };
  const io = socket(http, {
    cors: corsOptions, // Set the cors option
  });

  const sessionMiddleware = session({
    secret: process.env.PRIVATE_KEY,
    resave: false,
    saveUninitialized: true,
  });

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  return io;
};
