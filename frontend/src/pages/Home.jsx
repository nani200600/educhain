import { Link } from "react-router-dom";
import { Shield, Search, GraduationCap, Globe, Lock, Zap } from "lucide-react";
import { useContract } from "../hooks/useContract";
import { useEffect, useState } from "react";

const FEATURES = [
  { icon: <Shield className="w-6 h-6 text-blue-400" />,  title: "Tamper-Proof",        desc: "Credentials stored permanently on Ethereum. Once issued, they cannot be altered or forged." },
  { icon: <Search className="w-6 h-6 text-green-400" />, title: "Instant Verification", desc: "Anyone can verify a credential in seconds with just a hash — no login required." },
  { icon: <Globe  className="w-6 h-6 text-purple-400" />, title: "Globally Accessible",  desc: "No borders, no bureaucracy. Accessible from anywhere in the world, 24/7." },
  { icon: <Lock   className="w-6 h-6 text-yellow-400" />, title: "Student Owned",        desc: "Students hold credentials in their own wallet. No institution can delete their records." },
  { icon: <GraduationCap className="w-6 h-6 text-red-400" />, title: "Institution Verified", desc: "Only admin-approved institutions can issue credentials on EduChain." },
  { icon: <Zap    className="w-6 h-6 text-orange-400" />, title: "Revocation Support",   desc: "Institutions can revoke fraudulent credentials. Revocation is transparent and auditable." },
];

export default function Home() {
  const { getStats } = useContract();
  const [stats, setStats] = useState({ totalCredentials: 0, totalInstitutions: 0 });
  useEffect(() => { getStats().then(setStats).catch(() => {}); }, []);

  return (
    <div>
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Built on Ethereum — Decentralized & Open Source
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Academic Credentials,<br />
            <span className="text-blue-400">Secured on Blockchain</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            EduChain eliminates fake degrees by letting accredited institutions issue tamper-proof, verifiable credentials directly on Ethereum.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/verify" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg">Verify a Credential</Link>
            <Link to="/issue"  className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg border border-gray-700">Issue Credential</Link>
          </div>
          <div className="flex gap-12 justify-center mt-16">
            {[
              { label: "Credentials Issued",  value: stats.totalCredentials.toLocaleString() },
              { label: "Institutions",        value: stats.totalInstitutions.toLocaleString() },
              { label: "Forgeries Possible",  value: "0" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why EduChain?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Institution Issues",  desc: "An accredited institution connects their wallet and issues a credential on-chain." },
              { step: "02", title: "Student Receives",    desc: "The student receives a unique credential hash and QR code to share." },
              { step: "03", title: "Anyone Verifies",     desc: "Employers or universities paste the hash to instantly verify authenticity." },
            ].map(item => (
              <div key={item.step}>
                <div className="text-6xl font-black text-gray-800 mb-4">{item.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
