const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
    validate,
    registerRules,
    loginRules
} = require("../middleware/validation.middleware");

const {
    register,
    login,
    addFavorite,
    getFavorites,
    addRecentlyPlayed,
    getRecentlyPlayed
} = require("../controllers/auth.controller");

router.post("/register", registerRules, validate, register);

router.post("/login", loginRules, validate, login);

router.post(
    "/favorites/:songId",
    authMiddleware,
    addFavorite
);


router.get(
    "/favorites",
    authMiddleware,
    getFavorites
);

router.post(
    "/recently-played/:songId",
    authMiddleware,
    addRecentlyPlayed
);

router.get(
    "/recently-played",
    authMiddleware,
    getRecentlyPlayed
);

module.exports = router;