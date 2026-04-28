import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import {
  MessageSquare, Code, TrendingUp, Terminal,
  PenTool, Zap, Globe, ArrowRight, Sparkles,
} from "lucide-react";
import { useBackendConfig } from "@/hooks/use-backend-config";

const QUICK_ACTIONS = [
  { icon: Code,        label: "Write Code",      sub: "Python, JS, React, SQL…",  prompt: "Write me a Python script to", color: "#00bfff" },
  { icon: TrendingUp,  label: "Analyze Data",    sub: "Charts, insights, reports", prompt: "Analyze this and give me insights:", color: "#00a884" },
  { icon: PenTool,     label: "Write Content",   sub: "Blogs, emails, captions",   prompt: "Write a professional blog post about", color: "#a855f7" },
  { icon: Terminal,    label: "Debug Issue",      sub: "Errors, logs, stack traces", prompt: "Help me debug this problem:", color: "#f59e0b" },
  { icon: Zap,         label: "Summarize",        sub: "PDFs, articles, meetings",  prompt: "Give me a concise summary of", color: "#f97316" },
  { icon: Globe,       label: "Translate",        sub: "Urdu, Hindi, Arabic, more", prompt: "Translate this to Urdu/Hindi:", color: "#10b981" },
];

const TYPEWRITER_TEXTS = [
  "Duniya ka sabse advance AI...",
  "800+ models, zero limits...",
  "Space-grade intelligence...",
  "Built by Tarik Bhai...",
];

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

function TypewriterText() {
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [del, setDel] = useState(false);
  const [text, setText] = useState("");
  useEffect(() => {
    const full = TYPEWRITER_TEXTS[idx];
    let t: ReturnType<typeof setTimeout>;
    if (!del && char < full.length) {
      t = setTimeout(() => { setText(full.slice(0, char + 1)); setChar(c => c + 1); }, 42);
    } else if (!del && char === full.length) {
      t = setTimeout(() => setDel(true), 2200);
    } else if (del && char > 0) {
      t = setTimeout(() => { setText(full.slice(0, char - 1)); setChar(c => c - 1); }, 20);
    } else {
      setDel(false);
      setIdx(i => (i + 1) % TYPEWRITER_TEXTS.length);
    }
    return () => clearTimeout(t);
  }, [char, del, idx]);
  return <>{text}<span className="animate-pulse text-[#00a884]">|</span></>;
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default function HomePage() {
  const { hasBackendKey } = useBackendConfig();
  const m1 = useCountUp(800);
  const m2 = useCountUp(99.9, 1400);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
        className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-6"
      >

        {/* Avatar + Title */}
        <motion.div variants={item} className="flex flex-col items-center gap-4 text-center pt-2">
          <div className="relative">
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(0,168,132,0.4)", "0 0 0 14px rgba(0,168,132,0.0)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-[#00a884]"
            >
              <img
                src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
                alt="Tarik Bhai AI"
                className="w-full h-full object-cover scale-150"
              />
            </motion.div>
            <span className="absolute -bottom-1 -right-1 text-sm bg-[#0b141a] rounded-full border border-[#2a3942] leading-none p-0.5">⚡</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Tarik Bhai{" "}
              <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(135deg, #00a884 0%, #00e5c0 60%, #00bfff 100%)", backgroundClip: "text" }}>
                AI
              </span>
            </h1>
            <p className="text-[#8696a0] text-sm sm:text-base mt-1.5 h-5 flex items-center justify-center gap-0">
              <TypewriterText />
            </p>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#00a884] bg-[#00a884]/10 border border-[#00a884]/25 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
              System Online
            </span>
            <span className="text-xs font-semibold text-[#8696a0] bg-[#202c33] border border-[#2a3942] px-3 py-1 rounded-full">
              {Math.floor(m1)}+ Models
            </span>
            <span className="text-xs font-semibold text-[#8696a0] bg-[#202c33] border border-[#2a3942] px-3 py-1 rounded-full">
              {m2.toFixed(1)}% Uptime
            </span>
            {hasBackendKey && (
              <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/25 px-3 py-1 rounded-full">
                ✓ No Key Required
              </span>
            )}
          </div>
        </motion.div>

        {/* Greeting card */}
        <motion.div variants={item} className="w-full rounded-2xl overflow-hidden" style={{ background: "rgba(32,44,51,0.7)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(16px)" }}>
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #00a884 40%, #00bfff 60%, transparent)" }} />
          <div className="p-5 sm:p-6 flex gap-4 items-start">
            <div className="text-2xl shrink-0 mt-0.5">🤖</div>
            <div>
              <p className="text-[#e9edef] text-sm sm:text-base font-medium leading-relaxed mb-1.5">
                "As Salaamu Alaikum! Main Tarik Bhai ka banaya hua sabse advance AI hoon. Mere neural pathways galaxies ke data se connected hain."
              </p>
              <p className="text-[#8696a0] text-xs sm:text-sm leading-relaxed">
                Multi-model AI · Space-grade intelligence · GodMode & Ultra personas · Streaming responses · Available 24/7
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="w-full">
          <p className="text-[11px] font-bold text-[#8696a0] uppercase tracking-widest mb-3 px-1">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={`/chat?q=${encodeURIComponent(a.prompt)}`}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-colors"
                    style={{ background: "rgba(32,44,51,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${a.color}30`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: `${a.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#d1d7db] text-sm font-semibold group-hover:text-white transition-colors">{a.label}</div>
                      <div className="text-[#8696a0] text-xs truncate">{a.sub}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#2a3942] group-hover:text-[#8696a0] transition-colors shrink-0" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="w-full">
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative overflow-hidden font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-[#0b141a] text-base cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #00a884 0%, #00c9a7 50%, #00bfff 100%)",
                boxShadow: "0 0 40px rgba(0,168,132,0.25), 0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", width: "40%" }}
              />
              <MessageSquare className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Chatting</span>
              <Sparkles className="w-4 h-4 relative z-10 opacity-80" />
            </motion.button>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}
