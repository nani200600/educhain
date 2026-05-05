const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const { getCredential, getInstitutionCredentials } = require("../utils/blockchain");
const { uploadFileToIPFS, getIPFSUrl } = require("../utils/ipfs");
const Credential = require("../models/Credential");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * GET /api/credentials/recent
 * Get the 20 most recently issued credentials (from MongoDB cache)
 */
router.get("/recent", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const credentials = await Credential.find({ isRevoked: false })
      .sort({ issuedAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, count: credentials.length, credentials });
  } catch (err) { next(err); }
});

/**
 * POST /api/credentials/upload-document
 * Upload a PDF credential document to IPFS
 * Returns: { cid, ipfsUrl }
 */
router.post("/upload-document", upload.single("document"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    if (req.file.mimetype !== "application/pdf")
      return res.status(400).json({ error: "Only PDF files are accepted." });

    const metadata = {
      recipientName: req.body.recipientName || "Unknown",
      degree:        req.body.degree        || "Unknown",
      uploadedAt:    new Date().toISOString(),
    };

    const cid     = await uploadFileToIPFS(req.file.buffer, req.file.originalname, metadata);
    const ipfsUrl = getIPFSUrl(cid);

    res.json({ success: true, cid, ipfsUrl });
  } catch (err) { next(err); }
});

/**
 * GET /api/credentials/institution/:address
 */
router.get("/institution/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address))
      return res.status(400).json({ error: "Invalid address." });

    // Try MongoDB cache first (faster)
    let credentials = await Credential.find({ institution: address.toLowerCase() })
      .sort({ issuedAt: -1 }).lean().catch(() => null);

    // Fallback to on-chain if DB empty
    if (!credentials || credentials.length === 0) {
      credentials = await getInstitutionCredentials(address);
    }

    res.json({ success: true, count: credentials.length, credentials });
  } catch (err) { next(err); }
});

/**
 * GET /api/credentials/:hash
 */
router.get("/:hash", async (req, res, next) => {
  try {
    const { hash } = req.params;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
      return res.status(400).json({ error: "Invalid hash." });

    // Try DB cache first
    let credential = await Credential.findOne({ credentialHash: hash }).lean().catch(() => null);
    if (!credential) credential = await getCredential(hash);
    if (!credential) return res.status(404).json({ error: "Credential not found." });

    res.json({ success: true, credential });
  } catch (err) { next(err); }
});

module.exports = router;
