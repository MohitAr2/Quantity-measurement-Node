function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);
    res.status(err.statusCode || 400).json({
        error: true,
        message: err.message || "Something went wrong",
        timestamp: new Date().toISOString(),
        path: req.path,
    });
}

module.exports = errorHandler;