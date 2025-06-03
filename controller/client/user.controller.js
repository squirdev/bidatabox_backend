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

module.exports.updateCredit = async (req, res) => {
  const { user } = req;
  const { newUserName, oldPassword, newPassword } = req.body;

  try {
    if (!newUserName || !oldPassword || !newPassword) {
      return res
        .status(403)
        .json({ success: false, message: "请输入所有必填字段" });
    }
    if (user.password != oldPassword) {
      return res
        .status(403)
        .json({ success: false, message: "旧密码不正确，请重试" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        username: newUserName,
        password: newPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "我们在数据库中找不到您。请再试一次。" });
    }

    return res.status(200).json({ message: "成功更新用户信用" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
