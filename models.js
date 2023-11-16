const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Player = new Schema(
  {
    walletAddress: { type: String },
    handmadeCookies: { type: Number },
    binance: Number,
    equipment: {
      cursors: { type: Number },
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Admin = new Schema(
  {
    username: { type: String },
    password: { type: String },
    roles: Array,
  },
  { timestamps: true }
);

module.exports = {
  Player: mongoose.model("Player", Player),
  Admin: mongoose.model("Admin", Admin),
};
