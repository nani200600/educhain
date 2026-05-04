import { useEffect, useState } from "react";
import { useContract } from "../hooks/useContract";
import { Link } from "react-router-dom";
import { Search, ExternalLink } from "lucide-react";

export default function Explorer() {
  const { getStats, readContract }  = useContract();
  const [stats,  setStats]   = useState({ totalCredentials: 0, totalInstitutions: 0 });
  const [search, setSearch]  = useState("");
  const [result, setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState(null);

  useEffect(() => { getStats().then(setStats).catch(() => {}); }, []);

  async function handleSearch() {
    if (!search.trim() || !readContract) return;
    const h = search.trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) { setError("Enter a valid credential hash."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const cred = await readContract.credentials(h);
      if (Number(cred.issuedAt) === 0) { setError("Not found."); }
      else setResult({
        credentialHash: cred.credentialHash, institution: cred.institution, recipient: cred.recipient,
        recipientName: cred.recipientName, degree: cred.degree, major: cred.major,
        graduationYear: Number(cred.graduationYear), issuedAt: Number(cred.issuedAt),
        isRevoked: cred.isRevoked,
      });
    } catch { setError("Lookup failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">Blockchain Explorer</h1>
      <p className="text-gray-400 mb-10">Search credentials issued on the EduChain contract.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Credentials",  value: stats.totalCredentials },
          { label: "Total Institutions", value: stats.totalInstitutions },
          { label: "Network",            value: "Sepolia" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search by credential hash (0x...)"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 pr-36 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button onClick={handleSearch} disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Search className="w-4 h-4" /> {loading ? "..." : "Search"}
        </button>
      </div>

      {error  && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {result && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{result.degree}</h2>
            <span className={`text-xs px-2 py-1 rounded-full border ${result.isRevoked ? "text-red-400 border-red-700 bg-red-900/20" : "text-green-400 border-green-700 bg-green-900/20"}`}>
              {result.isRevoked ? "Revoked" : "Valid"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["Recipient",  result.recipientName],
              ["Major",      result.major],
              ["Year",       result.graduationYear],
              ["Issued",     new Date(result.issuedAt * 1000).toLocaleDateString()],
              ["Institution",`${result.institution.slice(0,10)}...${result.institution.slice(-6)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <Link to={`/verify/${result.credentialHash}`} className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
            <ExternalLink className="w-4 h-4" /> Full Verification Page
          </Link>
        </div>
      )}
    </div>
  );
}
