const express = require("express");
const router = express.Router();

const requireAdminAuth = require("../../middleware/admin.middleware");
const controller = require("../../controller/admin/user.controller");

router.get(
  "/api/admin/user/getUserList",
  requireAdminAuth,
  controller.getUserList
);
router.post(
  "/api/admin/user/createUser",
  requireAdminAuth,
  controller.createUser
);
router.post(
  "/api/admin/user/updateUser",
  requireAdminAuth,
  controller.updateUser
);
router.post(
  "/api/admin/user/chargeUser",
  requireAdminAuth,
  controller.chargeUser
);
router.post(
  "/api/admin/user/updateUserActive",
  requireAdminAuth,
  controller.updateUserActive
);

module.exports = router;
