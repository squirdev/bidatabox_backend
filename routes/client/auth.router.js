const express = require("express");
const router = express.Router();

// const requireAuth = require("../../../middlewares/auth.guard");
// const requireAdmin = require("../../../middlewares/admin.guard");
const controller = require("../../controller/client/auth.controller");

router.post("/api/auth/signin", controller.signIn);

module.exports = router;
