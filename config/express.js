const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
const app = express();
const fs = require("fs");
const { dirname } = require("path");
module.exports = function () {
  app.use(
    session({
      secret: process.env.PRIVATE_KEY,
      resave: false,
      saveUninitialized: true,
    })
  );

  const corsOptions = {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));

  app.use(express.static("./public"));



  return app;
};
