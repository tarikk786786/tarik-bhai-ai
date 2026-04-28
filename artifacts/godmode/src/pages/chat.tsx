import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, Wand2, Cpu, Copy, Check, Trash2, KeyRound, Zap } from "lucide-react";
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
  { id: "gpt-4o-mini", orId: "openai/gpt-4o-mini", name: "GPT-4o Mini", badge: "Fast" },
  { id: "gpt-4o", orId: "openai/gpt-4o", name: "GPT-4o", badge: "Smart" },
  { id: "claude-3-5-sonnet-20241022", orId: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", badge: "Logic" },
  { id: "claude-3-opus-20240229", orId: "anthropic/claude-3-opus", name: "Claude 3 Opus", badge: "Power" },
  { id: "gemini-1.5-pro", orId: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", badge: "Google" },
  { id: "gemini-1.5-flash", orId: "google/gemini-flash-1.5", name: "Gemini Flash", badge: "Speed" },
  { id: "meta-llama/llama-3.3-70b-instruct", orId: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", badge: "Open" },
  { id: "deepseek/deepseek-chat", orId: "deepseek/deepseek-chat", name: "DeepSeek Chat", badge: "Deep" },
  { id: "deepseek/deepseek-r1", orId: "deepseek/deepseek-r1", name: "DeepSeek R1", badge: "Reason" },
  { id: "qwen/qwen-2.5-72b-instruct", orId: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", badge: "Qwen" },
];

const MODES = [
  { id: "normal", name: "Normal", color: "#8696a0", desc: "Friendly bro mode", emoji: "💬" },
  { id: "godmode", name: "GodMode", color: "#00a884", desc: "Unstoppable intelligence", emoji: "⚡" },
  { id: "ultra", name: "Ultra", color: "#ff6b6b", desc: "Maximum depth & detail", emoji: "🔥" },
];

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "bot",
  content: "As Salaamu Alaikum! Main Tarik Bhai ka banaya hua is duniya ka sabse advance AI hoon. Mere neural pathways galaxies ke data se connected hain.\n\nMujhe kuch bhi poochh sakte ho. Main **Tarik Bhai** ke genius aur visionary brain se bana hoon — space technology, quantum intelligence, aur super-coding capabilities ke saath. Fully operational. Ready to assist! 🚀",
  timestamp: Date.now(),
};

const STORAGE_KEY = "tarik_bhai_chat_history";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [WELCOME_MSG];
}

function saveHistory(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100)));
  } catch {}
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5 text-[#8696a0] hover:text-[#d1d7db]"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-[#00a884]" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </motion.button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <img
        src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
        className="w-6 h-6 rounded-full object-cover scale-150 overflow-hidden border border-[#00a884]/40 shrink-0"
        alt=""
      />
      <div className="flex items-center gap-1 bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-3 border border-[#2a3942]">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#00a884]"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          />
        ))}
        <span className="text-[11px] text-[#8696a0] ml-1 italic">Tarik Bhai is thinking...</span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { apiKey } = useApiKey();
  const { hasBackendKey } = useBackendConfig();
  const canChat = !!apiKey || hasBackendKey;
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialQ = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (initialQ && inputRef.current) {
      inputRef.current.focus();
    }
  }, [initialQ]);

  const clearChat = () => {
    setMessages([WELCOME_MSG]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const appendStreamChunk = useCallback((id: string, chunk: string) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, content: m.content + chunk } : m
    ));
  }, []);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const text = (overrideInput ?? input).trim();
    if (!text || loading || !canChat) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const botId = `b_${Date.now() + 1}`;
    const botPlaceholder: Message = {
      id: botId,
      role: "bot",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome" && !m.streaming)
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));

      const isOpenRouter = apiKey.startsWith("sk-or-");
      // If user has a key, pick the right model ID for that API; otherwise let backend decide
      const modelId = apiKey
        ? (isOpenRouter ? selectedModel.orId : selectedModel.id)
        : selectedModel.id;

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
          model: modelId,
          // Only send apiKey if user has their own; backend uses env var otherwise
          ...(apiKey ? { apiKey } : {}),
          mode: selectedMode.id,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const err = await response.text();
        throw new Error(err);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalModel = selectedModel.name;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === "token") appendStreamChunk(botId, data.content);
            else if (data.type === "done") finalModel = data.model || finalModel;
            else if (data.type === "error") throw new Error(data.message);
          } catch {}
        }
      }

      setMessages(prev => prev.map(m =>
        m.id === botId ? { ...m, streaming: false, model: finalModel } : m
      ));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection error. Please try again.";
      setMessages(prev => prev.map(m =>
        m.id === botId
          ? { ...m, content: `⚠️ Error: ${msg}`, streaming: false }
          : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full max-w-3xl mx-auto w-full relative font-sans"
      onClick={() => { setShowModelMenu(false); setShowModeMenu(false); }}
    >
      {/* API Key Warning — only show if no backend key AND no user key */}
      <AnimatePresence>
        {!canChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-2 border border-yellow-500/40 bg-yellow-500/10 p-3 flex items-center justify-between gap-3 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-400 font-medium">Enter an OpenAI or OpenRouter API key to chat.</p>
            </div>
            <Link href="/settings">
              <button className="bg-yellow-500 text-black text-[11px] font-bold px-3 py-1 rounded-full hover:bg-yellow-400 transition-colors whitespace-nowrap">
                Set Key
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 py-2 px-3 border-b border-[#2a3942]/80 bg-[#0b141a]/80 backdrop-blur-sm z-30">
        {/* Model Picker */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModelMenu(!showModelMenu); setShowModeMenu(false); }}
            className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-[#2a3942] transition-colors text-[#8696a0] border border-[#2a3942]"
          >
            <Cpu className="w-3 h-3" />
            <span className="max-w-[90px] truncate">{selectedModel.name}</span>
            <span className="text-[10px] text-[#00a884] font-bold px-1.5 py-0.5 rounded bg-[#00a884]/10 hidden sm:inline">{selectedModel.badge}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showModelMenu ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence>
            {showModelMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-full left-0 mt-2 w-60 bg-[#1a2530]/95 backdrop-blur-md border border-[#2a3942] rounded-2xl z-50 py-2 max-h-[55vh] overflow-y-auto shadow-2xl scrollbar-hide"
              >
                <div className="px-4 py-1.5 text-[10px] text-[#8696a0] font-bold uppercase tracking-widest">Select Model</div>
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => { setSelectedModel(m); setShowModelMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 transition-all flex items-center justify-between ${selectedModel.id === m.id ? "bg-[#00a884]/15 text-white" : "text-[#d1d7db] hover:bg-[#2a3942]/50"}`}
                  >
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedModel.id === m.id ? "bg-[#00a884] text-[#0b141a]" : "bg-[#2a3942] text-[#8696a0]"}`}>{m.badge}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mode Picker */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModeMenu(!showModeMenu); setShowModelMenu(false); }}
            className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-[#2a3942] transition-colors border border-[#2a3942]"
            style={{ color: selectedMode.color }}
          >
            <Wand2 className="w-3 h-3" />
            <span>{selectedMode.emoji} {selectedMode.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform text-[#8696a0] ${showModeMenu ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence>
            {showModeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-full left-0 mt-2 w-52 bg-[#1a2530]/95 backdrop-blur-md border border-[#2a3942] rounded-2xl z-50 py-2 shadow-2xl"
              >
                <div className="px-4 py-1.5 text-[10px] text-[#8696a0] font-bold uppercase tracking-widest">Persona Mode</div>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMode(m); setShowModeMenu(false); }}
                    className={`w-full text-left px-4 py-3 transition-all ${selectedMode.id === m.id ? "bg-[#2a3942]" : "hover:bg-[#2a3942]/50"}`}
                  >
                    <div className="font-semibold text-sm flex items-center gap-2" style={{ color: m.color }}>
                      <span>{m.emoji}</span><span>{m.name}</span>
                      {selectedMode.id === m.id && <Zap className="w-3 h-3 ml-auto" />}
                    </div>
                    <div className="text-[11px] text-[#8696a0] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-[#8696a0] hidden sm:block bg-[#202c33] px-2 py-1 rounded-full border border-[#2a3942]">
            {messages.filter(m => m.id !== "welcome").length} msgs
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={clearChat}
            className="p-1.5 text-[#8696a0] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-full transition-all"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-[110px] scrollbar-hide pt-4 flex flex-col">
        <div className="flex flex-col px-3 md:px-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isOld = index < messages.length - 3;
              const isBot = msg.role === "bot";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className={`flex mb-3 group ${isBot ? "items-end justify-start" : "items-end justify-end"}`}
                >
                  {/* Bot avatar */}
                  {isBot && (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mr-2 mb-0.5 border border-[#00a884]/40 self-end">
                      <img
                        src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
                        className="w-full h-full object-cover scale-150"
                        alt=""
                      />
                    </div>
                  )}

                  <div className={`flex flex-col ${isBot ? "items-start" : "items-end"} max-w-[85%] sm:max-w-[75%]`}>
                    {/* Message bubble */}
                    {isOld ? (
                      <div className="px-3 py-2 rounded-xl text-[12px] font-mono opacity-25 text-[#8696a0] max-w-full">
                        {isBot ? "← " : "→ "}{msg.content.slice(0, 60)}…
                      </div>
                    ) : isBot ? (
                      <div
                        className="relative rounded-2xl rounded-tl-sm px-4 py-3 border"
                        style={{
                          background: "rgba(32,44,51,0.9)",
                          borderColor: "rgba(0,168,132,0.2)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <div className="absolute top-0 left-0 w-full h-[1px] rounded-t-2xl"
                          style={{ background: "linear-gradient(90deg, rgba(0,168,132,0.5), transparent)" }} />
                        <div className={`lux-markdown text-[14px] sm:text-[15px] leading-relaxed ${msg.streaming && !msg.content ? "text-[#8696a0] italic" : ""}`}>
                          {msg.streaming && !msg.content
                            ? "..."
                            : <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                          }
                          {msg.streaming && msg.content && (
                            <span className="inline-block w-0.5 h-4 bg-[#00a884] ml-0.5 animate-pulse align-middle rounded-full" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5 gap-2">
                          <span className="text-[10px] text-[#8696a0]/60">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {msg.model && !msg.streaming && ` · ${msg.model.split("/").pop()?.slice(0,16)}`}
                          </span>
                          {!msg.streaming && <CopyButton text={msg.content} />}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative rounded-2xl rounded-tr-sm px-4 py-3"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,168,132,0.2), rgba(0,200,160,0.1))",
                          border: "1px solid rgba(0,168,132,0.35)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <div className="absolute top-0 right-0 w-full h-[1px] rounded-t-2xl"
                          style={{ background: "linear-gradient(270deg, rgba(0,168,132,0.6), transparent)" }} />
                        <p className="text-[#e9edef] text-[14px] sm:text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <div className="flex items-center justify-end mt-1 gap-1">
                          <span className="text-[10px] text-[#00a884]/60">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-[#00a884] text-[10px]">✓✓</span>
                          <CopyButton text={msg.content} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {loading && messages[messages.length - 1]?.streaming && !messages[messages.length - 1]?.content && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div
        className="absolute bottom-0 left-0 w-full backdrop-blur-md px-3 pt-3 md:px-4 z-50"
        style={{
          background: "rgba(11,20,26,0.92)",
          borderTop: "1px solid rgba(42,57,66,0.7)",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.5)",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 10px))",
        }}
      >
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-end gap-2.5">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canChat ? "Message Tarik Bhai AI... (Enter to send)" : "Set your API key first..."}
              disabled={loading || !canChat}
              rows={1}
              className="w-full text-[15px] text-[#e9edef] placeholder-[#8696a0] resize-none disabled:opacity-40 focus:outline-none rounded-2xl px-4 py-3"
              style={{
                background: "rgba(42,57,66,0.9)",
                border: "1px solid rgba(0,168,132,0.2)",
                minHeight: "46px",
                maxHeight: "140px",
                overflow: "auto",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(0,168,132,0.5)";
                e.target.style.boxShadow = "0 0 0 2px rgba(0,168,132,0.08), 0 0 15px rgba(0,168,132,0.08)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(0,168,132,0.2)";
                e.target.style.boxShadow = "none";
              }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 140) + "px";
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.88 }}
            type="submit"
            disabled={!input.trim() || loading || !canChat}
            className="w-12 h-12 text-[#0b141a] rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-35 transition-all"
            style={{
              background: !input.trim() || loading || !canChat
                ? "rgba(0,168,132,0.3)"
                : "linear-gradient(135deg, #00a884, #00e5c0)",
              boxShadow: input.trim() && !loading && canChat ? "0 0 18px rgba(0,168,132,0.5)" : "none",
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#0b141a]/30 border-t-[#0b141a] rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-[-1px]" />
            )}
          </motion.button>
        </form>
        <p className="text-center text-[10px] text-[#8696a0]/40 mt-1.5">
          {selectedMode.emoji} {selectedMode.name} · {selectedModel.name} · Tarik Bhai AI
        </p>
      </div>
    </div>
  );
}
