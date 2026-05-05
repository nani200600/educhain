import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import { Shield, CheckCircle, AlertCircle, Building2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const IC = "w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm";

export default function Admin() {
  const { account, connectWallet } = useWallet();
  const { writeContract, readContract } = useContract();

  const [regForm, setRegForm]           = useState({ address: "", name: "", country: "", website: "" });
  const [deactivateAddr, setDeactivateAddr] = useState("");
  const [lookup,    setLookup]          = useState("");
  const [instResult, setInstResult]     = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [success,    setSuccess]        = useState(null);
  const [error,      setError]          = useState(null);

  async function handleRegister(e) {
    e.preventDefault();
    if (!writeContract) { connectWallet(); return; }
    if (!/^0x[0-9a-fA-F]{40}$/.test(regForm.address)) { setError("Invalid address."); return; }
    setSubmitting(true); setError(null); setSuccess(null);
    const id = toast.loading("Registering institution on-chain...");
    try {
      const tx = await writeContract.registerInstitution(regForm.address, regForm.name, regForm.country, regForm.website);
      await tx.wait();
      setSuccess(`✓ ${regForm.name} registered successfully!`);
      setRegForm({ address: "", name: "", country: "", website: "" });
      toast.success("Institution registered!", { id });
    } catch (err) {
      const msg = err.reason || err.message || "Transaction failed.";
      setError(msg); toast.error(msg, { id });
    } finally { setSubmitting(false); }
  }

  async function handleDeactivate() {
    if (!writeContract || !/^0x[0-9a-fA-F]{40}$/.test(deactivateAddr)) return;
    const id = toast.loading("Deactivating institution...");
    try {
      await (await writeContract.deactivateInstitution(deactivateAddr)).wait();
      toast.success("Institution deactivated.", { id });
      setDeactivateAddr("");
    } catch (err) {
      toast.error(err.reason || err.message, { id });
    }
  }

  async function handleLookup() {
    if (!readContract || !/^0x[0-9a-fA-F]{40}$/.test(lookup)) return;
    try {
      const inst = await readContract.getInstitution(lookup);
      setInstResult(Number(inst.registeredAt) === 0 ? null : {
        name: inst.name, country: inst.country, website: inst.website,
        isActive: inst.isActive, registeredAt: Number(inst.registeredAt),
        credentialCount: Number(inst.credentialCount),
      });
    } catch { setInstResult(null); }
  }

  if (!account) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Shield className="w-16 h-16 text-gray-600 mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-white mb-3">Admin Panel</h1>
      <p className="text-gray-400 mb-6">Connect the contract owner wallet to access admin functions.</p>
      <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl">Connect Wallet</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Shield className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm font-mono">{account}</p>
        </div>
      </div>

      {/* Register Institution */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold text-xl mb-1 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-400" /> Register Institution
        </h2>
        <p className="text-gray-500 text-sm mb-5">Grant INSTITUTION_ROLE to an Ethereum address.</p>

        {error   && <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 text-red-300 rounded-xl p-3 mb-4 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
        {success && <div className="flex items-center gap-2 bg-green-900/20 border border-green-800 text-green-300 rounded-xl p-3 mb-4 text-sm"><CheckCircle className="w-4 h-4" />{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { label: "Institution Wallet Address", name: "address",  placeholder: "0x..." },
            { label: "Institution Name",           name: "name",     placeholder: "e.g. Tsinghua University" },
            { label: "Country",                    name: "country",  placeholder: "e.g. China" },
            { label: "Website",                    name: "website",  placeholder: "https://tsinghua.edu.cn" },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-gray-300 text-sm font-medium mb-1">{f.label} <span className="text-red-400">*</span></label>
              <input name={f.name} value={regForm[f.name]} onChange={e => setRegForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                placeholder={f.placeholder} className={IC} required />
            </div>
          ))}
          <button type="submit" disabled={submitting}
            className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {submitting ? "Submitting..." : "Register Institution"}
          </button>
        </form>
      </section>

      {/* Lookup Institution */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold text-xl mb-5">Lookup Institution</h2>
        <div className="flex gap-3 mb-4">
          <input value={lookup} onChange={e => setLookup(e.target.value)} placeholder="0x institution address"
            className={IC + " flex-1"} />
          <button onClick={handleLookup} className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl transition-colors text-sm font-medium">
            Lookup
          </button>
        </div>
        {instResult && (
          <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
            {[
              ["Name",        instResult.name],
              ["Country",     instResult.country],
              ["Website",     instResult.website],
              ["Active",      instResult.isActive ? "Yes ✓" : "No ✗"],
              ["Credentials", instResult.credentialCount],
              ["Registered",  new Date(instResult.registeredAt * 1000).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}
        {instResult === null && lookup && <p className="text-gray-500 text-sm">Not found or not registered.</p>}
      </section>

      {/* Deactivate Institution */}
      <section className="bg-gray-900 border border-red-900/30 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-xl mb-1 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-400" /> Deactivate Institution
        </h2>
        <p className="text-gray-500 text-sm mb-5">Revoke INSTITUTION_ROLE — they can no longer issue credentials.</p>
        <div className="flex gap-3">
          <input value={deactivateAddr} onChange={e => setDeactivateAddr(e.target.value)}
            placeholder="0x institution address to deactivate" className={IC + " flex-1"} />
          <button onClick={handleDeactivate}
            className="bg-red-700 hover:bg-red-600 text-white px-5 rounded-xl transition-colors text-sm font-medium">
            Deactivate
          </button>
        </div>
      </section>
    </div>
  );
}
