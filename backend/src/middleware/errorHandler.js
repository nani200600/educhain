function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (err.code === "CALL_EXCEPTION" || err.reason)
    return res.status(400).json({ error: "Blockchain error", message: err.reason || err.message });
  if (err.name === "ValidationError")
    return res.status(400).json({ error: err.message });
  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ error: "Invalid token" });
  const status  = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
