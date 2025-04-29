const express = require("express");
const router = express.Router();

const requireAdminAuth = require("../../middleware/admin.middleware");
const controller = require("../../controller/admin/activitylog.controller");

router.post(
  "/api/admin/log/getActivityLogList",
  requireAdminAuth,
  controller.getActivityLogList
);

module.exports = router;
