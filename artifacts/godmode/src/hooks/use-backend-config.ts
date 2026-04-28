import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface BackendConfig {
  hasBackendKey: boolean;
  keyType: "openrouter" | "openai" | null;
  models: string;
}

let _cache: BackendConfig | null = null;
const _listeners: Array<(c: BackendConfig) => void> = [];

async function fetchConfig(): Promise<BackendConfig> {
  if (_cache) return _cache;
  try {
    const res = await fetch(`${BASE_URL}/api/config`);
    if (res.ok) {
      _cache = await res.json() as BackendConfig;
    } else {
      _cache = { hasBackendKey: false, keyType: null, models: "none" };
    }
  } catch {
    _cache = { hasBackendKey: false, keyType: null, models: "none" };
  }
  _listeners.forEach(fn => fn(_cache!));
  return _cache!;
}

export function useBackendConfig() {
  const [config, setConfig] = useState<BackendConfig>(
    _cache ?? { hasBackendKey: false, keyType: null, models: "none" }
  );

  useEffect(() => {
    fetchConfig().then(setConfig);
    _listeners.push(setConfig);
    return () => {
      const idx = _listeners.indexOf(setConfig);
      if (idx >= 0) _listeners.splice(idx, 1);
    };
  }, []);

  return config;
}
