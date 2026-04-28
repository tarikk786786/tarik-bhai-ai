import { useState } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => 
    localStorage.getItem("openai_api_key") || 
    localStorage.getItem("openrouter_api_key") || ""
  );

  const setApiKey = (key: string) => {
    const trimmed = key.trim();
    if (trimmed.startsWith("sk-or-")) {
      localStorage.setItem("openrouter_api_key", trimmed);
      localStorage.removeItem("openai_api_key");
    } else {
      localStorage.setItem("openai_api_key", trimmed);
      localStorage.removeItem("openrouter_api_key");
    }
    setApiKeyState(trimmed);
  };

  return { apiKey, setApiKey };
}
