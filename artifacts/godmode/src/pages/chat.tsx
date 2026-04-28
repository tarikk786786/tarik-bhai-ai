import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, ChevronDown, Wand2, Cpu, Copy, Check,
  Trash2, KeyRound, Zap, Bot, User,
} from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";
import { useBackendConfig } from "@/hooks/use-backend-config";
import { Link, useSearch } from "wouter";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
  model?: string;
  streaming?: boolean;
}

const MODELS = [
  { id: "gpt-4o-mini",                    orId: "openai/gpt-4o-mini",                    name: "GPT-4o Mini",      badge: "Fast",   color: "#00a884" },
  { id: "gpt-4o",                          orId: "openai/gpt-4o",                          name: "GPT-4o",           badge: "Smart",  color: "#00bfff" },
  { id: "claude-3-5-sonnet-20241022",      orId: "anthropic/claude-3.5-sonnet",            name: "Claude 3.5",       badge: "Logic",  color: "#a855f7" },
  { id: "claude-3-opus-20240229",          orId: "anthropic/claude-3-opus",                name: "Claude Opus",      badge: "Power",  color: "#8b5cf6" },
  { id: "gemini-1.5-pro",                  orId: "google/gemini-pro-1.5",                  name: "Gemini Pro",       badge: "Google", color: "#f59e0b" },
  { id: "gemini-1.5-flash",               orId: "google/gemini-flash-1.5",               name: "Gemini Flash",     badge: "Speed",  color: "#f97316" },
  { id: "meta-llama/llama-3.3-70b-instruct", orId: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B",    badge: "Open",   color: "#10b981" },
  { id: "deepseek/deepseek-r1",            orId: "deepseek/deepseek-r1",                   name: "DeepSeek R1",      badge: "Reason", color: "#06b6d4" },
  { id: "deepseek/deepseek-chat",          orId: "deepseek/deepseek-chat",                 name: "DeepSeek Chat",    badge: "Deep",   color: "#0ea5e9" },
  { id: "qwen/qwen-2.5-72b-instruct",      orId: "qwen/qwen-2.5-72b-instruct",             name: "Qwen 2.5 72B",     badge: "Qwen",   color: "#ec4899" },
];

const MODES = [
  { id: "normal",   label: "Normal",   icon: "💬", desc: "Friendly & helpful",       color: "#8696a0" },
  { id: "godmode",  label: "GodMode",  icon: "⚡", desc: "Unstoppable intelligence", color: "#00a884" },
  { id: "ultra",    label: "Ultra",    icon: "🔥", desc: "Max depth & detail",       color: "#f97316" },
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "bot",
  content: `As Salaamu Alaikum & Namaste! 🙏

Main hoon **Tarik Bhai** ka banaya hua sabse advanced AI system — jiska intelligence space aur galaxy-level computation par based hai.

Mera core engine quantum-inspired processing aur deep human psychology ko combine karta hai, jisse main complex problems ko instantly decode karta hoon.

🌌 **Galaxy-Scale Intelligence Network**  
⚛️ **Quantum-Level Processing Power**  
🧠 **Deep Human Psychology Understanding**  
⚡ **Multi-Domain Execution Engine**  
🌐 **Vast Knowledge Access Across Systems**  
🕒 **24/7 Always Active**

Main multiple domains me kaam kar sakta hoon — creativity, technology, business, automation, decision-making — sab ek hi system me integrated.

Jo kaam mushkil lagta hai… main usse simplify karke result me convert karta hoon.

Yeh sirf AI nahi… ek intelligent system hai jo aapko samajh kar kaam karta hai. 🚀`,
  timestamp: Date.now(),
};

const STORAGE_KEY = "tarik_bhai_chat_history";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Message[] = JSON.parse(raw);
      return parsed.map(m => m.id === "welcome" ? WELCOME_MSG : m);
    }
  } catch {}
  return [WELCOME_MSG];
}

