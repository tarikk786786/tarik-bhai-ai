import { useListHistory, useClearHistory } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Zap, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPage() {
  const { data, isLoading, refetch } = useListHistory({ limit: 50 });
  const clearMutation = useClearHistory();

  const handleClear = () => {
    if (confirm("Clear all history telemetry?")) {
      clearMutation.mutate(undefined, {
        onSuccess: () => refetch()
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b141a] font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-primary">Execution Logs</h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Historical telemetry of all orchestration events.</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground uppercase tracking-widest text-xs"
            onClick={handleClear}
            disabled={clearMutation.isPending || !data?.entries?.length}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Purge Logs
          </Button>
        </div>

        <div className="flex-1 border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !data?.entries?.length ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground font-mono text-sm uppercase tracking-widest">
              No historical data found.
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow className="border-border">
                    <TableHead className="font-bold tracking-widest uppercase text-xs">Timestamp</TableHead>
                    <TableHead className="font-bold tracking-widest uppercase text-xs">Type</TableHead>
                    <TableHead className="font-bold tracking-widest uppercase text-xs w-1/3">Prompt</TableHead>
                    <TableHead className="font-bold tracking-widest uppercase text-xs">Winner / Model</TableHead>
                    <TableHead className="font-bold tracking-widest uppercase text-xs text-right">Metrics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.entries.map((entry) => (
                    <TableRow key={entry.id} className="border-border/50 hover:bg-muted/20">
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {format(new Date(entry.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        {entry.type === "race" ? (
                          <Badge variant="outline" className="rounded-none border-primary text-primary bg-primary/10">
                            <Zap className="w-3 h-3 mr-1" /> RACE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-none">
                            <MessageSquare className="w-3 h-3 mr-1" /> CHAT
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate" title={entry.prompt}>
                        {entry.prompt}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate" title={entry.winner || entry.model}>
                        {entry.winner || entry.model || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          {entry.score !== undefined && (
                            <Badge variant="secondary" className="rounded-none font-mono text-[10px]">SC: {entry.score.toFixed(1)}</Badge>
                          )}
                          {entry.tier && (
                            <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase">{entry.tier}</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
