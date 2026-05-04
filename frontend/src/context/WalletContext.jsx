import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const WalletContext = createContext(null);

const SUPPORTED = [1, 11155111, 1337, 97];
const NAMES     = { 1: "Mainnet", 11155111: "Sepolia", 1337: "Localhost", 97: "BSC Testnet" };

export function WalletProvider({ children }) {
  const [account,      setAccount]      = useState(null);
  const [provider,     setProvider]     = useState(null);
  const [signer,       setSigner]       = useState(null);
  const [chainId,      setChainId]      = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setIsConnecting(true);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = await web3Provider.getSigner();
      const network    = await web3Provider.getNetwork();
      const address    = await web3Signer.getAddress();
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      toast.success(`Connected: ${address.slice(0,6)}...${address.slice(-4)}`);
    } catch (err) {
      toast.error(err.code === 4001 ? "Rejected by user." : "Connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null); setProvider(null); setSigner(null); setChainId(null);
    toast.success("Disconnected.");
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", (accs) => accs.length ? setAccount(accs[0]) : disconnectWallet());
    window.ethereum.on("chainChanged",    () => window.location.reload());
    window.ethereum.request({ method: "eth_accounts" }).then(accs => { if (accs.length) connectWallet(); });
    return () => { window.ethereum.removeAllListeners("accountsChanged"); window.ethereum.removeAllListeners("chainChanged"); };
  }, [connectWallet, disconnectWallet]);

  return (
    <WalletContext.Provider value={{
      account, provider, signer, chainId,
      networkName: NAMES[chainId] || `Chain ${chainId}`,
      isConnecting,
      isCorrectNetwork: SUPPORTED.includes(chainId),
      connectWallet, disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
}
