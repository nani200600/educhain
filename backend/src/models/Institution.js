const mongoose = require("mongoose");

const InstitutionSchema = new mongoose.Schema({
  address:         { type: String, required: true, unique: true, lowercase: true, index: true },
  name:            { type: String, required: true },
  country:         { type: String, required: true },
  website:         { type: String, default: "" },
  isActive:        { type: Boolean, default: true, index: true },
  registeredAt:    { type: Number, required: true },  // block timestamp
  credentialCount: { type: Number, default: 0 },

  // Off-chain extras
  txHash:          { type: String },
  blockNumber:     { type: Number },
  network:         { type: String, default: "sepolia" },
  syncedAt:        { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Institution", InstitutionSchema);
