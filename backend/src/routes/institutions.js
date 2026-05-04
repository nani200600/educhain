const express = require("express");
const router  = express.Router();
const { getInstitution } = require("../utils/blockchain");

router.get("/:address", async (req, res, next) => {
  try {
    const { address } = req.params;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address))
      return res.status(400).json({ error: "Invalid address." });
    const institution = await getInstitution(address);
    if (!institution) return res.status(404).json({ error: "Institution not found." });
    res.json({ success: true, institution });
  } catch (err) { next(err); }
});

module.exports = router;
