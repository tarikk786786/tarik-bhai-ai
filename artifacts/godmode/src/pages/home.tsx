import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import {
  MessageSquare, Sparkles, Code, TrendingUp, Terminal,
  PenTool, Zap, Globe, Brain, Shield, Cpu, Rocket, Server,
} from "lucide-react";
import { useBackendConfig } from "@/hooks/use-backend-config";

const QUICK_ACTIONS = [
  { icon: Code, label: "Write Code", prompt: "Write me a Python script to", color: "0,200,255" },
  { icon: TrendingUp, label: "Analyze Data", prompt: "Analyze this and give me insights:", color: "0,168,132" },
  { icon: PenTool, label: "Write Content", prompt: "Write a professional blog post about", color: "200,100,255" },
  { icon: Terminal, label: "Debug Issue", prompt: "Help me debug this problem:", color: "255,120,0" },
  { icon: Zap, label: "Quick Summary", prompt: "Give me a quick summary of", color: "255,200,0" },
  { icon: Globe, label: "Translate", prompt: "Translate this to Urdu/Hindi:", color: "0,168,132" },
];

const STATS = [
  { icon: Cpu, label: "AI Models", value: 800, suffix: "+", color: "#00a884" },
  { icon: Brain, label: "Tasks Done", value: 10, suffix: "M+", color: "#00bfff" },
  { icon: Shield, label: "Uptime", value: 99.9, suffix: "%", color: "#a855f7" },
  { icon: Rocket, label: "Speed", value: 0.3, suffix: "s", color: "#f59e0b" },
];

const TYPEWRITER_TEXTS = [
  "Duniya ka sabse advance AI...",
  "Your quantum intelligence partner...",
  "800+ AI models, zero limits...",
  "Built by Tarik Bhai, powered by galaxies...",
];

function useCountUp(target: number, duration: number = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function StatCard({ icon: Icon, label, value, suffix, color }: typeof STATS[number]) {
  const count = useCountUp(value, 1200);
  const display = value % 1 !== 0 ? count.toFixed(1) : Math.floor(count).toString();
  return (
    <div
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border backdrop-blur-md"
      style={{ borderColor: `${color}30`, background: `${color}10` }}
    >
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="font-black text-lg leading-none" style={{ color }}>
        {display}{suffix}
      </span>
      <span className="text-[10px] text-[#8696a0] font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

function TypewriterText() {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const full = TYPEWRITER_TEXTS[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < full.length) {
      timeout = setTimeout(() => {
        setText(full.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, 40);
    } else if (!deleting && charIndex === full.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setText(full.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
      }, 18);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setTextIndex(i => (i + 1) % TYPEWRITER_TEXTS.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex]);

  return (
    <span className="text-[#00a884]">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function HomePage() {
  const { hasBackendKey } = useBackendConfig();
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 pb-8 pt-4 text-center z-10 overflow-y-auto scrollbar-hide w-full">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto flex flex-col items-center w-full gap-5"
      >

        {/* Avatar with pulse rings */}
        <motion.div variants={item} className="relative mt-2">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#00a884] scale-125" />
          <div className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-[#00a884] scale-110" />
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(0,168,132,0.4)", "0 0 55px rgba(0,168,132,0.8)", "0 0 20px rgba(0,168,132,0.4)"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#00a884] relative z-10 shrink-0"
          >
            <img
              src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
              alt="Tarik Bhai AI"
              className="w-full h-full object-cover scale-150"
            />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center z-20 border-2 border-[#0b141a]">
            <span className="text-[10px]">⚡</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={item} className="flex flex-col items-center gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#e9edef] tracking-tight leading-tight">
            Welcome to{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #00a884 0%, #00e5c0 50%, #00bfff 100%)" }}
            >
              Tarik Bhai AI
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#8696a0] h-6 flex items-center">
            <TypewriterText />
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-4 gap-2 w-full">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </motion.div>

        {/* Welcome Quote */}
        <motion.div
          variants={item}
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ background: "rgba(0,168,132,0.06)", border: "1px solid rgba(0,168,132,0.2)" }}
        >
          <div className="absolute top-0 left-0 w-full h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, #00a884, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-full h-[2px]"
            style={{ background: "linear-gradient(90deg, transparent, #00e5c0, transparent)" }} />

          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="text-3xl shrink-0">🤖</div>
              <div className="text-left">
                <p className="text-[#00a884] text-sm sm:text-base font-bold leading-relaxed mb-2">
                  "As Salaamu Alaikum! Main Tarik Bhai ka banaya hua is duniya ka sabse advance AI hoon.
                  Mere neural pathways galaxies ke data se connected hain."
                </p>
                <p className="text-[#8696a0] text-xs sm:text-sm leading-relaxed">
                  800+ AI models · Space-grade quantum intelligence · Super-coding capabilities ·
                  Available 24/7 · Ready to change your world.
                </p>
              </div>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "⚡ Streaming Responses",
                "🧠 Multi-Model AI",
                "🔥 GodMode Persona",
                "🌍 Urdu+English",
                "📱 Mobile Ready",
                "🚀 Ultra Fast",
                ...(hasBackendKey ? ["✅ No API Key Needed"] : []),
              ].map(badge => (
                <span key={badge} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,168,132,0.1)", color: "#00a884", border: "1px solid rgba(0,168,132,0.25)" }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} href={`/chat?q=${encodeURIComponent(action.prompt)}`}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl p-3 text-left cursor-pointer flex items-center gap-3 group transition-all"
                  style={{
                    background: `rgba(${action.color},0.06)`,
                    border: `1px solid rgba(${action.color},0.2)`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                    style={{ background: `rgba(${action.color},0.15)` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: `rgb(${action.color})` }} />
                  </div>
                  <span className="text-[#d1d7db] text-sm font-semibold group-hover:text-white transition-colors truncate">
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={item} className="w-full">
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto relative overflow-hidden text-[#0b141a] font-black py-4 px-12 rounded-2xl transition-all flex items-center justify-center gap-3 text-base sm:text-lg cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #00a884, #00e5c0, #00bfff)",
                boxShadow: "0 0 30px rgba(0,168,132,0.5), 0 0 60px rgba(0,200,200,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", width: "50%" }}
              />
              <MessageSquare className="w-5 h-5 relative z-10" />
              <span className="relative z-10">START COSMIC CHAT</span>
              <Sparkles className="w-5 h-5 relative z-10" />
            </motion.button>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}
