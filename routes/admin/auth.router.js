const express = require("express");
const router = express.Router();

// const requireAuth = require("../../../middlewares/auth.guard");
// const requireAdmin = require("../../../middlewares/admin.guard");
const controller = require("../../controller/admin/auth.controller");

router.post("/api/admin/auth/signin", controller.signIn);

module.exports = router;
