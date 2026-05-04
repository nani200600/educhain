const express = require("express");
const router  = express.Router();
const { getCredential, getInstitutionCredentials } = require("../utils/blockchain");

router.get("/institution/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address))
      return res.status(400).json({ error: "Invalid address." });
    const credentials = await getInstitutionCredentials(address);
    res.json({ success: true, count: credentials.length, credentials });
  } catch (err) { next(err); }
});

router.get("/:hash", async (req, res, next) => {
  try {
    const { hash } = req.params;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
      return res.status(400).json({ error: "Invalid hash." });
    const credential = await getCredential(hash);
    if (!credential) return res.status(404).json({ error: "Credential not found." });
    res.json({ success: true, credential });
  } catch (err) { next(err); }
});

module.exports = router;
