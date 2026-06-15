const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get logged-in user profile
// @route   GET /profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user);
});

// @desc    Update user profile
// @route   PUT /profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const { name, email } = req.body;

    if (email && email !== user.email) {
        // Prevent duplicate email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error("Email already in use");
        }
        user.email = email;
    }

    if (name) {
        user.name = name;
    }

    const updatedUser = await user.save();

    // Convert to object and delete password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
        message: "Profile updated successfully",
        user: userResponse
    });
});

module.exports = {
    getProfile,
    updateProfile
};
