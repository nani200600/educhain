import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { path: "/verify",    label: "Verify" },
  { path: "/issue",     label: "Issue" },
  { path: "/explorer",  label: "Explorer" },
  { path: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, networkName, isConnecting } = useWallet();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const short = account ? `${account.slice(0,6)}...${account.slice(-4)}` : null;

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="w-7 h-7 text-blue-400" />
          <span>Edu<span className="text-blue-400">Chain</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {LINKS.map(({ path, label }) => (
            <Link key={path} to={path} className={`text-sm font-medium transition-colors ${location.pathname === path ? "text-blue-400" : "text-gray-400 hover:text-white"}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {account && <span className="text-xs text-gray-500 border border-gray-700 px-2 py-1 rounded-full">{networkName}</span>}
          {account ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 font-mono bg-gray-800 px-3 py-1.5 rounded-lg">{short}</span>
              <button onClick={disconnectWallet} className="text-xs text-red-400 hover:text-red-300">Disconnect</button>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>

        <button className="md:hidden text-gray-400" onClick={() => setOpen(v => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 pb-4 pt-2 space-y-2">
          {LINKS.map(({ path, label }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)} className="block py-2 text-gray-300 hover:text-white">{label}</Link>
          ))}
          <div className="pt-2">
            {account
              ? <div className="flex justify-between"><span className="font-mono text-sm text-gray-300">{short}</span><button onClick={disconnectWallet} className="text-red-400 text-sm">Disconnect</button></div>
              : <button onClick={connectWallet} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Connect Wallet</button>
            }
          </div>
        </div>
      )}
    </nav>
  );
}
