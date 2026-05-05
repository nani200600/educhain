const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
  // On-chain data (mirrored for fast queries)
  credentialHash:   { type: String, required: true, unique: true, index: true },
  institution:      { type: String, required: true, lowercase: true, index: true },
  recipient:        { type: String, required: true, lowercase: true, index: true },
  recipientName:    { type: String, required: true },
  degree:           { type: String, required: true },
  major:            { type: String, required: true },
  graduationYear:   { type: Number, required: true },
  issuedAt:         { type: Number, required: true },  // block timestamp
  ipfsCID:          { type: String, default: "" },
  isRevoked:        { type: Boolean, default: false, index: true },
  revocationReason: { type: String, default: "" },

  // Off-chain extras
  txHash:           { type: String },
  blockNumber:      { type: Number },
  network:          { type: String, default: "sepolia" },
  syncedAt:         { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Compound indexes for common queries
CredentialSchema.index({ institution: 1, issuedAt: -1 });
CredentialSchema.index({ recipient: 1, issuedAt: -1 });
CredentialSchema.index({ issuedAt: -1 });

// Virtual: IPFS gateway URL
CredentialSchema.virtual("ipfsUrl").get(function () {
  return this.ipfsCID ? `https://gateway.pinata.cloud/ipfs/${this.ipfsCID}` : null;
});

CredentialSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Credential", CredentialSchema);
