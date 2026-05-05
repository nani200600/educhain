import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, QrCode } from "lucide-react";
import { useContract } from "../hooks/useContract";
import toast from "react-hot-toast";

export default function Verify() {
  const { hash: urlHash }    = useParams();
  const navigate             = useNavigate();
  const { verifyCredential } = useContract();
  const [hash,     setHash]  = useState(urlHash || "");
  const [result,   setResult]  = useState(null);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => { if (urlHash) handleVerify(urlHash); }, [urlHash]);

  async function handleVerify(target) {
    const h = (target || hash).trim();
    if (!h) return;
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) { setError("Invalid hash format."); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await verifyCredential(h);
      if (!data) { setError("Credential not found on blockchain."); }
      else { setResult(data); navigate(`/verify/${h}`, { replace: true }); }
    } catch (err) { setError(err.message || "Verification failed."); }
    finally { setLoading(false); }
  }

  async function startScanner() {
    setScanning(true);
    // Dynamically import html5-qrcode only when needed
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerInstanceRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract hash from URL or use raw text
          const match = decodedText.match(/0x[0-9a-fA-F]{64}/);
          if (match) {
            setHash(match[0]);
            stopScanner();
            handleVerify(match[0]);
          }
        },
        () => {}
      );
    } catch (err) {
      toast.error("Camera access denied or not available.");
      setScanning(false);
    }
  }

  async function stopScanner() {
    if (scannerInstanceRef.current) {
      await scannerInstanceRef.current.stop().catch(() => {});
      scannerInstanceRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => () => { stopScanner(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Verify Credential</h1>
        <p className="text-gray-400">Enter a hash or scan a QR code to verify on-chain.</p>
      </div>

      {/* Search + QR */}
      <div className="relative mb-4">
        <input
          value={hash} onChange={e => setHash(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleVerify()}
          placeholder="0x1234...abcd (credential hash)"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 pr-44 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="absolute right-2 top-2 bottom-2 flex gap-1">
          <button onClick={scanning ? stopScanner : startScanner}
            className={`px-3 rounded-lg transition-colors flex items-center gap-1 text-sm ${scanning ? "bg-red-700 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"} text-white`}>
            <QrCode className="w-4 h-4" />
          </button>
          <button onClick={() => handleVerify()} disabled={loading || !hash}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm">
            <Search className="w-4 h-4" /> {loading ? "..." : "Verify"}
          </button>
        </div>
      </div>

      {/* QR Scanner */}
      {scanning && (
        <div className="mb-6">
          <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden border border-gray-700" style={{ width: "100%" }} />
          <p className="text-center text-gray-400 text-sm mt-2">Point camera at a credential QR code</p>
        </div>
      )}

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
          <div className="px-6 py-5 space-y-3">
            {[
              { label: "Recipient",           value: result.credential.recipientName },
              { label: "Degree",              value: result.credential.degree },
              { label: "Major",               value: result.credential.major },
              { label: "Graduation Year",     value: result.credential.graduationYear },
              { label: "Institution",         value: result.institutionName },
              { label: "Institution Address", value: `${result.credential.institution.slice(0,10)}...${result.credential.institution.slice(-8)}`, mono: true },
              { label: "Issued At",           value: new Date(result.credential.issuedAt * 1000).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) },
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

      {!result && !error && !loading && !scanning && (
        <div className="text-center text-gray-600 py-12">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Enter a hash or scan a QR code to verify a credential.</p>
          <p className="text-sm mt-2">Free — no wallet required.</p>
        </div>
      )}
    </div>
  );
}
