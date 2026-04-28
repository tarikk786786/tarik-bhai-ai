// Resolves the correct API base URL for both Replit (dev/deploy) and GitHub Pages
const VITE_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

// If VITE_API_BASE is set (GitHub Pages build), use it directly.
// Otherwise use relative path (works in Replit dev + Replit Deploy).
export const API_BASE = VITE_API_BASE
  ? VITE_API_BASE.replace(/\/$/, "")
  : `${BASE_URL}/api`;
