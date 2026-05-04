const { ethers } = require("ethers");
const EduChainABI = require("../../blockchain/artifacts/contracts/EduChain.sol/EduChain.json");

let provider, contract, signer;

function initBlockchain() {
  const { RPC_URL, BACKEND_PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
  provider = new ethers.JsonRpcProvider(RPC_URL || "http://127.0.0.1:8545");
  if (BACKEND_PRIVATE_KEY) {
    signer   = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, EduChainABI.abi, signer);
  } else {
    contract = new ethers.Contract(CONTRACT_ADDRESS, EduChainABI.abi, provider);
  }
  console.log("✅ Blockchain connected:", CONTRACT_ADDRESS);
}

function getContract() {
  if (!contract) initBlockchain();
  return contract;
}

function fmt(cred) {
  return {
    credentialHash:   cred.credentialHash,
    institution:      cred.institution,
    recipient:        cred.recipient,
    recipientName:    cred.recipientName,
    degree:           cred.degree,
    major:            cred.major,
    graduationYear:   Number(cred.graduationYear),
    issuedAt:         Number(cred.issuedAt),
    ipfsCID:          cred.ipfsCID,
    isRevoked:        cred.isRevoked,
    revocationReason: cred.revocationReason,
  };
}

async function getCredential(hash) {
  const c    = getContract();
  const cred = await c.credentials(hash);
  return cred.issuedAt === 0n ? null : fmt(cred);
}

async function verifyCredential(hash) {
  try {
    const result = await getContract().verifyCredential.staticCall(hash);
    return { credential: fmt(result.cred), isValid: result.isValid, institutionName: result.institutionName };
  } catch (err) {
    if (err.message.includes("CredentialNotFound")) return null;
    throw err;
  }
}

async function getRecipientCredentials(address) {
  const hashes = await getContract().getRecipientCredentials(address);
  return (await Promise.all(hashes.map(getCredential))).filter(Boolean);
}

async function getInstitutionCredentials(address) {
  const hashes = await getContract().getInstitutionCredentials(address);
  return (await Promise.all(hashes.map(getCredential))).filter(Boolean);
}

async function getInstitution(address) {
  const inst = await getContract().getInstitution(address);
  if (inst.registeredAt === 0n) return null;
  return {
    address,
    name:            inst.name,
    country:         inst.country,
    website:         inst.website,
    isActive:        inst.isActive,
    registeredAt:    Number(inst.registeredAt),
    credentialCount: Number(inst.credentialCount),
  };
}

async function getStats() {
  const c = getContract();
  const [creds, insts] = await Promise.all([c.totalCredentials(), c.totalInstitutions()]);
  return { totalCredentials: Number(creds), totalInstitutions: Number(insts) };
}

module.exports = { initBlockchain, getContract, getCredential, verifyCredential, getRecipientCredentials, getInstitutionCredentials, getInstitution, getStats };
