const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/educhain";
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected:", uri.replace(/:\/\/.*@/, "://***@"));
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.warn("⚠️  Running without database — some features disabled.");
  }
}

module.exports = connectDB;
