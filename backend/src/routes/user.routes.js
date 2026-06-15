const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/user.controller");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

module.exports = router;
