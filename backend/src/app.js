const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const songRoutes = require("./routes/song.routes");
const playlistRoutes = require("./routes/playlist.routes");
const userRoutes = require("./routes/user.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging Middleware
app.use(morgan("dev"));

// Body Parser
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
    res.send("Spotify Backend Running");
});

// Register Routes
app.use("/", authRoutes);
app.use("/songs", songRoutes);
app.use("/playlists", playlistRoutes);
app.use("/profile", userRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;