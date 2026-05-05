import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { GraduationCap, Menu, X, Shield } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { path: "/verify",    label: "Verify" },
  { path: "/issue",     label: "Issue" },
  { path: "/explorer",  label: "Explorer" },
  { path: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, networkName, isConnecting, isCorrectNetwork } = useWallet();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const short = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null;

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white">Edu<span className="text-blue-400">Chain</span></span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(({ path, label }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link key={path} to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Wallet + Admin */}
        <div className="hidden md:flex items-center gap-2">
          {account && !isCorrectNetwork && (
            <span className="text-xs text-yellow-400 border border-yellow-700/50 bg-yellow-900/20 px-2 py-1 rounded-full">
              Wrong network
            </span>
          )}
          {account && isCorrectNetwork && (
            <span className="text-xs text-gray-500 border border-gray-800 px-2 py-1 rounded-full">{networkName}</span>
          )}
          {account ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 font-mono bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">{short}</span>
              <button onClick={disconnectWallet} className="text-xs text-gray-500 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-gray-900 transition-colors">
                Disconnect
              </button>
              <Link to="/admin" title="Admin Panel"
                className="p-2 text-gray-600 hover:text-blue-400 hover:bg-gray-900 rounded-lg transition-colors">
                <Shield className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-400 hover:text-white p-2" onClick={() => setOpen(v => !v)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 pb-5 pt-3 space-y-1">
          {LINKS.map(({ path, label }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname.startsWith(path) ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-800 mt-2">
            {account ? (
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-sm text-gray-300">{short}</span>
                <button onClick={disconnectWallet} className="text-red-400 text-sm">Disconnect</button>
              </div>
            ) : (
              <button onClick={connectWallet}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
