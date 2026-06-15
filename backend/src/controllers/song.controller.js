const Song = require("../models/song.model");
const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a new song
// @route   POST /songs
// @access  Private
const createSong = asyncHandler(async (req, res) => {
    const { title, artist, album, duration, coverImage, audioUrl } = req.body;

    const song = await Song.create({
        title,
        artist,
        album,
        duration,
        coverImage,
        audioUrl
    });

    res.status(201).json(song);
});

// @desc    Get all songs with filtering and pagination
// @route   GET /songs
// @access  Public
const getSongs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, artist, album } = req.query;

    const query = {};

    if (artist) {
        query.artist = { $regex: artist, $options: "i" };
    }

    if (album) {
        query.album = { $regex: album, $options: "i" };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalSongs = await Song.countDocuments(query);
    const songs = await Song.find(query).skip(skip).limit(limitNum);
    const totalPages = Math.ceil(totalSongs / limitNum) || 1;

    res.json({
        songs,
        totalSongs,
        currentPage: pageNum,
        totalPages
    });
});

// @desc    Get song by ID and auto-track recently played
// @route   GET /songs/:id
// @access  Private
const getSongById = asyncHandler(async (req, res) => {
    const song = await Song.findById(req.params.id);

    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    // Auto-track recently played if user is authenticated
    if (req.user && req.user.id) {
        const user = await User.findById(req.user.id);
        if (user) {
            // Avoid duplicates by removing existing entries for this song
            user.recentlyPlayed = user.recentlyPlayed.filter(
                id => id.toString() !== song._id.toString()
            );
            user.recentlyPlayed.unshift(song._id);
            await user.save();
        }
    }

    res.json(song);
});

// @desc    Update a song
// @route   PUT /songs/:id
// @access  Private
const updateSong = asyncHandler(async (req, res) => {
    const song = await Song.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    res.json(song);
});

// @desc    Delete a song
// @route   DELETE /songs/:id
// @access  Private
const deleteSong = asyncHandler(async (req, res) => {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    res.json({
        message: "Song deleted successfully"
    });
});

// @desc    Search songs by title
// @route   GET /songs/search
// @access  Public
const searchSongs = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    const songs = await Song.find({
        title: {
            $regex: q,
            $options: "i"
        }
    });

    res.json(songs);
});

// @desc    Upload song cover image
// @route   POST /songs/:id/upload-cover
// @access  Private
const uploadCoverImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("Please upload an image file");
    }

    const result = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: "spotify-covers"
        }
    );

    const song = await Song.findByIdAndUpdate(
        req.params.id,
        {
            coverImage: result.secure_url
        },
        { new: true }
    );

    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    res.json(song);
});

module.exports = {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    searchSongs,
    uploadCoverImage
};