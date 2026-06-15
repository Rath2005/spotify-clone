const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Song = require("../models/song.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Register User
// @route   POST /register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email
    };

    res.status(201).json({
        message: "User Registered Successfully",
        user: userResponse
    });
});

// @desc    Login User
// @route   POST /login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid password");
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email
    };

    res.json({
        message: "Login Successful",
        token,
        user: userResponse
    });
});

// @desc    Add Song to Favorites
// @route   POST /favorites/:songId
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
    const { songId } = req.params;

    const song = await Song.findById(songId);
    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (!user.favorites.includes(songId)) {
        user.favorites.push(songId);
        await user.save();
    }

    res.json({
        message: "Song added to favorites"
    });
});

// @desc    Get Favorite Songs
// @route   GET /favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user.favorites);
});

// @desc    Add Song to Recently Played
// @route   POST /recently-played/:songId
// @access  Private
const addRecentlyPlayed = asyncHandler(async (req, res) => {
    const { songId } = req.params;

    const song = await Song.findById(songId);
    if (!song) {
        res.status(404);
        throw new Error("Song not found");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.recentlyPlayed = user.recentlyPlayed.filter(
        id => id.toString() !== songId.toString()
    );
    user.recentlyPlayed.unshift(songId);
    await user.save();

    res.json({
        message: "Song added to recently played"
    });
});

// @desc    Get Recently Played Songs
// @route   GET /recently-played
// @access  Private
const getRecentlyPlayed = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate("recentlyPlayed");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user.recentlyPlayed);
});

module.exports = {
    register,
    login,
    addFavorite,
    getFavorites,
    addRecentlyPlayed,
    getRecentlyPlayed
};