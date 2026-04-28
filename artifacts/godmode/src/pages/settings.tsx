import { useState } from "react";
import { useApiKey } from "@/hooks/use-api-key";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ExternalLink, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { apiKey, setApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey);
  const { toast } = useToast();

  const handleSave = () => {
    if (!inputValue.trim()) {
      toast({ title: "No key entered", description: "Please paste your API key first." });
      return;
    }
    setApiKey(inputValue.trim());
    toast({
      title: "API Key Saved",
      description: inputValue.trim().startsWith("sk-or-")
        ? "OpenRouter key saved. All models available."
        : "OpenAI key saved. Using OpenAI models.",
    });
  };

  const isOpenRouter = apiKey.startsWith("sk-or-");

  return (
    <div className="min-h-full bg-[#0b141a] p-6 font-sans overflow-y-auto">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <button className="p-2 text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942] rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-[#e9edef]">Settings</h2>
            <p className="text-[#8696a0] text-sm mt-0.5">Configure Tarik Bhai AI</p>
          </div>
        </div>

        <div className="bg-[#202c33] border border-[#2a3942] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#00a884]" />
            <h3 className="text-base font-semibold text-[#e9edef]">API Key</h3>
          </div>

          {apiKey && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${isOpenRouter ? "bg-[#00a884]/10 text-[#00a884] border border-[#00a884]/30" : "bg-blue-500/10 text-blue-400 border border-blue-500/30"}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {isOpenRouter ? "OpenRouter key active — 800+ models available" : "OpenAI key active — GPT models available"}
            </div>
          )}

          <p className="text-sm text-[#8696a0]">
            Paste your <strong className="text-[#d1d7db]">OpenAI API key</strong> (starts with <code className="text-[#00a884]">sk-</code>) or your{" "}
            <strong className="text-[#d1d7db]">OpenRouter API key</strong> (starts with <code className="text-[#00a884]">sk-or-</code>).
            OpenRouter gives you access to 800+ models including Claude, Gemini, and Llama.
          </p>

          <div className="flex gap-3">
            <input
              type="password"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="sk-... or sk-or-..."
              className="flex-1 lux-input text-sm"
              style={{ borderRadius: "12px" }}
            />
            <button
              onClick={handleSave}
              className="bg-[#00a884] hover:bg-[#008f6f] text-[#0b141a] text-sm font-bold px-5 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Save
            </button>
          </div>

          <div className="flex flex-col gap-2 text-sm pt-1">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00a884] hover:underline flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Get OpenRouter key (recommended — 800+ models)
            </a>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00a884] hover:underline flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Get OpenAI key
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8696a0] pt-2 border-t border-[#2a3942]">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Your key is stored only in this browser. It is never sent to our servers — only directly to OpenAI or OpenRouter.
          </div>
        </div>
      </div>
    </div>
  );
}
