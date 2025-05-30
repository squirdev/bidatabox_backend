require("dotenv").config();
const express = require("express");
const User = require("../../models/user.model");
const fs = require("fs");
const path = require("path");

const {
  PhoneQuery,
  SocialQuery,
  resultDownload,
  uploadPhoneDetectFile,
  uploadSocialDetectFile,
} = require("../../third-party/bidatabox");

const PhoneDetect = require("../../models/phonedetect.model");
const SocialDetect = require("../../models/socialdetect.model");
const ActivityLog = require("../../models/activitylog.model");

const saveBinaryFile = require("../../utils/saveFile");

async function pollPhoneQuery(id, sendID) {
  let status = 0;

  while (status !== 2) {
    try {
      const queryResult = await PhoneQuery({ sendID });
      // const queryResult = {
      //   RES: "100",
      //   ERR: "",
      //   DATA: { status: "2", number2: "817", number3: "1183", number4: "0" },
      // };
      status = queryResult?.DATA?.status;

      console.log(`Polling... status: ${status}`);

      if (status == 2) {
        console.log("Status is 2. Done polling.");
        const activatedNumber = Number(queryResult?.DATA?.number2);
        const unRegisteredNumber = Number(queryResult?.DATA?.number3);
        const downloadResult = await resultDownload({
          sendID: sendID,
          type: 1,
        });
        const filename = `${sendID}.zip`;
        try {
          await saveBinaryFile(downloadResult, filename);
        } catch (error) {
          console.log("Error while saving file", error);
        }
        await PhoneDetect.findByIdAndUpdate(id, {
          activenumber: activatedNumber,
          unregisternumber: unRegisteredNumber,
          fileurl: filename,
        });
        break;
      }
    } catch (err) {
      console.error("Error polling PhoneQuery:", err);
    }

    // Wait for 10 seconds before next try
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

async function pollSocialQuery(id, sendID) {
  let status = 0;

  while (status !== 2) {
    try {
      const queryResult = await SocialQuery({ sendID });
      // const queryResult = {
      //   RES: "100",
      //   ERR: "",
      //   DATA: { status: "2", number2: "817", number3: "1183", number4: "0" },
      // };

      console.log("QUERY RESULT::", queryResult);
      status = queryResult?.DATA?.status;

      console.log(`Polling... status: ${status}`);

      if (status == 2) {
        console.log("Status is 2. Done polling.");
        const validNumber = Number(queryResult?.DATA?.number2);
        const activatedNumber = Number(queryResult?.DATA?.number3);
        const unknownNumber = Number(queryResult?.DATA?.number4);
        const compressedResult = await resultDownload({
          sendID: sendID,
          type: 1,
        });
        const compressedFileName = `${sendID}_1.zip`;
        await saveBinaryFile(compressedResult, compressedFileName);

        const validResult = await resultDownload({
          sendID: sendID,
          type: 5,
        });
        const validFileName = `${sendID}_5.txt`;
        await saveBinaryFile(validResult, validFileName);
        const csvResult = await resultDownload({
          sendID: sendID,
          type: 8,
        });
        const csvFileName = `${sendID}_8.csv`;
        await saveBinaryFile(csvResult, csvFileName);
        await SocialDetect.findByIdAndUpdate(id, {
          validnumber: validNumber,
          activatednumber: activatedNumber,
          unknownnumber: unknownNumber,
          compressedfileurl: compressedFileName,
          validfileurl: validFileName,
          csvfileurl: csvFileName,
        });
        break;
      }
    } catch (err) {
      console.error("Error polling PhoneQuery:", err);
    }

    // Wait for 10 seconds before next try
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

module.exports.phoneUpload = async (req, res) => {
  const { taskName } = req.body;
  const file = req.files?.file;
  const { user } = req;
  console.log("PHONE UPLOAD", taskName);

  try {
    if (!taskName || !file) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const fileContent = file.data.toString();
    const lines = fileContent.split(/\r?\n/);
    const lineCount = lines.filter((line) => line.trim() !== "").length;

    const perCost = lineCount >= 200000 ? 0.0035 : 0.0035;
    if (lineCount * perCost > user.balance)
      return res.status(400).json({
        success: false,
        message: "User balance is insufficient. Please recharge.",
      });

    const upLoadResult = await uploadPhoneDetectFile({
      taskName,
      file,
    });

    // const upLoadResult = {
    //   RES: "100",
    //   ERR: "",
    //   DATA: {
    //     sendid: "2560608",
    //     sendID: "2560608",
    //     line: "2000",
    //     jifen: "49.8332000+0.0000",
    //   },
    // };

    // res.json(upLoadResult);

    if (upLoadResult?.RES == "100") {
      const sendID = upLoadResult.DATA.sendID;
      const entireNumber = Number(upLoadResult.DATA.line);
      const newPhoneDetect = new PhoneDetect({
        userid: user._id,
        username: user.realname,
        taskname: taskName,
        sendid: sendID,
        entirenumber: entireNumber,
      });
      await newPhoneDetect.save();

      const decreaseAmount = perCost * entireNumber;

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: -decreaseAmount } }
      );

      const pricePerPhone = process.env.PHONE_ACTIVE_DETECT_PRICE || 3.571;

      const newActivityLog = new ActivityLog({
        userid: user._id,
        username: user.realname,
        entirenumber: entireNumber,
        type: "Number Active Detect",
        perprice: perCost,
        consume: decreaseAmount / 7.2, // rubbish code, 100$ is 720 point
        benefit: decreaseAmount / 7.2 - (pricePerPhone * entireNumber) / 10000, // rubbish code, you have to calculate each number's benefit
      });
      await newActivityLog.save();

      const id = newPhoneDetect._id;

      pollPhoneQuery(id, sendID);
    }
    res.json(upLoadResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.phonePreUpload = async (req, res) => {
  const { taskName, countryCode, zipIndex } = req.body;
  const { user } = req;

  try {
    if (!taskName || !countryCode) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const fileName = `phone${zipIndex}.txt`;
    const filePath = path.join(
      process.cwd(),
      "server_data",
      countryCode,
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    if (user.balance < 700)
      return res.status(400).json({
        success: false,
        message: "User balance is insufficient. Please recharge.",
      });

    const fakeUploadedFile = {
      name: fileName,
      mv: async (destPath) => {
        return fs.promises.copyFile(filePath, destPath);
      },
    };

    const upLoadResult = await uploadPhoneDetectFile({
      taskName,
      countryCode,
      file: fakeUploadedFile,
    });
    // const upLoadResult = {
    //   RES: "100",
    //   ERR: "",
    //   DATA: {
    //     sendid: "2560608",
    //     sendID: "2560608",
    //     line: "2000",
    //     jifen: "49.8332000+0.0000",
    //   },
    // };

    if (upLoadResult?.RES == "100") {
      const sendID = upLoadResult.DATA.sendID;
      const entireNumber = Number(upLoadResult.DATA.line);
      const newPhoneDetect = new PhoneDetect({
        userid: user._id,
        username: user.realname,
        taskname: taskName,
        sendid: sendID,
        entirenumber: entireNumber,
      });
      await newPhoneDetect.save();

      const decreaseAmount = 700;

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: -decreaseAmount } }
      );

      const pricePerPhone = process.env.PHONE_ACTIVE_DETECT_PRICE || 5.715;

      const newActivityLog = new ActivityLog({
        userid: user._id,
        username: user.realname,
        entirenumber: entireNumber,
        type: "Number Active Detect",
        perprice: 0.0035,
        consume: decreaseAmount / 7.2, // rubbish code, 100$ is 720 point
        benefit: decreaseAmount / 7.2 - pricePerPhone * 20, // rubbish code, you have to calculate each number's benefit
      });
      await newActivityLog.save();

      const id = newPhoneDetect._id;

      pollPhoneQuery(id, sendID);
    }
    res.json(upLoadResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.socialUpload = async (req, res) => {
  const { social, taskName, activeDay } = req.body;
  const file = req.files?.file;
  const { user } = req;
  console.log("SOCIAL UPLOAD", taskName, social, activeDay);

  try {
    if (!taskName || !file || !social || !activeDay) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const fileContent = file.data.toString();
    const lines = fileContent.split(/\r?\n/);
    const lineCount = lines.filter((line) => line.trim() !== "").length;

    const perCost =
      social === "TG"
        ? lineCount >= 200000
          ? 0.00625
          : 0.0065
        : lineCount >= 200000
        ? 0.0018
        : 0.002;

    if (lineCount * perCost > user.balance)
      return res.status(400).json({
        success: false,
        message: "User balance is insufficient. Please recharge.",
      });

    const upLoadResult = await uploadSocialDetectFile({
      file,
      social,
      taskName,
      activeDay,
    });
    console.log("TELEGRAM DETECT::", upLoadResult);
    // const upLoadResult = {
    //   RES: "100",
    //   ERR: "",
    //   DATA: {
    //     sendid: "2562823",
    //     sendID: "2562823",
    //     line: "2000",
    //     jifen: "42.9752000+0.0000",
    //   },
    // };

    if (upLoadResult?.RES == "100") {
      const sendID = upLoadResult.DATA.sendID;
      const entireNumber = Number(upLoadResult.DATA.line);
      const newSocialDetect = new SocialDetect({
        userid: user._id,
        username: user.realname,
        taskname: taskName,
        sendid: sendID,
        entirenumber: entireNumber,
        type: social,
        activeday: activeDay,
      });
      await newSocialDetect.save();

      const decreaseAmount = perCost * entireNumber;

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: -decreaseAmount } }
      );

      const socialActiveDetectPrice =
        social == "TG"
          ? process.env.TG_ACTIVE_DETECT_PRICE || 5.715
          : process.env.WS_ACTIVE_DETECT_PRICE || 2.142;

      const newActivityLog = new ActivityLog({
        userid: user._id,
        username: user.realname,
        entirenumber: entireNumber,
        type: social === "TG" ? "TG Days Detect" : "WS Days Detect",
        perprice: perCost,
        consume: decreaseAmount / 7.2,
        benefit:
          decreaseAmount / 7.2 -
          (socialActiveDetectPrice * entireNumber) / 10000,
      });
      await newActivityLog.save();

      const id = newSocialDetect._id;

      pollSocialQuery(id, sendID);
    }
    res.json(upLoadResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.socialPreUpload = async (req, res) => {
  const { social, taskName, activeDay, countryCode, zipIndex } = req.body;
  const { user } = req;

  try {
    if (!taskName || !countryCode || !social || !activeDay) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    if (
      (social === "TG" && user.balance < 1250) ||
      (social === "WS" && user.balance < 360)
    )
      return res.status(400).json({
        success: false,
        message: "User balance is insufficient. Please recharge.",
      });

    const fileName = `phone${zipIndex}.txt`;
    const filePath = path.join(
      process.cwd(),
      "server_data",
      countryCode,
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const fakeUploadedFile = {
      name: fileName,
      mv: async (destPath) => {
        return fs.promises.copyFile(filePath, destPath);
      },
    };

    const upLoadResult = await uploadSocialDetectFile({
      social,
      taskName,
      activeDay,
      countryCode,
      file: fakeUploadedFile,
    });
    console.log("SOCIAL PRE DETECT::", upLoadResult);
    // const upLoadResult = {
    //   RES: "100",
    //   ERR: "",
    //   DATA: {
    //     sendid: "2562823",
    //     sendID: "2562823",
    //     line: "2000",
    //     jifen: "42.9752000+0.0000",
    //   },
    // };

    if (upLoadResult?.RES == "100") {
      const sendID = upLoadResult.DATA.sendID;
      const entireNumber = Number(upLoadResult.DATA.line);
      const newSocialDetect = new SocialDetect({
        userid: user._id,
        username: user.realname,
        taskname: taskName,
        sendid: sendID,
        entirenumber: entireNumber,
        type: social,
        activeday: activeDay,
      });
      await newSocialDetect.save();

      const perCost =
        social === "TG"
          ? entireNumber >= 200000
            ? 0.00625
            : 0.0065
          : entireNumber >= 200000
          ? 0.0018
          : 0.002;
      const decreaseAmount = social === "TG" ? 1250 : 360;

      await User.updateOne(
        { _id: user._id },
        { $inc: { balance: -decreaseAmount } }
      );

      const socialActiveDetectPrice =
        social == "TG"
          ? process.env.TG_ACTIVE_DETECT_PRICE || 5.715
          : process.env.WS_ACTIVE_DETECT_PRICE || 2.142;

      const newActivityLog = new ActivityLog({
        userid: user._id,
        username: user.realname,
        entirenumber: entireNumber,
        type: social === "TG" ? "TG Days Detect" : "WS Days Detect",
        perprice: perCost,
        consume: decreaseAmount / 7.2,
        benefit: decreaseAmount / 7.2 - socialActiveDetectPrice * 20,
      });
      await newActivityLog.save();

      const id = newSocialDetect._id;

      pollSocialQuery(id, sendID);
    }
    res.json(upLoadResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.phoneDetectList = async (req, res) => {
  const { pageIndex, pageSize } = req.body;
  const { user } = req;

  try {
    if (pageIndex == null || pageSize == null) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const phoneDetectList = await PhoneDetect.find({ userid: user._id })
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await PhoneDetect.countDocuments({ userid: user._id });

    res.json({
      success: true,
      data: phoneDetectList,
      total,
      pageIndex,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.socialDetectList = async (req, res) => {
  const { pageIndex, pageSize } = req.body;
  const { user } = req;

  try {
    if (pageIndex == null || pageSize == null) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const socialDetectList = await SocialDetect.find({ userid: user._id })
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await SocialDetect.countDocuments({ userid: user._id });

    res.json({
      success: true,
      data: socialDetectList,
      total,
      pageIndex,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.phoneDeleteRow = async (req, res) => {
  const { id } = req.body;
  const { user } = req;

  try {
    if (!id) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const deleted = await PhoneDetect.findOneAndDelete({
      _id: id,
      userid: user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found or unauthorized" });
    }

    res.json({ success: true, message: "删除成功", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.socialDeleteRow = async (req, res) => {
  const { id } = req.body;
  const { user } = req;

  try {
    if (!id) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const deleted = await SocialDetect.findOneAndDelete({
      _id: id,
      userid: user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found or unauthorized" });
    }

    res.json({ success: true, message: "删除成功", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
