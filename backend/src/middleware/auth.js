const { ethers } = require("ethers");

/**
 * Middleware: verify that the request is signed by the institution
 * 
 * Expects headers:
 *   x-wallet-address: "0x..."
 *   x-signature:      signed message
 *   x-message:        the exact message that was signed
 */
function requireSignature(req, res, next) {
  try {
    const address   = req.headers["x-wallet-address"];
    const signature = req.headers["x-signature"];
    const message   = req.headers["x-message"];

    if (!address || !signature || !message) {
      return res.status(401).json({ error: "Missing authentication headers (x-wallet-address, x-signature, x-message)." });
    }

    // Verify message was signed within the last 5 minutes
    const parts     = message.split("|");
    const timestamp = parseInt(parts[parts.length - 1]);
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return res.status(401).json({ error: "Signature expired. Please re-sign." });
    }

    // Recover signer address
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature verification failed." });
    }

    req.walletAddress = address.toLowerCase();
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid signature." });
  }
}

/**
 * Helper for frontend: generate the message to sign
 * Call this client-side before sending request
 */
function buildSignMessage(action, address) {
  return `EduChain Auth | ${action} | ${address} | ${Date.now()}`;
}

module.exports = { requireSignature, buildSignMessage };
