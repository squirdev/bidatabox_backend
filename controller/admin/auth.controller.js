const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../../models/user.model");
const Admin = require("../../models/admin.model");
const bcrypt = require("bcrypt");

module.exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await Admin.findOne({
      username: username,
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "username or Password not correct" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "username or Password not correct" });
    }

    console.log("User Login Success:", username, password);
    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      token: token,
      user: user,
      message: "User login success",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
