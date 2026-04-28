import { useState } from "react";
import { motion } from "framer-motion";
import { useApiKey } from "@/hooks/use-api-key";
import { useBackendConfig } from "@/hooks/use-backend-config";
import { useToast } from "@/hooks/use-toast";
import {
  KeyRound, ExternalLink, ShieldCheck, ShieldAlert,
  Trash2, CheckCircle, Server, User, Cpu, Zap, Globe,
} from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { apiKey, setApiKey } = useApiKey();
  const { hasBackendKey, keyType, models } = useBackendConfig();
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!inputValue.trim()) {
      toast({ title: "No key entered", description: "Please paste your API key first." });
      return;
    }
    setApiKey(inputValue.trim());
    setInputValue("");
    setShowInput(false);
    toast({
      title: "✅ API Key Saved",
      description: inputValue.trim().startsWith("sk-or-")
        ? "OpenRouter key saved — 800+ models available."
        : "OpenAI key saved — GPT models available.",
    });
  };

  const handleRemove = () => {
    setApiKey("");
    toast({ title: "Key Removed", description: "Using Tarik Bhai's system key." });
  };

  const isOpenRouter = apiKey.startsWith("sk-or-");

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
  };

  return (
    <div className="min-h-full bg-[#0b141a] overflow-y-auto scrollbar-hide">
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="max-w-xl mx-auto px-4 py-6 space-y-5"
      >
        <motion.div variants={item} className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942] rounded-full transition-all">
              ←
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-[#e9edef]">Settings</h2>
            <p className="text-[#8696a0] text-sm">Configure your Tarik Bhai AI</p>
          </div>
        </motion.div>

        {/* System Key Status */}
        {hasBackendKey && (
          <motion.div
            variants={item}
            className="relative rounded-2xl overflow-hidden border"
            style={{
              background: "rgba(0,168,132,0.07)",
              borderColor: "rgba(0,168,132,0.25)",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-[2px]"
              style={{ background: "linear-gradient(90deg, transparent, #00a884, transparent)" }} />
            <div className="p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,168,132,0.15)" }}>
                <Server className="w-5 h-5 text-[#00a884]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-[#00a884]" />
                  <span className="text-[#00a884] font-bold text-sm">System Key Active</span>
                </div>
                <p className="text-[#8696a0] text-xs leading-relaxed">
                  Tarik Bhai's {keyType === "openrouter" ? "OpenRouter" : "OpenAI"} key is pre-configured.
                  You can chat instantly — <strong className="text-[#d1d7db]">no API key required</strong>.
                  {keyType === "openrouter" && ` Access to ${models} AI models.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feature Info Cards */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {[
            { icon: Cpu, label: "Multi-Model", val: "800+", color: "#00a884" },
            { icon: Zap, label: "Streaming", val: "Real-time", color: "#00bfff" },
            { icon: Globe, label: "Languages", val: "100+", color: "#a855f7" },
          ].map(f => (
            <div key={f.label} className="rounded-xl p-3 text-center border"
              style={{ background: `${f.color}10`, borderColor: `${f.color}25` }}>
              <f.icon className="w-4 h-4 mx-auto mb-1" style={{ color: f.color }} />
              <div className="text-xs font-black" style={{ color: f.color }}>{f.val}</div>
              <div className="text-[10px] text-[#8696a0] mt-0.5">{f.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Personal API Key Section */}
        <motion.div variants={item} className="bg-[#202c33] border border-[#2a3942] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a3942] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#2a3942]">
              <User className="w-4 h-4 text-[#8696a0]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e9edef]">Your Personal API Key</h3>
              <p className="text-[10px] text-[#8696a0]">Optional — overrides the system key</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Current key status */}
            {apiKey ? (
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${isOpenRouter ? "bg-[#00a884]/10 border-[#00a884]/30" : "bg-blue-500/10 border-blue-500/30"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isOpenRouter ? "bg-[#00a884]" : "bg-blue-400"}`} />
                  <span className={`text-xs font-semibold ${isOpenRouter ? "text-[#00a884]" : "text-blue-400"}`}>
                    {isOpenRouter ? "OpenRouter key active" : "OpenAI key active"}
                  </span>
                </div>
                <button
                  onClick={handleRemove}
                  className="p-1.5 text-[#8696a0] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-all"
                  title="Remove key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#8696a0]">
                {hasBackendKey
                  ? "Using system key. Add your own key below for private access."
                  : "No key configured. Add your OpenAI or OpenRouter key to start chatting."}
              </p>
            )}

            {/* Add / change key */}
            {!showInput && (
              <button
                onClick={() => setShowInput(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#2a3942] text-[#8696a0] hover:text-[#d1d7db] hover:border-[#00a884]/40 hover:bg-[#00a884]/5 transition-all text-sm"
              >
                <KeyRound className="w-4 h-4" />
                {apiKey ? "Change API key" : "Add your API key"}
              </button>
            )}

            {showInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <input
                  type="password"
                  value={inputValue}
                  autoFocus
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setShowInput(false); }}
                  placeholder="sk-... or sk-or-..."
                  className="w-full lux-input text-sm"
                  style={{ borderRadius: "12px" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-[#00a884] hover:bg-[#008f6f] text-[#0b141a] text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    Save Key
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setInputValue(""); }}
                    className="px-4 py-2.5 rounded-xl text-[#8696a0] hover:bg-[#2a3942] text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Links */}
            <div className="flex flex-col gap-1.5 pt-1">
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#00a884] hover:underline flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Get OpenRouter key (recommended — 800+ models)
              </a>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#00a884] hover:underline flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> Get OpenAI key
              </a>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-[#8696a0] pt-1 border-t border-[#2a3942]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Your personal key is stored only in this browser and sent directly to OpenAI/OpenRouter — never to our servers.
            </div>
          </div>
        </motion.div>

        {/* Security notice */}
        <motion.div variants={item}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a3942] bg-[#202c33]/50">
          <ShieldCheck className="w-5 h-5 text-[#00a884] shrink-0" />
          <p className="text-xs text-[#8696a0]">
            All conversations are encrypted in transit. Chat history is stored only in your browser's local storage.
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
