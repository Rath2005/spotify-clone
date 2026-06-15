const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { validate, playlistRules } = require("../middleware/validation.middleware");

const {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist
} = require("../controllers/playlist.controller");

router.post("/", authMiddleware, playlistRules, validate, createPlaylist);

router.get("/", getPlaylists);

router.get("/:id", getPlaylistById);

router.post(
    "/:playlistId/add-song/:songId",
    authMiddleware,
    addSongToPlaylist
);

router.delete(
    "/:playlistId/remove-song/:songId",
    authMiddleware,
    removeSongFromPlaylist
);

module.exports = router;