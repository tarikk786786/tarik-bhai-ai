import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity, Zap, MessageSquare, Trophy, Clock, BarChart4 } from "lucide-react";

export default function StatsPage() {
  const { data: stats, isLoading } = useGetStats();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b141a] font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-primary">System Telemetry</h2>
          <p className="text-muted-foreground mt-2 font-mono text-sm">Aggregated orchestration metrics and performance data.</p>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !stats ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-sm uppercase tracking-widest">
            Metrics offline.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-none border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Total Races
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-mono font-bold text-primary">{stats.totalRaces}</div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Total Chats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-mono font-bold text-foreground">{stats.totalChats}</div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Total Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-mono font-bold text-foreground">{stats.totalFeedback}</div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Avg Race Latency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-mono font-bold text-foreground">
                    {stats.avgRaceLatencyMs ? `${Math.round(stats.avgRaceLatencyMs)}ms` : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Models Leaderboard */}
            <Card className="rounded-none border-border bg-card col-span-full">
              <CardHeader className="border-b border-border pb-4 bg-muted/20">
                <CardTitle className="text-lg uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" /> Top Performing Models
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {stats.topModels.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground font-mono text-sm uppercase">No race data available yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {stats.topModels.map((model, index) => (
                      <div key={model.model} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 flex items-center justify-center font-bold font-mono ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            #{index + 1}
                          </div>
                          <span className="font-mono text-sm font-bold">{model.model}</span>
                        </div>
                        <div className="flex gap-6 text-right">
                          <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest">Wins</div>
                            <div className="font-mono font-bold">{model.wins}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest">Avg Score</div>
                            <div className="font-mono font-bold text-primary">{model.avgScore?.toFixed(1)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
