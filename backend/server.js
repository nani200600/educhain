const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
require("dotenv").config();

const credentialRoutes  = require("./src/routes/credentials");
const institutionRoutes = require("./src/routes/institutions");
const verifyRoutes      = require("./src/routes/verify");
const errorHandler      = require("./src/middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => res.json({
  status: "ok", service: "EduChain API", version: "1.0.0",
  timestamp: new Date().toISOString(), network: process.env.NETWORK || "sepolia",
}));

app.use("/api/credentials",  credentialRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/verify",       verifyRoutes);

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 EduChain API on port ${PORT}`);
  console.log(`📦 Contract: ${process.env.CONTRACT_ADDRESS}`);
  console.log(`🌐 Network:  ${process.env.NETWORK}\n`);
});

module.exports = app;
