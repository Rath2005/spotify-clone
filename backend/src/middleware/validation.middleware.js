const { body, validationResult } = require("express-validator");

// Helper middleware to verify validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation rules
const registerRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters long"),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
];

const loginRules = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

const songRules = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Song title is required"),
    body("artist")
        .trim()
        .notEmpty()
        .withMessage("Artist name is required"),
    body("album")
        .optional()
        .trim(),
    body("duration")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Duration must be a positive number"),
    body("audioUrl")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Audio URL cannot be empty"),
    body("coverImage")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Cover image URL cannot be empty")
];

const playlistRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Playlist name is required")
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    songRules,
    playlistRules
};
