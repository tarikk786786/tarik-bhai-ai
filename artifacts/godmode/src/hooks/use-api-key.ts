import { useState, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem("openrouter_api_key") || "");

  const setApiKey = (key: string) => {
    localStorage.setItem("openrouter_api_key", key);
    setApiKeyState(key);
  };

  return { apiKey, setApiKey };
}
