const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { validate, songRules } = require("../middleware/validation.middleware");

const upload = require("../middleware/upload.middleware");

const {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    searchSongs,
    uploadCoverImage
} = require("../controllers/song.controller");

router.post("/", authMiddleware, songRules, validate, createSong);
router.put("/:id", authMiddleware, updateSong);
router.delete("/:id", authMiddleware, deleteSong);
router.get("/", getSongs);

router.get("/search", searchSongs);
router.post(
    "/:id/upload-cover",
    authMiddleware,
    upload.single("cover"),
    uploadCoverImage
);
router.get("/:id", authMiddleware, getSongById);

module.exports = router;