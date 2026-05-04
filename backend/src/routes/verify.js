const express = require("express");
const router  = express.Router();
const { verifyCredential, getRecipientCredentials, getStats } = require("../utils/blockchain");

router.get("/stats/overview", async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json({ success: true, ...stats });
  } catch (err) { next(err); }
});

router.get("/wallet/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address))
      return res.status(400).json({ error: "Invalid Ethereum address." });
    const credentials = await getRecipientCredentials(address);
    res.json({ success: true, address, count: credentials.length, credentials });
  } catch (err) { next(err); }
});

router.get("/:hash", async (req, res, next) => {
  try {
    const { hash } = req.params;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
      return res.status(400).json({ error: "Invalid credential hash format." });
    const result = await verifyCredential(hash);
    if (!result) return res.status(404).json({ error: "Credential not found." });
    res.json({ success: true, isValid: result.isValid, institutionName: result.institutionName, credential: result.credential, verifiedAt: new Date().toISOString() });
  } catch (err) { next(err); }
});

module.exports = router;
