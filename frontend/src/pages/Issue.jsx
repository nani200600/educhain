import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import { GraduationCap, CheckCircle, Copy, ExternalLink, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const DEGREES = [
  "Bachelor of Science (B.Sc.)","Bachelor of Technology (B.Tech.)","Bachelor of Arts (B.A.)",
  "Master of Science (M.Sc.)","Master of Technology (M.Tech.)","Master of Business Administration (MBA)",
  "Doctor of Philosophy (Ph.D.)","Diploma","Certificate",
];
const IC = "w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm";

export default function Issue() {
  const { account, connectWallet } = useWallet();
  const { issueCredential }        = useContract();
  const [form, setForm]            = useState({ recipient:"", recipientName:"", degree:"", major:"", graduationYear: new Date().getFullYear(), ipfsCID:"" });
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued]         = useState(null);
  const [error,  setError]          = useState(null);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!account) { connectWallet(); return; }
    if (!/^0x[0-9a-fA-F]{40}$/.test(form.recipient)) { setError("Invalid recipient Ethereum address."); return; }
    setSubmitting(true); setError(null);
    const id = toast.loading("Submitting to blockchain...");
    try {
      const result = await issueCredential({ ...form, graduationYear: Number(form.graduationYear) });
      setIssued(result);
      toast.success("Credential issued!", { id });
    } catch (err) {
      const msg = err.reason || err.message || "Transaction failed.";
      setError(msg); toast.error(msg, { id });
    } finally { setSubmitting(false); }
  }

  if (issued) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-white mb-3">Credential Issued!</h1>
      <p className="text-gray-400 mb-8">Permanently recorded on the Ethereum blockchain.</p>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-left space-y-4 mb-8">
        <div><p className="text-gray-500 text-sm mb-1">Credential Hash</p><p className="font-mono text-blue-300 text-sm break-all">{issued.credentialHash}</p></div>
        <div><p className="text-gray-500 text-sm mb-1">Transaction Hash</p><p className="font-mono text-gray-300 text-sm break-all">{issued.txHash}</p></div>
        <div><p className="text-gray-500 text-sm mb-1">Block</p><p className="text-white">{issued.blockNumber}</p></div>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={() => { navigator.clipboard.writeText(issued.credentialHash); toast.success("Copied!"); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl">
          <Copy className="w-4 h-4" /> Copy Hash
        </button>
        <a href={`/verify/${issued.credentialHash}`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl border border-gray-700">
          <ExternalLink className="w-4 h-4" /> View Credential
        </a>
        <button onClick={() => { setIssued(null); setForm({ recipient:"", recipientName:"", degree:"", major:"", graduationYear: new Date().getFullYear(), ipfsCID:"" }); }}
          className="text-gray-400 hover:text-white px-5 py-2.5 rounded-xl border border-gray-700">
          Issue Another
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <GraduationCap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-3">Issue Credential</h1>
        <p className="text-gray-400">Issue a tamper-proof credential on Ethereum. <span className="text-yellow-400 text-sm">Institution wallet required.</span></p>
      </div>

      {!account && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-blue-300 text-sm">Connect your institution wallet to issue credentials.</p>
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { label:"Student Wallet Address", name:"recipient",     placeholder:"0x...",                    type:"text" },
          { label:"Student Full Name",      name:"recipientName", placeholder:"e.g. Zhang Wei",           type:"text" },
          { label:"Field of Study / Major", name:"major",         placeholder:"e.g. Computer Science",   type:"text" },
          { label:"Graduation Year",        name:"graduationYear",placeholder:"",                         type:"number" },
          { label:"IPFS Document CID (optional)", name:"ipfsCID", placeholder:"QmXxx...",                 type:"text", required:false },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">{f.label} {f.required !== false && <span className="text-red-400">*</span>}</label>
            <input name={f.name} value={form[f.name]} onChange={onChange} placeholder={f.placeholder} type={f.type} className={IC} required={f.required !== false} />
          </div>
        ))}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Degree / Qualification <span className="text-red-400">*</span></label>
          <select name="degree" value={form.degree} onChange={onChange} className={IC} required>
            <option value="">Select degree type</option>
            {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors mt-4">
          {!account ? "Connect Wallet to Issue" : submitting ? "Submitting to Blockchain..." : "Issue Credential"}
        </button>
      </form>
    </div>
  );
}
