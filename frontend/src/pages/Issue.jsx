import { useState, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import { GraduationCap, CheckCircle, Copy, ExternalLink, AlertCircle, Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const DEGREES = [
  "Bachelor of Science (B.Sc.)","Bachelor of Technology (B.Tech.)","Bachelor of Arts (B.A.)",
  "Master of Science (M.Sc.)","Master of Technology (M.Tech.)","Master of Business Administration (MBA)",
  "Doctor of Philosophy (Ph.D.)","Diploma","Certificate",
];
const IC  = "w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Issue() {
  const { account, connectWallet }    = useWallet();
  const { issueCredential }           = useContract();
  const fileInputRef                  = useRef(null);
  const [form, setForm]               = useState({ recipient:"", recipientName:"", degree:"", major:"", graduationYear: new Date().getFullYear(), ipfsCID:"" });
  const [pdfFile,     setPdfFile]     = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [issued,      setIssued]      = useState(null);
  const [error,       setError]       = useState(null);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Only PDF files accepted."); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error("File must be under 10MB."); return; }
    setPdfFile(file);
  }

  async function uploadToIPFS() {
    if (!pdfFile) return null;
    setUploading(true);
    const id = toast.loading("Uploading document to IPFS...");
    try {
      const fd = new FormData();
      fd.append("document",      pdfFile);
      fd.append("recipientName", form.recipientName);
      fd.append("degree",        form.degree);
      const { data } = await axios.post(`${API}/api/credentials/upload-document`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Uploaded! CID: ${data.cid.slice(0,12)}...`, { id });
      setForm(p => ({ ...p, ipfsCID: data.cid }));
      return data.cid;
    } catch (err) {
      toast.error(err.response?.data?.error || "IPFS upload failed.", { id });
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!account) { connectWallet(); return; }
    if (!/^0x[0-9a-fA-F]{40}$/.test(form.recipient)) { setError("Invalid recipient address."); return; }

    setSubmitting(true); setError(null);

    // Upload PDF first if attached and not yet uploaded
    let cid = form.ipfsCID;
    if (pdfFile && !form.ipfsCID) {
      cid = await uploadToIPFS();
      if (!cid) { setSubmitting(false); return; }
    }

    const id = toast.loading("Submitting to blockchain...");
    try {
      const result = await issueCredential({ ...form, ipfsCID: cid || "", graduationYear: Number(form.graduationYear) });
      setIssued(result);
      toast.success("Credential issued on-chain!", { id });
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
        {form.ipfsCID && <div><p className="text-gray-500 text-sm mb-1">Document (IPFS)</p><a href={`https://gateway.pinata.cloud/ipfs/${form.ipfsCID}`} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline break-all">{form.ipfsCID}</a></div>}
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        <button onClick={() => { navigator.clipboard.writeText(issued.credentialHash); toast.success("Copied!"); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl">
          <Copy className="w-4 h-4" /> Copy Hash
        </button>
        <a href={`/verify/${issued.credentialHash}`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl border border-gray-700">
          <ExternalLink className="w-4 h-4" /> View Credential
        </a>
        <button onClick={() => { setIssued(null); setForm({ recipient:"", recipientName:"", degree:"", major:"", graduationYear: new Date().getFullYear(), ipfsCID:"" }); setPdfFile(null); }}
          className="text-gray-400 hover:text-white px-5 py-2.5 rounded-xl border border-gray-700">Issue Another</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <GraduationCap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-3">Issue Credential</h1>
        <p className="text-gray-400">Issue a tamper-proof credential on Ethereum.<br /><span className="text-yellow-400 text-sm">Institution wallet required.</span></p>
      </div>

      {!account && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-blue-300 text-sm">Connect your institution wallet to continue.</p>
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
          { label:"Student Wallet Address", name:"recipient",      placeholder:"0x..." },
          { label:"Student Full Name",      name:"recipientName",  placeholder:"e.g. Zhang Wei" },
          { label:"Field of Study / Major", name:"major",          placeholder:"e.g. Computer Science" },
          { label:"Graduation Year",        name:"graduationYear", placeholder:"", type:"number" },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">{f.label} <span className="text-red-400">*</span></label>
            <input name={f.name} value={form[f.name]} onChange={onChange} placeholder={f.placeholder} type={f.type || "text"} className={IC} required />
          </div>
        ))}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Degree <span className="text-red-400">*</span></label>
          <select name="degree" value={form.degree} onChange={onChange} className={IC} required>
            <option value="">Select degree type</option>
            {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Degree Document (PDF, optional)</label>
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" />
          {!pdfFile ? (
            <button type="button" onClick={() => fileInputRef.current.click()}
              className="w-full border-2 border-dashed border-gray-700 hover:border-blue-600 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors">
              <Upload className="w-8 h-8" />
              <span className="text-sm">Click to upload PDF (max 10MB)</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-3">
              <FileText className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{pdfFile.name}</p>
                <p className="text-gray-500 text-xs">{(pdfFile.size / 1024).toFixed(1)} KB</p>
              </div>
              {form.ipfsCID
                ? <span className="text-green-400 text-xs">✓ Uploaded to IPFS</span>
                : <button type="button" onClick={uploadToIPFS} disabled={uploading}
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {uploading ? "Uploading..." : "Upload to IPFS"}
                  </button>
              }
              <button type="button" onClick={() => { setPdfFile(null); setForm(p => ({ ...p, ipfsCID: "" })); }}
                className="text-gray-500 hover:text-red-400"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting || uploading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2">
          {!account ? "Connect Wallet to Issue" : submitting ? "Submitting to Blockchain..." : "Issue Credential"}
        </button>
      </form>
    </div>
  );
}
