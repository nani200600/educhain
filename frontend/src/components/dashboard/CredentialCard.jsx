import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, AlertTriangle, Copy, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import StatusBadge from "../common/StatusBadge";
import toast from "react-hot-toast";

export default function CredentialCard({ cred }) {
  const [showQR, setShowQR] = useState(false);

  function copyHash() {
    navigator.clipboard.writeText(cred.credentialHash);
    toast.success("Hash copied to clipboard!");
  }

  const verifyURL = `${window.location.origin}/verify/${cred.credentialHash}`;

  return (
    <div className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20 ${
      cred.isRevoked ? "border-red-800/40" : "border-gray-800 hover:border-gray-700"
    }`}>
      {/* Card Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-lg leading-tight truncate">{cred.degree}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{cred.major} · Class of {cred.graduationYear}</p>
          </div>
          <StatusBadge status={cred.isRevoked ? "revoked" : "valid"} />
        </div>

        <p className="text-gray-600 text-xs font-mono truncate">
          {cred.credentialHash.slice(0, 22)}...{cred.credentialHash.slice(-10)}
        </p>
      </div>

      {/* Revocation notice */}
      {cred.isRevoked && (
        <div className="mx-6 mb-4 bg-red-900/20 border border-red-800/50 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-xs font-medium">Revoked</p>
            <p className="text-red-300/70 text-xs mt-0.5">{cred.revocationReason}</p>
          </div>
        </div>
      )}

      {/* QR Code Panel */}
      {showQR && (
        <div className="mx-6 mb-4 bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col items-center gap-3">
          <QRCode value={verifyURL} size={150} bgColor="#1f2937" fgColor="#f9fafb" />
          <p className="text-gray-400 text-xs text-center">Scan to verify this credential</p>
          <a href={verifyURL} target="_blank" rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2">
            {verifyURL.slice(0, 50)}...
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-5 flex gap-2 flex-wrap">
        <button onClick={() => setShowQR(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
            showQR ? "bg-gray-700 border-gray-600 text-white" : "border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white"
          }`}>
          {showQR ? <X className="w-3.5 h-3.5" /> : <QrCode className="w-3.5 h-3.5" />}
          {showQR ? "Hide QR" : "QR Code"}
        </button>
        <button onClick={copyHash}
          className="flex items-center gap-1.5 text-xs border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors">
          <Copy className="w-3.5 h-3.5" /> Copy Hash
        </button>
        <Link to={`/verify/${cred.credentialHash}`}
          className="flex items-center gap-1.5 text-xs border border-gray-700 hover:border-blue-700 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg transition-colors ml-auto">
          <ExternalLink className="w-3.5 h-3.5" /> Verify
        </Link>
      </div>
    </div>
  );
}
