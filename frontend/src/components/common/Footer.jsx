import { GraduationCap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-10 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">EduChain</span>
          <span className="text-gray-600">·</span>
          <span className="text-sm">Decentralized Academic Credentials</span>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link to="/verify"   className="hover:text-white">Verify</Link>
          <Link to="/issue"    className="hover:text-white">Issue</Link>
          <Link to="/explorer" className="hover:text-white">Explorer</Link>
          <a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
            <Globe className="w-3 h-3" /> Etherscan
          </a>
        </div>
        <p className="text-gray-600 text-xs">© 2024 EduChain. MIT License.</p>
      </div>
    </footer>
  );
}
