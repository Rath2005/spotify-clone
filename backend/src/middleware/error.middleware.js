const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error details for the developer
    console.error("Global Error Handler Log:", err);

    // Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError") {
        error = new Error(`Resource not found with id of ${err.value}`);
        error.statusCode = 404;
    }

    // Mongoose Duplicate Key Error (code 11000)
    if (err.code === 11000) {
        error = new Error("Duplicate field value entered");
        error.statusCode = 400;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message).join(", ");
        error = new Error(message);
        error.statusCode = 400;
    }

    // Multer Upload Errors
    if (err.name === "MulterError") {
        error = new Error(`File upload error: ${err.message}`);
        error.statusCode = 400;
    }

    const statusCode = error.statusCode || err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};

module.exports = errorHandler;
