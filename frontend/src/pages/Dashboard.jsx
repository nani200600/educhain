import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import { GraduationCap, Wallet, RefreshCw } from "lucide-react";
import CredentialCard from "../components/dashboard/CredentialCard";
import EmptyState from "../components/common/EmptyState";
import { SkeletonCard } from "../components/common/LoadingSkeleton";

export default function Dashboard() {
  const { account, connectWallet }  = useWallet();
  const { getMyCredentials }        = useContract();
  const [credentials, setCredentials] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  async function load(showRefresh = false) {
    if (!account) return;
    showRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const creds = await getMyCredentials(account);
      setCredentials(creds);
    } catch (err) {
      console.error("Failed to load credentials:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [account]);

  if (!account) return (
    <div className="max-w-md mx-auto px-4 py-24">
      <EmptyState
        icon={<Wallet className="w-8 h-8" />}
        title="Connect Your Wallet"
        description="Connect your student wallet to view your on-chain academic credentials."
        action={
          <button onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Connect Wallet
          </button>
        }
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Credentials</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">
            {account.slice(0, 10)}...{account.slice(-8)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-white text-sm">
            {credentials.length} credential{credentials.length !== 1 ? "s" : ""}
          </span>
          <button onClick={() => load(true)} disabled={refreshing}
            className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white p-2 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && credentials.length === 0 && (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No Credentials Found"
          description="No credentials have been issued to this wallet address yet. Ask your institution to issue one."
        />
      )}

      {/* Cards */}
      {!loading && credentials.length > 0 && (
        <div className="space-y-4">
          {credentials.map(cred => (
            <CredentialCard key={cred.credentialHash} cred={cred} />
          ))}
        </div>
      )}
    </div>
  );
}
