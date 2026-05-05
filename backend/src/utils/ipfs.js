const axios = require("axios");
const FormData = require("form-data");

const PINATA_API_KEY    = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_BASE       = "https://api.pinata.cloud";

/**
 * Upload a file buffer to IPFS via Pinata
 * @param {Buffer} buffer     - File buffer
 * @param {string} filename   - Original filename
 * @param {object} metadata   - Optional metadata object
 * @returns {string}          - IPFS CID
 */
async function uploadFileToIPFS(buffer, filename, metadata = {}) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured. Set PINATA_API_KEY and PINATA_SECRET_KEY.");
  }

  const form = new FormData();
  form.append("file", buffer, { filename, contentType: "application/pdf" });

  const pinataMetadata = JSON.stringify({ name: filename, keyvalues: metadata });
  form.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  form.append("pinataOptions", pinataOptions);

  const { data } = await axios.post(`${PINATA_BASE}/pinning/pinFileToIPFS`, form, {
    maxBodyLength: Infinity,
    headers: {
      ...form.getHeaders(),
      pinata_api_key:        PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
  });

  return data.IpfsHash; // CID
}

/**
 * Upload a JSON object to IPFS via Pinata
 * @param {object} json       - JSON data
 * @param {string} name       - Name for the pin
 * @returns {string}          - IPFS CID
 */
async function uploadJSONToIPFS(json, name = "credential-metadata") {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured.");
  }

  const { data } = await axios.post(
    `${PINATA_BASE}/pinning/pinJSONToIPFS`,
    { pinataMetadata: { name }, pinataContent: json },
    {
      headers: {
        "Content-Type":        "application/json",
        pinata_api_key:        PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  return data.IpfsHash;
}

/**
 * Check if Pinata connection is working
 */
async function testPinataConnection() {
  if (!PINATA_API_KEY) return false;
  try {
    const { data } = await axios.get(`${PINATA_BASE}/data/testAuthentication`, {
      headers: {
        pinata_api_key:        PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });
    return data.message === "Congratulations! You are communicating with the Pinata API!";
  } catch {
    return false;
  }
}

/**
 * Get IPFS gateway URL for a CID
 */
function getIPFSUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

module.exports = { uploadFileToIPFS, uploadJSONToIPFS, testPinataConnection, getIPFSUrl };
