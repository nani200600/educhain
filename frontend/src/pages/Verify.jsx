import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { useContract } from "../hooks/useContract";
import toast from "react-hot-toast";

export default function Verify() {
  const { hash: urlHash }    = useParams();
  const navigate             = useNavigate();
  const { verifyCredential } = useContract();
  const [hash,    setHash]   = useState(urlHash || "");
  const [result,  setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState(null);

  useEffect(() => { if (urlHash) handleVerify(urlHash); }, [urlHash]);

  async function handleVerify(target) {
    const h = (target || hash).trim();
    if (!h) return;
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) { setError("Invalid hash — must be 0x-prefixed 32-byte hex."); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await verifyCredential(h);
      if (!data) { setError("Credential not found on blockchain."); }
      else { setResult(data); navigate(`/verify/${h}`, { replace: true }); }
    } catch (err) { setError(err.message || "Verification failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Verify Credential</h1>
        <p className="text-gray-400">Enter a credential hash to verify its authenticity on-chain.</p>
      </div>

      <div className="relative mb-8">
        <input
          value={hash} onChange={e => setHash(e.target.value)} onKeyDown={e => e.key === "Enter" && handleVerify()}
          placeholder="0x1234...abcd (credential hash)"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 pr-36 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button onClick={() => handleVerify()} disabled={loading || !hash}
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Search className="w-4 h-4" /> {loading ? "Verifying..." : "Verify"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 text-red-300 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className={`border rounded-2xl overflow-hidden ${result.isValid ? "border-green-700/50 bg-green-900/10" : "border-red-700/50 bg-red-900/10"}`}>
          <div className={`flex items-center gap-3 px-6 py-4 ${result.isValid ? "bg-green-900/30" : "bg-red-900/30"}`}>
            {result.isValid ? <CheckCircle className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
            <div>
              <div className={`font-bold text-lg ${result.isValid ? "text-green-300" : "text-red-300"}`}>
                {result.isValid ? "✓ Credential is VALID" : "✗ Credential is REVOKED"}
              </div>
              <div className="text-sm text-gray-400">Verified on {new Date().toLocaleString()}</div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            {[
              { label: "Recipient",          value: result.credential.recipientName },
              { label: "Degree",             value: result.credential.degree },
              { label: "Major",              value: result.credential.major },
              { label: "Graduation Year",    value: result.credential.graduationYear },
              { label: "Institution",        value: result.institutionName },
              { label: "Institution Address",value: `${result.credential.institution.slice(0,10)}...${result.credential.institution.slice(-8)}`, mono: true },
              { label: "Issued At",          value: new Date(result.credential.issuedAt * 1000).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-gray-800/50">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className={`text-white text-sm ${mono ? "font-mono" : "font-medium"}`}>{value || "—"}</span>
              </div>
            ))}
            {result.credential.isRevoked && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm font-medium">Revocation Reason:</p>
                <p className="text-red-300 text-sm mt-1">{result.credential.revocationReason}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { navigator.clipboard.writeText(hash); toast.success("Copied!"); }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors">
                <Copy className="w-4 h-4" /> Copy Hash
              </button>
              {result.credential.ipfsCID && (
                <a href={`https://ipfs.io/ipfs/${result.credential.ipfsCID}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 border border-gray-700 hover:border-blue-700 px-4 py-2 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" /> View Document
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <div className="text-center text-gray-600 py-12">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Enter a credential hash to verify it on Ethereum.</p>
          <p className="text-sm mt-2">Free — no wallet required.</p>
        </div>
      )}
    </div>
  );
}