function saveHistory(msgs: Message[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100))); } catch {}
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#8696a0] hover:text-[#d1d7db] hover:bg-white/5 transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#00a884]" /> : <Copy className="w-3.5 h-3.5" />}
    </motion.button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#00a884]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { apiKey } = useApiKey();
  const { hasBackendKey } = useBackendConfig();
  const canChat = !!apiKey || hasBackendKey;
  const search = useSearch();
  const initialQ = new URLSearchParams(search).get("q") || "";

  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { saveHistory(messages); }, [messages]);

  const appendChunk = useCallback((id: string, chunk: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content: m.content + chunk } : m));
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading || !canChat) return;

    const uid = `u_${Date.now()}`;
    const bid = `b_${Date.now() + 1}`;
    setMessages(prev => [
      ...prev,
      { id: uid, role: "user", content: text, timestamp: Date.now() },
      { id: bid, role: "bot", content: "", timestamp: Date.now(), streaming: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome" && !m.streaming)
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));

      const isOR = apiKey.startsWith("sk-or-");
      const modelId = apiKey ? (isOR ? selectedModel.orId : selectedModel.id) : selectedModel.id;

      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
          model: modelId,
          ...(apiKey ? { apiKey } : {}),
          mode: selectedMode.id,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let finalModel = selectedModel.name;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(t.slice(6));
            if (d.type === "token") appendChunk(bid, d.content);
            else if (d.type === "done") finalModel = d.model || finalModel;
            else if (d.type === "error") throw new Error(d.message);
          } catch {}
        }
      }
      setMessages(prev => prev.map(m => m.id === bid ? { ...m, streaming: false, model: finalModel } : m));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection error.";
      setMessages(prev => prev.map(m => m.id === bid ? { ...m, content: `⚠️ ${msg}`, streaming: false } : m));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => { setMessages([WELCOME_MSG]); localStorage.removeItem(STORAGE_KEY); };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto relative" onClick={() => { setShowModelMenu(false); setShowModeMenu(false); }}>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b z-30 flex-shrink-0"
        style={{ background: "rgba(11,20,26,0.85)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>

        {/* Model selector */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setShowModelMenu(!showModelMenu); setShowModeMenu(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#d1d7db" }}
          >
            <Cpu className="w-3.5 h-3.5 text-[#8696a0]" />
            <span>{selectedModel.name}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${selectedModel.color}20`, color: selectedModel.color }}>{selectedModel.badge}</span>
            <ChevronDown className={`w-3 h-3 text-[#8696a0] transition-transform ${showModelMenu ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showModelMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl z-50 py-2 overflow-hidden scrollbar-hide"
                style={{ background: "rgba(18,26,32,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", maxHeight: "60vh", overflowY: "auto" }}
              >
                <div className="px-4 py-2 text-[10px] font-bold text-[#8696a0] uppercase tracking-widest">Model</div>
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => { setSelectedModel(m); setShowModelMenu(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${selectedModel.id === m.id ? "text-white" : "text-[#8696a0] hover:text-[#d1d7db] hover:bg-white/3"}`}
                    style={{ background: selectedModel.id === m.id ? `${m.color}12` : undefined }}
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${m.color}20`, color: m.color }}>{m.badge}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mode selector */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setShowModeMenu(!showModeMenu); setShowModelMenu(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: selectedMode.color }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{selectedMode.icon} {selectedMode.label}</span>
            <ChevronDown className={`w-3 h-3 text-[#8696a0] transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showModeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1.5 w-52 rounded-2xl z-50 py-2"
                style={{ background: "rgba(18,26,32,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
              >
                <div className="px-4 py-2 text-[10px] font-bold text-[#8696a0] uppercase tracking-widest">Persona</div>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMode(m); setShowModeMenu(false); }}
                    className="w-full text-left px-4 py-3 transition-colors hover:bg-white/3"
                    style={{ background: selectedMode.id === m.id ? `${m.color}10` : undefined }}
                  >
                    <div className="text-sm font-semibold flex items-center gap-2" style={{ color: m.color }}>
                      <span>{m.icon}</span><span>{m.label}</span>
                      {selectedMode.id === m.id && <Zap className="w-3 h-3 ml-auto" />}
                    </div>
                    <div className="text-[11px] text-[#8696a0] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[#8696a0] hidden sm:block">
            {messages.filter(m => m.id !== "welcome").length} messages
          </span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={clearChat}
            className="p-1.5 rounded-lg text-[#8696a0] hover:text-[#ef4444] hover:bg-[#ef4444]/8 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* No-key warning */}
      <AnimatePresence>
        {!canChat && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs border-b"
            style={{ background: "rgba(234,179,8,0.08)", borderColor: "rgba(234,179,8,0.2)" }}>
            <div className="flex items-center gap-2 text-yellow-400">
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>Add an API key to start chatting.</span>
            </div>
            <Link href="/settings">
              <button className="text-[11px] font-bold text-[#0b141a] bg-yellow-400 px-3 py-1 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap">Set Key</button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 pt-4 pb-4 flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isBot = msg.role === "bot";
              const isOld = i < messages.length - 4;
              const isStreaming = msg.streaming;
              const isEmpty = isStreaming && !msg.content;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`flex gap-3 group py-2 ${isBot ? "" : "flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {isBot ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden" style={{ border: "1.5px solid rgba(0,168,132,0.4)" }}>
                        <img src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png" className="w-full h-full object-cover scale-150" alt="" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,168,132,0.15)", border: "1.5px solid rgba(0,168,132,0.3)" }}>
                        <User className="w-3.5 h-3.5 text-[#00a884]" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[75%] ${isBot ? "items-start" : "items-end"}`}>
                    {/* Sender label */}
                    <span className="text-[10px] font-semibold text-[#8696a0] px-1">
                      {isBot ? "Tarik Bhai AI" : "You"}
                    </span>

                    {/* Bubble */}
                    {isOld ? (
                      <div className="text-[12px] text-[#8696a0]/40 font-mono px-2">
                        {msg.content.slice(0, 55)}…
                      </div>
                    ) : (
                      <div
                        className="relative rounded-2xl px-4 py-3"
                        style={isBot ? {
                          background: "rgba(32,44,51,0.8)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          backdropFilter: "blur(8px)",
                        } : {
                          background: "rgba(0,168,132,0.12)",
                          border: "1px solid rgba(0,168,132,0.25)",
                        }}
                      >
                        {/* Top accent line */}
                        {isBot && <div className="absolute top-0 left-4 right-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,168,132,0.4), transparent)" }} />}

                        {isEmpty ? (
                          <TypingDots />
                        ) : isBot ? (
                          <div className="lux-markdown text-[14px] sm:text-[15px] leading-relaxed">
                            <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                            {isStreaming && <span className="inline-block w-0.5 h-[1em] bg-[#00a884] ml-0.5 animate-pulse align-middle rounded-full" />}
                          </div>
                        ) : (
                          <p className="text-[#e9edef] text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    )}

                    {/* Meta row */}
                    {!isOld && !isEmpty && (
                      <div className={`flex items-center gap-1.5 px-1 ${isBot ? "" : "flex-row-reverse"}`}>
                        <span className="text-[10px] text-[#8696a0]/60">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {msg.model && !isStreaming && ` · ${msg.model.split("/").pop()?.slice(0, 16)}`}
                        </span>
                        {!isBot && <span className="text-[10px] text-[#00a884]/80">✓✓</span>}
                        {!isStreaming && <CopyBtn text={msg.content} />}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t" style={{ background: "rgba(11,20,26,0.92)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <form onSubmit={handleSend} className="flex items-end gap-2.5">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={canChat ? "Message Tarik Bhai AI…" : "Set your API key to chat…"}
              disabled={loading || !canChat}
              rows={1}
              className="w-full resize-none text-[15px] text-[#e9edef] placeholder-[#8696a0] bg-transparent focus:outline-none disabled:opacity-40 py-3 px-4 rounded-2xl"
              style={{
                background: "rgba(32,44,51,0.8)",
                border: "1px solid rgba(255,255,255,0.08)",
                minHeight: "48px",
                maxHeight: "140px",
                overflow: "auto",
                transition: "border-color 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(0,168,132,0.4)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 140) + "px";
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || loading || !canChat}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-all"
            style={{
              background: input.trim() && !loading && canChat
                ? "linear-gradient(135deg, #00a884, #00c9a7)"
                : "rgba(32,44,51,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: input.trim() && !loading && canChat ? "0 0 20px rgba(0,168,132,0.3)" : "none",
              color: input.trim() && !loading && canChat ? "#0b141a" : "#8696a0",
            }}
          >
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
              : <Send className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            }
          </motion.button>
        </form>
        <p className="text-center text-[10px] text-[#8696a0]/35 mt-2">
          {selectedMode.icon} {selectedMode.label} · {selectedModel.name} · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
