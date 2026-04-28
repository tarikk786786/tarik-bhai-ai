import { Link, useLocation } from "wouter";
import { Phone, Settings, ArrowLeft, ChevronRight } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";
import { useBackendConfig } from "@/hooks/use-backend-config";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { apiKey } = useApiKey();
  const { hasBackendKey } = useBackendConfig();
  const isHome = location === "/";
  const isOnline = !!apiKey || hasBackendKey;
  const isChat = location === "/chat";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center"
      style={{ background: "rgba(11,20,26,0.92)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center px-4">

        {/* Left */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              onClick={() => navigate("/")}
              className="p-1.5 text-[#8696a0] hover:text-[#d1d7db] rounded-xl hover:bg-white/5 transition-all mr-1"
            >
              <ArrowLeft className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: "2px solid rgba(0,168,132,0.6)", boxShadow: "0 0 10px rgba(0,168,132,0.3)" }}>
                <img
                  src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
                  alt="Tarik Bhai AI"
                  className="w-full h-full object-cover scale-150"
                />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[#0b141a] ${isOnline ? "bg-[#00a884]" : "bg-[#8696a0]"}`} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[15px] font-semibold text-[#e9edef] leading-tight group-hover:text-white transition-colors">Tarik Bhai AI</span>
              <span className="text-[10px] text-[#8696a0]">{isOnline ? "● online" : "○ offline"}</span>
            </div>
          </Link>

          {isChat && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#2a3942] hidden sm:block" />
              <span className="text-[13px] text-[#8696a0] hidden sm:block">Chat</span>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <a
            href="https://wa.me/918984473230"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#25D366] hover:bg-[#25D366]/10 transition-all"
            style={{ border: "1px solid rgba(37,211,102,0.2)" }}
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <Link href="/settings">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#8696a0] hover:text-[#d1d7db] hover:bg-white/5 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
