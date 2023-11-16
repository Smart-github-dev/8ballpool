const mongoose = require("mongoose");
const { Admin } = require("../models");
var bcrypt = require("bcryptjs");

module.exports = async function (callback) {
  const dbURI = process.env.DBURL; // Replace with your MongoDB URI
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const admins = await Admin.countDocuments({});
    if (admins == 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("administrator", salt);
      const admin = new Admin({ username: "administrator", password: hash });
      await admin.save();
    }

    callback();
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};
