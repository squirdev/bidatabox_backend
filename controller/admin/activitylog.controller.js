const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const ActivityLog = require("../../models/activitylog.model");

module.exports.getActivityLogList = async (req, res) => {
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

    const activityLogList = await ActivityLog.find(query)
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await ActivityLog.countDocuments();

    res.json({
      success: true,
      data: activityLogList,
      total,
      pageIndex,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
