import { useMemo } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";

const ABI = [
  "function registerInstitution(address, string, string, string) external",
  "function deactivateInstitution(address) external",
  "function getInstitution(address) external view returns (tuple(string name, string country, string website, bool isActive, uint256 registeredAt, uint256 credentialCount))",
  "function issueCredential(address, string, string, string, uint256, string) external returns (bytes32)",
  "function revokeCredential(bytes32, string) external",
  "function verifyCredential(bytes32) external returns (tuple(bytes32 credentialHash, address institution, address recipient, string recipientName, string degree, string major, uint256 graduationYear, uint256 issuedAt, string ipfsCID, bool isRevoked, string revocationReason) cred, bool isValid, string institutionName)",
  "function credentials(bytes32) external view returns (tuple(bytes32 credentialHash, address institution, address recipient, string recipientName, string degree, string major, uint256 graduationYear, uint256 issuedAt, string ipfsCID, bool isRevoked, string revocationReason))",
  "function getRecipientCredentials(address) external view returns (bytes32[])",
  "function getInstitutionCredentials(address) external view returns (bytes32[])",
  "function totalCredentials() external view returns (uint256)",
  "function totalInstitutions() external view returns (uint256)",
  "function pause() external",
  "function unpause() external",
  "event CredentialIssued(bytes32 indexed credentialHash, address indexed institution, address indexed recipient, string degree, uint256 timestamp)",
  "event CredentialRevoked(bytes32 indexed credentialHash, string reason, uint256 timestamp)",
  "event InstitutionRegistered(address indexed institution, string name, uint256 timestamp)",
];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function fmt(c) {
  return {
    credentialHash: c.credentialHash, institution: c.institution, recipient: c.recipient,
    recipientName: c.recipientName, degree: c.degree, major: c.major,
    graduationYear: Number(c.graduationYear), issuedAt: Number(c.issuedAt),
    ipfsCID: c.ipfsCID, isRevoked: c.isRevoked, revocationReason: c.revocationReason,
  };
}

export function useContract() {
  const { provider, signer } = useWallet();

  const readContract  = useMemo(() => provider && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, ABI, provider) : null, [provider]);
  const writeContract = useMemo(() => signer   && CONTRACT_ADDRESS ? new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)   : null, [signer]);

  async function issueCredential({ recipient, recipientName, degree, major, graduationYear, ipfsCID }) {
    if (!writeContract) throw new Error("Wallet not connected");
    const tx      = await writeContract.issueCredential(recipient, recipientName, degree, major, graduationYear, ipfsCID || "");
    const receipt = await tx.wait();
    const event   = receipt.logs.map(l => { try { return writeContract.interface.parseLog(l); } catch { return null; } }).find(e => e?.name === "CredentialIssued");
    return { txHash: receipt.hash, credentialHash: event?.args?.credentialHash, blockNumber: receipt.blockNumber };
  }

  async function revokeCredential(hash, reason) {
    if (!writeContract) throw new Error("Wallet not connected");
    return await (await writeContract.revokeCredential(hash, reason)).wait();
  }

  async function verifyCredential(hash) {
    if (!readContract) throw new Error("No provider");
    try {
      const r = await readContract.verifyCredential.staticCall(hash);
      return { credential: fmt(r.cred), isValid: r.isValid, institutionName: r.institutionName };
    } catch (err) {
      if (err.message.includes("CredentialNotFound")) return null;
      throw err;
    }
  }

  async function getMyCredentials(address) {
    if (!readContract) throw new Error("No provider");
    const hashes = await readContract.getRecipientCredentials(address);
    return Promise.all(hashes.map(async h => fmt(await readContract.credentials(h))));
  }

  async function getStats() {
    if (!readContract) return { totalCredentials: 0, totalInstitutions: 0 };
    const [c, i] = await Promise.all([readContract.totalCredentials(), readContract.totalInstitutions()]);
    return { totalCredentials: Number(c), totalInstitutions: Number(i) };
  }

  return { readContract, writeContract, issueCredential, revokeCredential, verifyCredential, getMyCredentials, getStats };
}
