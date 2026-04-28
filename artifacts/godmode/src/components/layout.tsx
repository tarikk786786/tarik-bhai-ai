import { Link, useLocation } from "wouter";
import { Cpu, History, BarChart3, Settings } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { apiKey } = useApiKey();

  const navItems = [
    { href: "/", label: "RACE", icon: Cpu },
    { href: "/history", label: "HISTORY", icon: History },
    { href: "/stats", label: "STATS", icon: BarChart3 },
    { href: "/settings", label: "SETTINGS", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground font-mono">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tighter text-primary">tarik Bhai</h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">AI Orchestration</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 text-sm uppercase tracking-wider cursor-pointer transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary border-l-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-primary' : 'bg-destructive'}`} />
            <span className={apiKey ? 'text-primary' : 'text-destructive'}>
              {apiKey ? 'API LINKED' : 'NO API KEY'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
