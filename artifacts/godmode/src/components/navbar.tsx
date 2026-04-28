import { Link, useLocation } from "wouter";
import { Phone, Settings, ArrowLeft } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { apiKey } = useApiKey();
  const isHome = location === "/";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex py-3 px-4 w-full bg-[#202c33]/90 backdrop-blur-md border-b border-[#2a3942]/60 shadow-lg h-[60px]">
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate("/")}
              className="p-1.5 text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942] rounded-full transition-all flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00a884] shadow-[0_0_12px_rgba(0,168,132,0.4)] shrink-0">
              <img
                src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
                alt="Tarik Bhai AI"
                className="w-full h-full object-cover scale-150"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-semibold text-[#e9edef] leading-tight">Tarik Bhai AI</span>
              <span className="text-xs text-[#00a884] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] inline-block animate-pulse" />
                {apiKey ? "online" : "set api key"}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/918984473230"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/10 transition-all"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Call Tarik Bhai</span>
          </a>
          <Link href="/settings">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8696a0] border border-[#2a3942] hover:bg-[#2a3942] hover:text-[#d1d7db] transition-all">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
