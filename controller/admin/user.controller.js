const mongoose = require("mongoose");
const User = require("../../models/user.model");
const ChargeLog = require("../../models/chargelog.model");

module.exports.getUserList = async (req, res, next) => {
  try {
    const user = await User.find();
    return res.status(200).send({
      data: user,
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.createUser = async (req, res) => {
  const request = req.body;
  console.log(request);

  try {
    const newUser = new User({
      username: request.username,
      password: request.password,
      realname: request.realname,
      tgCost: request.tgCost,
      wsCost: request.wsCost,
      phoneCost: request.phoneCost,
    });

    await newUser.save();

    return res.status(200).send({
      message: "Success",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({
      message: "server_error",
    });
  }
};

module.exports.updateUser = async (req, res) => {
  const request = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      request.id,
      {
        username: request.username,
        password: request.password,
        realname: request.realname,
        tgCost: request.tgCost,
        wsCost: request.wsCost,
        phoneCost: request.phoneCost,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).send("success");
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("server_error");
  }
};

module.exports.chargeUser = async (req, res) => {
  const request = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      request.id,
      { $inc: { balance: request.amount || 0 } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newChargeLog = new ChargeLog({
      userid: request.id,
      amount: request.amount,
      username: request.username,
    });

    await newChargeLog.save();

    return res.status(200).send("success");
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("server_error");
  }
};

module.exports.updateUserActive = async (req, res) => {
  const request = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      request.id,
      { isActive: request.status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).send("success");
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("server_error");
  }
};
