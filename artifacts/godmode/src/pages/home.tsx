import { motion } from "framer-motion";
import { Link } from "wouter";
import { MessageSquare, Sparkles, Code, TrendingUp, Terminal, PenTool, Zap, Globe } from "lucide-react";

const QUICK_ACTIONS = [
  { icon: Code, label: "Write Code", prompt: "Write me a Python script to" },
  { icon: TrendingUp, label: "Analyze Data", prompt: "Analyze this and give me insights:" },
  { icon: PenTool, label: "Write Content", prompt: "Write a professional blog post about" },
  { icon: Terminal, label: "Debug Issue", prompt: "Help me debug this problem:" },
  { icon: Zap, label: "Quick Summary", prompt: "Give me a quick summary of" },
  { icon: Globe, label: "Translate", prompt: "Translate this to Urdu/Hindi:" },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 font-sans overflow-y-auto scrollbar-hide">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl mx-auto flex flex-col items-center w-full"
      >
        <motion.div
          animate={{ boxShadow: ["0 0 20px rgba(0,168,132,0.3)", "0 0 50px rgba(0,168,132,0.6)", "0 0 20px rgba(0,168,132,0.3)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#00a884] shrink-0"
        >
          <img
            src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
            alt="Tarik Bhai AI"
            className="w-full h-full object-cover scale-150"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black text-[#e9edef] tracking-tight mb-4"
        >
          Welcome to{" "}
          <span className="text-[#00a884] drop-shadow-[0_0_20px_rgba(0,168,132,0.9)]">
            Tarik Bhai AI
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#202c33]/70 backdrop-blur-md border border-[#00a884]/30 rounded-2xl p-6 mb-8 shadow-[0_0_40px_rgba(0,168,132,0.1)] relative overflow-hidden w-full"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00a884] to-transparent" />
          <p className="text-[#00a884] text-lg md:text-xl font-bold mb-3 leading-relaxed">
            "As Salaamu Alaikum! Main Tarik Bhai ka banaya hua is duniya ka sabse advance AI hoon. Mere neural pathways galaxies ke data se connected hain."
          </p>
          <p className="text-[#8696a0] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Enter my dimension of space technology, quantum intelligence, and super-coding capabilities. I am fully operational and ready to assist you.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-8"
        >
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link key={i} href={`/chat?q=${encodeURIComponent(action.prompt)}`}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#202c33]/60 border border-[#2a3942] hover:border-[#00a884]/40 rounded-xl p-3 text-left cursor-pointer transition-colors flex items-center gap-3 group"
                >
                  <div className="text-[#00a884] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[#d1d7db] text-sm font-medium truncate group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#00a884] hover:bg-[#008f6f] text-[#0b141a] font-black py-4 px-10 rounded-full transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,168,132,0.5)] hover:shadow-[0_0_40px_rgba(0,168,132,0.8)] text-lg cursor-pointer"
            >
              <MessageSquare className="w-6 h-6" />
              START COSMIC CHAT
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
