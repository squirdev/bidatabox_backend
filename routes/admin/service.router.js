const express = require("express");
const router = express.Router();

const requireAdminAuth = require("../../middleware/admin.middleware");
const controller = require("../../controller/admin/service.controller");

router.post(
  "/api/admin/service/social-detect-list",
  requireAdminAuth,
  controller.socialDetectList
);

router.post(
  "/api/admin/service/phone-detect-list",
  requireAdminAuth,
  controller.phoneDetectList
);
router.get(
  "/api/admin/service/get-balance",
  requireAdminAuth,
  controller.getBalance
);
router.post(
  "/api/admin/service/charge-log-list",
  requireAdminAuth,
  controller.chargeLogList
);

module.exports = router;
