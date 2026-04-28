import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, Wand2, Cpu } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";
import { Link } from "wouter";
import { KeyRound } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
  model?: string;
}

const MODELS = [
  { id: "gpt-4o-mini", orId: "openai/gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & smart OpenAI model" },
  { id: "gpt-4o", orId: "openai/gpt-4o", name: "GPT-4o", description: "OpenAI flagship model" },
  { id: "claude-3-5-sonnet-20241022", orId: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Anthropic's logic master" },
  { id: "claude-3-opus-20240229", orId: "anthropic/claude-3-opus", name: "Claude 3 Opus", description: "Anthropic's powerhouse" },
  { id: "gemini-1.5-pro", orId: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", description: "Google's smartest model" },
  { id: "gemini-1.5-flash", orId: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash", description: "Fastest Google model" },
  { id: "meta-llama/llama-3.3-70b-instruct", orId: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", description: "Meta's open source giant" },
  { id: "deepseek/deepseek-chat", orId: "deepseek/deepseek-chat", name: "DeepSeek Chat", description: "Top Chinese AI model" },
];

const MODES = [
  { id: "normal", name: "Normal", description: "Friendly bro mode" },
  { id: "godmode", name: "GodMode", description: "Unstoppable intelligence" },
  { id: "ultra", name: "Ultra", description: "Maximum depth & detail" },
];

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ChatPage() {
  const { apiKey } = useApiKey();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "As Salaamu Alaikum! Main Tarik Bhai ka banaya hua is duniya ka sabse advance AI hoon. Mere neural pathways galaxies ke data se connected hain. Mujhe kuch bhi poochh sakte ho ya bol sakte ho. Main Tarik Bhai ke genius aur visionary brain se bana hoon. Enter my dimension of space technology, quantum intelligence, and super-coding capabilities. I am fully operational and ready to assist you.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || !apiKey) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));

      const isOpenRouter = apiKey.startsWith("sk-or-");
      const modelId = isOpenRouter ? selectedModel.orId : selectedModel.id;

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: userMsg.content }],
          model: modelId,
          apiKey,
          mode: selectedMode.id,
        }),
      });

      const data = await response.json();
      const content = data.content || (data.error ? `Error: ${data.error}` : "Tarik Bhai is speechless... try again.");

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content,
          timestamp: Date.now(),
          model: data.model,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "Connection error. Please check your API key and try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative font-sans">
      {!apiKey && (
        <div className="mx-3 mt-2 mb-0 border border-yellow-500/40 bg-yellow-500/10 p-3 flex items-center justify-between gap-3 rounded-xl">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-400 font-medium">API key required to chat.</p>
          </div>
          <Link href="/settings">
            <button className="bg-yellow-500 text-black text-[11px] font-bold px-3 py-1 rounded-full hover:bg-yellow-400 transition-colors whitespace-nowrap">
              Set Key
            </button>
          </Link>
        </div>
      )}

      {/* Model & Mode Controls */}
      <div className="flex flex-wrap items-center gap-3 py-3 px-3 md:px-0 border-b border-[#2a3942] z-40 bg-[#0b141a]">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModelMenu(!showModelMenu); setShowModeMenu(false); }}
            className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs font-medium flex items-center gap-2 hover:bg-[#2a3942] transition-colors text-[#8696a0]"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{selectedModel.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showModelMenu ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence>
            {showModelMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-2 w-64 bg-[#202c33] border border-[#2a3942] rounded-xl z-50 py-2 max-h-[50vh] overflow-y-auto shadow-xl scrollbar-hide"
              >
                <div className="px-4 py-1 text-[10px] text-[#8696a0] font-bold uppercase mb-1">Select AI Model</div>
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(m); setShowModelMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 transition-all ${selectedModel.id === m.id ? "bg-[#2a3942] text-white" : "text-[#d1d7db] hover:bg-[#2a3942]"}`}
                  >
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-[10px] opacity-60">{m.description}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowModeMenu(!showModeMenu); setShowModelMenu(false); }}
            className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs font-medium flex items-center gap-2 hover:bg-[#2a3942] transition-colors text-[#8696a0]"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{selectedMode.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence>
            {showModeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-2 w-52 bg-[#202c33] border border-[#2a3942] rounded-xl z-50 py-2 shadow-xl"
              >
                <div className="px-4 py-1 text-[10px] text-[#8696a0] font-bold uppercase mb-1">Operation Mode</div>
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMode(m); setShowModeMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 transition-all ${selectedMode.id === m.id ? "bg-[#2a3942] text-white" : "text-[#d1d7db] hover:bg-[#2a3942]"}`}
                  >
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-[10px] opacity-60">{m.description}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-[80px] scrollbar-hide pt-4 flex flex-col">
        <div className="flex flex-col flex-1 space-y-4 md:space-y-5">
          {messages.map((msg, index) => {
            const isOld = index < messages.length - 1;
            return (
              <div key={msg.id} className={`flex flex-col w-full ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 relative ${
                  msg.role === "bot" ? "lux-message-bot rounded-tl-none" : "lux-message-user rounded-tr-none"
                }`}>
                  {isOld ? (
                    <div className="truncate text-[13px] font-mono animate-pulse opacity-40 max-w-full font-light tracking-wide">
                      {msg.role === "user" ? ">> " : "<- "}{msg.content}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  )}
                  {!isOld && (
                    <div className={`text-[10px] mt-1.5 text-right opacity-60 ${msg.role === "user" ? "text-green-200" : "text-[#8696a0]"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {msg.model && ` · ${msg.model.split("/").pop()}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start w-full mt-2">
              <div className="flex items-center gap-3 p-4 text-[#8696a0]">
                <Cpu className="w-4 h-4 animate-pulse" />
                <span className="text-[12px] font-medium animate-pulse">Tarik Bhai is thinking...</span>
              </div>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div
        className="absolute bottom-0 left-0 w-full bg-[#202c33] px-2 pt-3 md:px-4 z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.25)]"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 12px))" }}
      >
        <form onSubmit={handleSend} className="max-w-5xl mx-auto flex items-center gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={apiKey ? "Type a message" : "Set your API key first..."}
            disabled={loading || !apiKey}
            className="flex-1 lux-input text-[15px] disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || loading || !apiKey}
            className="w-11 h-11 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition-all flex items-center justify-center shrink-0 disabled:opacity-40 disabled:hover:bg-[#00a884]"
          >
            <Send className="w-5 h-5 ml-[-2px]" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
