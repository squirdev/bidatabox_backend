const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const PhoneDetect = require("../../models/phonedetect.model");
const SocialDetect = require("../../models/socialdetect.model");
const ChargeLog = require("../../models/chargelog.model");
const { getBalance } = require("../../third-party/bidatabox");

module.exports.phoneDetectList = async (req, res) => {
  const { pageIndex, pageSize, searchDate, searchUser } = req.body;
  console.log("PARAM", pageIndex, pageSize, searchUser, searchDate);

  try {
    if (pageIndex == null || pageSize == null) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const query = {};
    if (searchUser) {
      query.userid = new ObjectId(searchUser);
    }
    if (searchDate) {
      const date = new Date(searchDate);
      query.createdAt = {
        $gte: new Date(date.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(date.setUTCHours(23, 59, 59, 999)),
      };
    }

    const phoneDetectList = await PhoneDetect.find(query)
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await PhoneDetect.countDocuments();

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
  const { pageIndex, pageSize, searchUser, searchDate, searchType } = req.body;
  console.log("PARAM", pageIndex, pageSize, searchUser, searchDate, searchType);
  try {
    if (pageIndex == null || pageSize == null) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const query = {};
    if (searchUser) {
      query.userid = new ObjectId(searchUser);
    }
    if (searchDate) {
      const date = new Date(searchDate);
      query.createdAt = {
        $gte: new Date(date.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(date.setUTCHours(23, 59, 59, 999)),
      };
    }
    if (searchType) {
      query.type = searchType;
    }

    const socialDetectList = await SocialDetect.find(query)
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await SocialDetect.countDocuments();

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

module.exports.chargeLogList = async (req, res) => {
  const { pageIndex, pageSize, searchUser, searchDate, searchType } = req.body;
  console.log("PARAM", pageIndex, pageSize, searchUser, searchDate, searchType);
  try {
    if (pageIndex == null || pageSize == null) {
      return res.status(400).json({ success: false, message: "Bad Request" });
    }

    const query = {};
    if (searchUser) {
      query.userid = new ObjectId(searchUser);
    }
    if (searchDate) {
      const date = new Date(searchDate);
      query.createdAt = {
        $gte: new Date(date.setUTCHours(0, 0, 0, 0)),
        $lte: new Date(date.setUTCHours(23, 59, 59, 999)),
      };
    }
    if (searchType) {
      query.type = searchType;
    }

    const chargeLogList = await ChargeLog.find(query)
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await ChargeLog.countDocuments();

    res.json({
      success: true,
      data: chargeLogList,
      total,
      pageIndex,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.getBalance = async (req, res) => {
  const result = await getBalance();
  res.json(result);
};
