import { useEffect, useState, useCallback } from "react";
import { useContract } from "../hooks/useContract";
import { Link } from "react-router-dom";
import { Search, ExternalLink, RefreshCw } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Explorer() {
  const { getStats }             = useContract();
  const [stats,   setStats]      = useState({ totalCredentials: 0, totalInstitutions: 0 });
  const [recent,  setRecent]     = useState([]);
  const [search,  setSearch]     = useState("");
  const [result,  setResult]     = useState(null);
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const s = await getStats().catch(() => ({ totalCredentials: 0, totalInstitutions: 0 }));
    setStats(s);
  }, [getStats]);

  const loadRecent = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await axios.get(`${API}/api/credentials/recent`);
      if (data.success) setRecent(data.credentials);
    } catch {
      // backend might not be running in pure frontend mode — silently ignore
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadRecent();
  }, []);

  async function handleSearch() {
    const h = search.trim();
    if (!h) return;
    if (!/^0x[0-9a-fA-F]{64}$/.test(h)) { setError("Enter a valid 0x-prefixed credential hash."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await axios.get(`${API}/api/verify/${h}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Credential not found.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-bold text-white">Blockchain Explorer</h1>
        <button onClick={() => { loadStats(); loadRecent(); }} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
      <p className="text-gray-400 mb-10">Live view of credentials on the EduChain contract.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Credentials",  value: stats.totalCredentials },
          { label: "Total Institutions", value: stats.totalInstitutions },
          { label: "Network",            value: "Sepolia" },
          { label: "Status",             value: "Live ✓" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search by credential hash (0x...)"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 pr-32 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button onClick={handleSearch} disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Search className="w-4 h-4" /> {loading ? "..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

      {/* Search Result */}
      {result && (
        <div className="bg-gray-900 border border-blue-700/50 rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">{result.credential?.degree}</h2>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${result.isValid ? "text-green-400 border-green-700 bg-green-900/20" : "text-red-400 border-red-700 bg-red-900/20"}`}>
              {result.isValid ? "✓ Valid" : "✗ Revoked"}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              ["Recipient",   result.credential?.recipientName],
              ["Major",       result.credential?.major],
              ["Year",        result.credential?.graduationYear],
              ["Institution", result.institutionName],
              ["Issued",      result.credential?.issuedAt ? new Date(result.credential.issuedAt * 1000).toLocaleDateString() : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <Link to={`/verify/${result.credential?.credentialHash}`}
            className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
            <ExternalLink className="w-4 h-4" /> Full Verification Page
          </Link>
        </div>
      )}

      {/* Recent Credentials Feed */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Credentials</h2>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-gray-600 border border-gray-800 rounded-xl">
            <p>No recent credentials cached. Backend needed for this feed.</p>
            <p className="text-sm mt-1">Use the search above to look up credentials directly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(cred => (
              <div key={cred.credentialHash} className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-5 py-4 transition-colors">
                <div>
                  <p className="text-white font-medium text-sm">{cred.degree} — {cred.major}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {cred.recipientName} · {new Date(cred.issuedAt * 1000).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/verify/${cred.credentialHash}`}
                  className="text-xs text-blue-400 hover:text-blue-300 border border-gray-700 hover:border-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
