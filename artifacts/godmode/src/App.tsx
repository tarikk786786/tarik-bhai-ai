import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { ParticleBackground } from "@/components/particle-background";
import NotFound from "@/pages/not-found";
import SettingsPage from "@/pages/settings";
import HomePage from "@/pages/home";
import ChatPage from "@/pages/chat";
import HistoryPage from "@/pages/history";
import StatsPage from "@/pages/stats";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/stats" component={StatsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="h-[100dvh] flex flex-col relative w-full bg-[#0b141a] overflow-hidden">
            <ParticleBackground />
            <Navbar />
            {/* Scrolling Marquee */}
            <div className="w-full border-b border-[#00a884]/20 mt-[60px] py-1.5 z-20 relative flex items-center overflow-hidden bg-[#0b141a]/80">
              <div className="animate-marquee whitespace-nowrap flex items-center">
                {[1, 2, 3].map(i => (
                  <span key={i} className="text-[#00a884]/70 font-mono text-[11px] tracking-widest uppercase mx-8">
                    ⚡ SYSTEM ONLINE // ADVANCED SPACE TECHNOLOGY NEXUS // TARIK BHAI AI PROTOCOL ACTIVE // QUANTUM INTELLIGENCE ENGAGED // COSMIC NEXUS INITIALIZED ⚡
                  </span>
                ))}
              </div>
            </div>
            <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
