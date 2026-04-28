import { Link, useLocation } from "wouter";
import { Phone, Settings, ArrowLeft, Wifi } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";
import { useBackendConfig } from "@/hooks/use-backend-config";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { apiKey } = useApiKey();
  const { hasBackendKey } = useBackendConfig();
  const isHome = location === "/";
  const isOnline = !!apiKey || hasBackendKey;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex py-0 px-0 w-full bg-[#202c33]/95 backdrop-blur-md border-b border-[#2a3942]/60 shadow-[0_2px_20px_rgba(0,0,0,0.3)] h-[60px]">
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-2.5">
          {!isHome && (
            <button
              onClick={() => navigate("/")}
              className="p-1.5 text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942] rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#00a884] shadow-[0_0_12px_rgba(0,168,132,0.4)]">
                <img
                  src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
                  alt="Tarik Bhai AI"
                  className="w-full h-full object-cover scale-150"
                />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#202c33] ${isOnline ? "bg-[#00a884]" : "bg-[#8696a0]"}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-[#e9edef] leading-tight group-hover:text-white transition-colors">
                Tarik Bhai AI
              </span>
              <span className="text-[11px] flex items-center gap-1" style={{ color: isOnline ? "#00a884" : "#8696a0" }}>
                {isOnline ? (
                  <>
                    <Wifi className="w-2.5 h-2.5" />
                    <span>online{hasBackendKey && !apiKey ? " · powered" : apiKey ? " · your key" : ""}</span>
                  </>
                ) : (
                  <span>set api key</span>
                )}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/918984473230"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/10 transition-all"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Call Tarik Bhai</span>
          </a>
          <Link href="/settings">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8696a0] border border-[#2a3942] hover:bg-[#2a3942] hover:text-[#d1d7db] transition-all">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
