const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/user.middleware");
// const requireAdmin = require("../../../middlewares/admin.guard");
const controller = require("../../controller/client/user.controller");

router.get("/api/user/getInfo", authMiddleware, controller.getInfo);
router.post(
  "/api/user/update-user-credit",
  authMiddleware,
  controller.updateCredit
);

module.exports = router;
