import { useState } from "react";
import { Layout } from "@/components/layout";
import { useApiKey } from "@/hooks/use-api-key";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ExternalLink, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const { apiKey, setApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey);
  const { toast } = useToast();

  const handleSave = () => {
    setApiKey(inputValue.trim());
    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been stored locally.",
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-8 border-b border-border pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-primary">System Config</h2>
          <p className="text-muted-foreground mt-2">Manage API keys and local preferences. Data never leaves your machine except for API requests.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-none">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold uppercase tracking-widest">OpenRouter API Key</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Required to run races and single-model chats. Grab a key from OpenRouter to power the orchestration engine.
            </p>

            <div className="flex gap-4">
              <Input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="sk-or-v1-..."
                className="flex-1 font-mono bg-background border-border focus-visible:ring-primary rounded-none"
              />
              <Button 
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest"
              >
                Save Key
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm">
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                Get a key <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Stored securely in localStorage
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
