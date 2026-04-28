import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { ParticleBackground } from "@/components/particle-background";
import { SparkleEffect } from "@/components/sparkle-effect";
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
            <SparkleEffect />
            <Navbar />
            <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden mt-[60px]">
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
