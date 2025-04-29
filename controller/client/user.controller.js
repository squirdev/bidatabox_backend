const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

module.exports.getInfo = async (req, res) => {
  const { user } = req;

  try {
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "User account was blocked" });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
