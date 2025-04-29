const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

module.exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username: username, password: password });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "username or Password not correct" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "User account was blocked" });
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

// // Login route
// router.post("/signin", async (req, res) => {});

// // Login route
// router.post("/signup", async (req, res) => {
//   const { email, username, password } = req.body;
//   console.log("password:::", password);

//   if (!email || !username || !password) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Parameter not correct" });
//   }

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User already exists" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       email,
//       username,
//       password: hashedPassword,
//     });

//     // Save user to the database
//     await newUser.save();

//     // Generate JWT
//     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });
//     res.status(201).json({
//       success: true,
//       token: token,
//       message: "User created successfully",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
