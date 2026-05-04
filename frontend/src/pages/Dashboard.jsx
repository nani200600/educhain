import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import { GraduationCap, ExternalLink, AlertTriangle, Wallet } from "lucide-react";
import QRCode from "react-qr-code";

export default function Dashboard() {
  const { account, connectWallet } = useWallet();
  const { getMyCredentials }       = useContract();
  const [credentials, setCredentials] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [qrFor,       setQrFor]       = useState(null);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    getMyCredentials(account).then(setCredentials).catch(console.error).finally(() => setLoading(false));
  }, [account]);

  if (!account) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h1>
      <p className="text-gray-400 mb-6">Connect your student wallet to view your on-chain credentials.</p>
      <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">Connect Wallet</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">My Credentials</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">{account}</p>
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-xl text-white text-sm">{credentials.length} credential{credentials.length !== 1 ? "s" : ""}</div>
      </div>

      {loading && <div className="text-center py-20 text-gray-500">Loading from blockchain...</div>}

      {!loading && credentials.length === 0 && (
        <div className="text-center py-20">
          <GraduationCap className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No credentials found for this wallet.</p>
        </div>
      )}

      <div className="space-y-4">
        {credentials.map(cred => (
          <div key={cred.credentialHash} className={`bg-gray-900 border rounded-2xl p-6 transition-colors ${cred.isRevoked ? "border-red-800/50" : "border-gray-800 hover:border-gray-700"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-semibold text-lg">{cred.degree}</h2>
                  {cred.isRevoked && (
                    <span className="flex items-center gap-1 text-red-400 text-xs bg-red-900/20 border border-red-800 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Revoked
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{cred.major} · Class of {cred.graduationYear}</p>
                <p className="text-gray-500 text-xs mt-1 font-mono">{cred.credentialHash.slice(0,20)}...{cred.credentialHash.slice(-8)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setQrFor(qrFor === cred.credentialHash ? null : cred.credentialHash)}
                  className="text-xs border border-gray-700 hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                  QR Code
                </button>
                <a href={`/verify/${cred.credentialHash}`}
                  className="text-xs flex items-center gap-1 border border-gray-700 hover:border-blue-700 text-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                  <ExternalLink className="w-3 h-3" /> Verify
                </a>
              </div>
            </div>
            {qrFor === cred.credentialHash && (
              <div className="mt-4 flex flex-col items-center gap-3 pt-4 border-t border-gray-800">
                <QRCode value={`${window.location.origin}/verify/${cred.credentialHash}`} size={160} bgColor="#111827" fgColor="#ffffff" />
                <p className="text-gray-500 text-xs">Scan to verify this credential</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
