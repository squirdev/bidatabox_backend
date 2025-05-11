const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/user.middleware");
const controller = require("../../controller/client/service.controller");

router.post("/api/service/phoneUpload", authMiddleware, controller.phoneUpload);
router.post(
  "/api/service/phonePreUpload",
  authMiddleware,
  controller.phonePreUpload
);
router.post(
  "/api/service/socialUpload",
  authMiddleware,
  controller.socialUpload
);
router.post(
  "/api/service/socialPreUpload",
  authMiddleware,
  controller.socialPreUpload
);
router.post(
  "/api/service/phone-detect-list",
  authMiddleware,
  controller.phoneDetectList
);
router.post(
  "/api/service/social-detect-list",
  authMiddleware,
  controller.socialDetectList
);
router.post(
  "/api/service/phone-delete-row",
  authMiddleware,
  controller.phoneDeleteRow
);
router.post(
  "/api/service/social-delete-row",
  authMiddleware,
  controller.socialDeleteRow
);
module.exports = router;
