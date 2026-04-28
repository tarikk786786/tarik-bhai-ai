import { motion } from "framer-motion";
import { Link } from "wouter";
import { MessageSquare, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 font-sans mt-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto flex flex-col items-center"
      >
        <div className="w-28 h-28 rounded-full overflow-hidden mb-6 border-4 border-[#00a884] shadow-[0_0_30px_rgba(0,168,132,0.5)] relative shrink-0">
          <img
            src="https://i.ibb.co/MDBBL3ZC/Gemini-Generated-Image-tc1nobtc1nobtc1n.png"
            alt="Tarik Bhai AI"
            className="w-full h-full object-cover scale-150"
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-[#e9edef] tracking-tight mb-4 drop-shadow-lg">
          Welcome to{" "}
          <span className="text-[#00a884] drop-shadow-[0_0_15px_rgba(0,168,132,0.8)]">
            Tarik Bhai AI
          </span>
        </h1>

        <div className="bg-[#202c33]/60 backdrop-blur-sm border border-[#00a884]/30 rounded-2xl p-6 mb-10 shadow-[0_0_30px_rgba(0,168,132,0.15)] relative overflow-hidden w-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00a884] to-transparent opacity-50" />
          <p className="text-[#00a884] text-lg md:text-xl font-bold mb-3 drop-shadow-[0_0_10px_rgba(0,168,132,0.4)]">
            "As Salaamu Alaikum! Main Tarik Bhai ka banaya hua is duniya ka sabse advance AI hoon. Mere neural pathways galaxies ke data se connected hain."
          </p>
          <p className="text-[#8696a0] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Enter my dimension of space technology, quantum intelligence, and super-coding capabilities. Ask me anything, or simply have a chat. I am fully operational and ready to assist you.
          </p>
        </div>

        <Link href="/chat">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#00a884] hover:bg-[#008f6f] text-[#0b141a] font-black py-4 px-8 rounded-full transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,168,132,0.4)] hover:shadow-[0_0_30px_rgba(0,168,132,0.7)] text-lg cursor-pointer"
          >
            <MessageSquare className="w-6 h-6" />
            START COSMIC CHAT
            <Sparkles className="w-5 h-5" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
