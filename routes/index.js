const express = require("express");
const router = new express.Router();

const adminAuthRouter = require("./admin/auth.router.js");
const adminUserRouter = require("./admin/user.router.js");
const adminServiceRouter = require("./admin/service.router.js");
const adminActivityLogRouter = require("./admin/activitylog.router.js");

const clientAuthRouter = require("./client/auth.router.js");
const clientUserRouter = require("./client/user.router.js");
const clientServiceRouter = require("./client/service.router.js");

router.use(adminAuthRouter);
router.use(adminUserRouter);
router.use(adminServiceRouter);
router.use(adminActivityLogRouter);

router.use(clientAuthRouter);
router.use(clientUserRouter);
router.use(clientServiceRouter);

module.exports = router;
