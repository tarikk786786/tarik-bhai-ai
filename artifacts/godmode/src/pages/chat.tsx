import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, Wand2, Cpu, Copy, Check, Trash2, KeyRound, Zap, MessageSquare } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";
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
  { id: "normal", name: "Normal", color: "#8696a0", desc: "Friendly bro mode" },
  { id: "godmode", name: "⚡ GodMode", color: "#00a884", desc: "Unstoppable intelligence" },
  { id: "ultra", name: "🔥 Ultra", color: "#ff6b6b", desc: "Maximum depth & detail" },
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
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#2a3942] text-[#8696a0] hover:text-[#d1d7db]"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#00a884]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function ChatPage() {
  const { apiKey } = useApiKey();
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
  }, [messages]);

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
    if (!text || loading || !apiKey) return;

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
      const modelId = isOpenRouter ? selectedModel.orId : selectedModel.id;

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
          model: modelId,
          apiKey,
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
            if (data.type === "token") {
              appendStreamChunk(botId, data.content);
            } else if (data.type === "done") {
              finalModel = data.model || finalModel;
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
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
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative font-sans" onClick={() => { setShowModelMenu(false); setShowModeMenu(false); }}>

      {/* API Key Warning */}
      {!apiKey && (
        <div className="mx-3 mt-2 border border-yellow-500/40 bg-yellow-500/10 p-3 flex items-center justify-between gap-3 rounded-xl">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-400 font-medium">Enter an OpenAI or OpenRouter API key to chat.</p>
          </div>
          <Link href="/settings">
            <button className="bg-yellow-500 text-black text-[11px] font-bold px-3 py-1 rounded-full hover:bg-yellow-400 transition-colors whitespace-nowrap">
              Set Key
            </button>
          </Link>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 py-2.5 px-3 md:px-0 border-b border-[#2a3942] bg-[#0b141a] z-30">
        {/* Model Picker */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModelMenu(!showModelMenu); setShowModeMenu(false); }}
            className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs font-medium flex items-center gap-2 hover:bg-[#2a3942] transition-colors text-[#8696a0] border border-[#2a3942]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="max-w-[100px] truncate">{selectedModel.name}</span>
            <span className="text-[10px] text-[#00a884] font-bold px-1.5 py-0.5 rounded bg-[#00a884]/10">{selectedModel.badge}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showModelMenu ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence>
            {showModelMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.97 }}
                className="absolute top-full left-0 mt-2 w-64 bg-[#1a2530] border border-[#2a3942] rounded-2xl z-50 py-2 max-h-[60vh] overflow-y-auto shadow-2xl scrollbar-hide"
              >
                <div className="px-4 py-1.5 text-[10px] text-[#8696a0] font-bold uppercase tracking-widest">Select Model</div>
                {MODELS.map(m => (
                  <button key={m.id} onClick={() => { setSelectedModel(m); setShowModelMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 transition-all flex items-center justify-between ${selectedModel.id === m.id ? "bg-[#2a3942] text-white" : "text-[#d1d7db] hover:bg-[#2a3942]/50"}`}
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
            className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs font-medium flex items-center gap-2 hover:bg-[#2a3942] transition-colors text-[#8696a0] border border-[#2a3942]"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{selectedMode.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence>
            {showModeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.97 }}
                className="absolute top-full left-0 mt-2 w-56 bg-[#1a2530] border border-[#2a3942] rounded-2xl z-50 py-2 shadow-2xl"
              >
                <div className="px-4 py-1.5 text-[10px] text-[#8696a0] font-bold uppercase tracking-widest">Persona Mode</div>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMode(m); setShowModeMenu(false); }}
                    className={`w-full text-left px-4 py-3 transition-all ${selectedMode.id === m.id ? "bg-[#2a3942] text-white" : "text-[#d1d7db] hover:bg-[#2a3942]/50"}`}
                  >
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-[11px] opacity-60 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[#8696a0] hidden sm:block">
            {messages.filter(m => m.id !== "welcome").length} messages
          </span>
          <button
            onClick={clearChat}
            className="p-1.5 text-[#8696a0] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-full transition-all"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 pb-[100px] scrollbar-hide pt-4 flex flex-col">
        <div className="flex flex-col space-y-4 md:space-y-5">
          {messages.map((msg, index) => {
            const isOld = index < messages.length - 2;
            const isBot = msg.role === "bot";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col w-full group ${isBot ? "items-start" : "items-end"}`}
              >
                <div className={`max-w-[88%] md:max-w-[78%] rounded-2xl px-4 py-3 relative ${isBot ? "lux-message-bot rounded-tl-none" : "lux-message-user rounded-tr-none"}`}>
                  {isOld ? (
                    <div className="truncate text-[13px] font-mono opacity-35 max-w-full tracking-wide">
                      {isBot ? "<- " : ">> "}{msg.content.slice(0, 80)}
                    </div>
                  ) : isBot ? (
                    <div className={`prose prose-invert prose-sm max-w-none text-[15px] leading-relaxed lux-markdown ${msg.streaming && !msg.content ? "text-[#8696a0] italic animate-pulse" : ""}`}>
                      {msg.streaming && !msg.content
                        ? "Tarik Bhai is thinking..."
                        : <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                      }
                      {msg.streaming && msg.content && (
                        <span className="inline-block w-0.5 h-4 bg-[#00a884] ml-0.5 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  )}

                  {!isOld && (
                    <div className={`flex items-center justify-between mt-1.5 gap-2`}>
                      <span className={`text-[10px] opacity-50 ${isBot ? "text-[#8696a0]" : "text-green-200"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {msg.model && !msg.streaming && ` · ${msg.model.split("/").pop()}`}
                      </span>
                      {!msg.streaming && <CopyButton text={msg.content} />}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div
        className="absolute bottom-0 left-0 w-full bg-[#202c33]/95 backdrop-blur-md px-3 pt-3 md:px-5 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 12px))" }}
      >
        <form onSubmit={handleSend} className="max-w-5xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? "Type a message (Enter to send, Shift+Enter for new line)" : "Set your API key first..."}
              disabled={loading || !apiKey}
              rows={1}
              className="lux-input text-[15px] disabled:opacity-50 resize-none w-full"
              style={{ borderRadius: "20px", minHeight: "44px", maxHeight: "140px", overflow: "auto" }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 140) + "px";
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || loading || !apiKey}
            className="w-11 h-11 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition-all flex items-center justify-center shrink-0 disabled:opacity-40 disabled:hover:bg-[#00a884] shadow-[0_0_15px_rgba(0,168,132,0.4)]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-[-2px]" />
            )}
          </motion.button>
        </form>
        <p className="text-center text-[10px] text-[#8696a0]/50 mt-1.5">
          Powered by Tarik Bhai AI · {selectedMode.name} mode · {selectedModel.name}
        </p>
      </div>
    </div>
  );
}
