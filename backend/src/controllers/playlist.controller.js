const Playlist = require("../models/playlist.model");
const Song = require("../models/song.model");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a playlist
// @route   POST /playlists
// @access  Private
const createPlaylist = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const playlist = await Playlist.create({
        name,
        user: req.user.id
    });

    res.status(201).json(playlist);
});

// @desc    Get all playlists
// @route   GET /playlists
// @access  Public
const getPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.find()
        .populate("user", "name email")
        .populate("songs");

    res.json(playlists);
});

// @desc    Get playlist details by ID
// @route   GET /playlists/:id
// @access  Public
const getPlaylistById = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.params.id)
        .populate("user", "name email")
        .populate("songs");

    if (!playlist) {
        res.status(404);
        throw new Error("Playlist not found");
    }

    res.json(playlist);
});

// @desc    Add song to playlist
// @route   POST /playlists/:playlistId/add-song/:songId
// @access  Private
const addSongToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        res.status(404);
        throw new Error("Playlist not found");
    }

    const song = await Song.findById(songId);
    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    // Avoid duplicates
    if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
        await playlist.save();
    }

    res.json({
        message: "Song added to playlist",
        playlist
    });
});

// @desc    Remove song from playlist
// @route   DELETE /playlists/:playlistId/remove-song/:songId
// @access  Private
const removeSongFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        res.status(404);
        throw new Error("Playlist not found");
    }

    playlist.songs = playlist.songs.filter(
        song => song.toString() !== songId
    );

    await playlist.save();

    res.json({
        message: "Song removed from playlist",
        playlist
    });
});

module.exports = {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist
};