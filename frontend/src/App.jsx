import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";
import Navbar    from "./components/common/Navbar";
import Footer    from "./components/common/Footer";
import Home      from "./pages/Home";
import Verify    from "./pages/Verify";
import Issue     from "./pages/Issue";
import Dashboard from "./pages/Dashboard";
import Explorer  from "./pages/Explorer";
import Admin     from "./pages/Admin";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-950 text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"             element={<Home />} />
              <Route path="/verify"       element={<Verify />} />
              <Route path="/verify/:hash" element={<Verify />} />
              <Route path="/issue"        element={<Issue />} />
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/explorer"     element={<Explorer />} />
              <Route path="/admin"        element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" toastOptions={{ style: { background: "#1f2937", color: "#f9fafb", border: "1px solid #374151" } }} />
      </BrowserRouter>
    </WalletProvider>
  );
}
