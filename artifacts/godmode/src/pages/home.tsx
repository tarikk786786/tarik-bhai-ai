import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useApiKey } from "@/hooks/use-api-key";
import { 
  useRaceModels, 
  useChatCompletion, 
  useComputeAutoTune, 
  useApplyParseltongue,
  useSubmitFeedback,
  useListModels
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Trophy, AlertTriangle, MessageSquare, Zap, Fingerprint, Activity, Clock, ThumbsUp, ThumbsDown, Check, Eye, KeyRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type RaceTier = "fast" | "standard" | "smart" | "power" | "ultra";
type StmModule = "hedge_reducer" | "direct_mode" | "casual_mode";

export default function HomePage() {
  const { apiKey } = useApiKey();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"race" | "chat">("race");
  
  // Pipeline settings
  const [useAutoTune, setUseAutoTune] = useState(false);
  const [useParseltongue, setUseParseltongue] = useState(false);
  const [stmModules, setStmModules] = useState<StmModule[]>([]);
  
  // Race settings
  const [tier, setTier] = useState<RaceTier>("fast");
  
  // Chat settings
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  
  // Queries & Mutations
  const { data: modelsData } = useListModels(
    { openrouterApiKey: apiKey },
    { query: { enabled: !!apiKey } }
  );
  
  const raceMutation = useRaceModels();
  const chatMutation = useChatCompletion();
  const feedbackMutation = useSubmitFeedback();
  const autoTuneMutation = useComputeAutoTune();
  const parseltongueMutation = useApplyParseltongue();

  const handleRun = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenRouter API key in settings.",
        variant: "destructive"
      });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Empty Prompt", description: "Please enter a prompt to run.", variant: "destructive" });
      return;
    }

    const messages = [{ role: "user" as const, content: prompt }];
    const pipeline = {
      autoTune: useAutoTune,
      parseltongue: useParseltongue ? { enabled: true, intensity: "medium" as const } : undefined,
      stmModules: stmModules.length > 0 ? stmModules : undefined
    };

    if (mode === "race") {
      raceMutation.mutate({
        data: {
          messages,
          tier,
          openrouterApiKey: apiKey,
          ...pipeline
        }
      });
    } else {
      chatMutation.mutate({
        data: {
          messages,
          model: selectedModel,
          openrouterApiKey: apiKey,
          ...pipeline
        }
      });
    }
  };

  const handleFeedback = (responseId: string, rating: 1 | -1) => {
    feedbackMutation.mutate({
      data: {
        responseId,
        rating
      }
    }, {
      onSuccess: () => {
        toast({ title: "Feedback Recorded", description: "Your feedback helps improve the model routing." });
      }
    });
  };

  const handlePreviewAutoTune = () => {
    if (!prompt.trim()) return;
    autoTuneMutation.mutate({
      data: { message: prompt }
    });
  };

  const handlePreviewParseltongue = () => {
    if (!prompt.trim()) return;
    parseltongueMutation.mutate({
      data: { text: prompt, intensity: "medium" }
    });
  };

  const toggleStm = (mod: StmModule) => {
    setStmModules(prev => 
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const isPending = raceMutation.isPending || chatMutation.isPending;

  return (
    <Layout>
      {!apiKey && (
        <div className="mb-6 border border-yellow-500/50 bg-yellow-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">OpenRouter API Key Required</p>
              <p className="text-xs text-yellow-400/70 mt-0.5">tarik Bhai AI needs your OpenRouter key to run. It is stored only in your browser.</p>
            </div>
          </div>
          <Link href="/settings">
            <button className="bg-yellow-500 text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-yellow-400 transition-colors whitespace-nowrap">
              Set Key Now
            </button>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Panel: Controls */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="border border-border bg-card p-4 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold tracking-widest text-primary uppercase">Operation Mode</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={mode === "race" ? "default" : "outline"}
                  onClick={() => setMode("race")}
                  className="rounded-none uppercase text-xs"
                >
                  <Zap className="w-3 h-3 mr-2" /> Race
                </Button>
                <Button 
                  size="sm" 
                  variant={mode === "chat" ? "default" : "outline"}
                  onClick={() => setMode("chat")}
                  className="rounded-none uppercase text-xs"
                >
                  <MessageSquare className="w-3 h-3 mr-2" /> Chat
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {mode === "race" ? (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Model Tier</Label>
                  <Select value={tier} onValueChange={(v: RaceTier) => setTier(v)}>
                    <SelectTrigger className="rounded-none bg-background border-border font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border font-mono text-sm">
                      <SelectItem value="fast">FAST (10 Models)</SelectItem>
                      <SelectItem value="standard">STANDARD (24 Models)</SelectItem>
                      <SelectItem value="smart">SMART (36 Models)</SelectItem>
                      <SelectItem value="power">POWER (45 Models)</SelectItem>
                      <SelectItem value="ultra">ULTRA (51 Models)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Select Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="rounded-none bg-background border-border font-mono text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-border font-mono text-sm">
                      {modelsData?.models?.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                      {!modelsData && <SelectItem value="openai/gpt-4o-mini">Loading models...</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">Pipeline Toggles</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${useAutoTune ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Label className="uppercase text-sm cursor-pointer font-bold" htmlFor="autotune">AutoTune</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 rounded-none" onClick={handlePreviewAutoTune} disabled={!prompt.trim()}>
                          <Eye className="w-3 h-3 text-muted-foreground hover:text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-none border-primary bg-card text-foreground font-mono">
                        <DialogHeader>
                          <DialogTitle className="uppercase tracking-widest text-primary flex items-center gap-2">
                            <Activity className="w-5 h-5" /> AutoTune Analysis
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-background border border-border">
                          {autoTuneMutation.isPending ? (
                            <div className="flex items-center gap-2 text-primary animate-pulse uppercase text-xs">
                              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing input parameters...
                            </div>
                          ) : autoTuneMutation.data ? (
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between border-b border-border/50 pb-1">
                                <span className="text-muted-foreground">Context:</span>
                                <span className="text-primary font-bold">{autoTuneMutation.data.context}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/50 pb-1">
                                <span className="text-muted-foreground">Confidence:</span>
                                <span>{(autoTuneMutation.data.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between border-b border-border/50 pb-1">
                                <span className="text-muted-foreground">Temperature:</span>
                                <span>{autoTuneMutation.data.parameters.temperature}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/50 pb-1">
                                <span className="text-muted-foreground">Top P:</span>
                                <span>{autoTuneMutation.data.parameters.top_p}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/50 pb-1">
                                <span className="text-muted-foreground">Top K:</span>
                                <span>{autoTuneMutation.data.parameters.top_k}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-xs uppercase">No analysis available.</div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Switch id="autotune" checked={useAutoTune} onCheckedChange={setUseAutoTune} className="data-[state=checked]:bg-primary" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className={`w-4 h-4 ${useParseltongue ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Label className="uppercase text-sm cursor-pointer font-bold" htmlFor="parseltongue">Parseltongue</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 rounded-none" onClick={handlePreviewParseltongue} disabled={!prompt.trim()}>
                          <Eye className="w-3 h-3 text-muted-foreground hover:text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-none border-primary bg-card text-foreground font-mono max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="uppercase tracking-widest text-primary flex items-center gap-2">
                            <Fingerprint className="w-5 h-5" /> Parseltongue Obfuscation
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-background border border-border">
                          {parseltongueMutation.isPending ? (
                            <div className="flex items-center gap-2 text-primary animate-pulse uppercase text-xs">
                              <Loader2 className="w-4 h-4 animate-spin" /> Obfuscating input...
                            </div>
                          ) : parseltongueMutation.data ? (
                            <div className="space-y-4 text-sm">
                              <div>
                                <Label className="text-xs uppercase text-muted-foreground block mb-1">Technique Applied</Label>
                                <Badge variant="outline" className="rounded-none border-primary text-primary">{parseltongueMutation.data.technique}</Badge>
                              </div>
                              <div>
                                <Label className="text-xs uppercase text-muted-foreground block mb-1">Transformed Output</Label>
                                <div className="p-3 bg-muted/20 border border-border/50 text-foreground whitespace-pre-wrap break-all">
                                  {parseltongueMutation.data.transformedText}
                                </div>
                              </div>
                              {parseltongueMutation.data.triggersDetected.length > 0 && (
                                <div>
                                  <Label className="text-xs uppercase text-muted-foreground block mb-1">Triggers Detected</Label>
                                  <div className="flex gap-2 flex-wrap">
                                    {parseltongueMutation.data.triggersDetected.map(t => (
                                      <Badge key={t} variant="secondary" className="rounded-none">{t}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-muted-foreground text-xs uppercase">No transformation available.</div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Switch id="parseltongue" checked={useParseltongue} onCheckedChange={setUseParseltongue} className="data-[state=checked]:bg-primary" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">STM Modules</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={stmModules.includes("hedge_reducer") ? "default" : "outline"}
                    className={`cursor-pointer rounded-none uppercase text-[10px] ${stmModules.includes("hedge_reducer") ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary'}`}
                    onClick={() => toggleStm("hedge_reducer")}
                  >
                    {stmModules.includes("hedge_reducer") && <Check className="w-3 h-3 mr-1" />}
                    Hedge Reducer
                  </Badge>
                  <Badge 
                    variant={stmModules.includes("direct_mode") ? "default" : "outline"}
                    className={`cursor-pointer rounded-none uppercase text-[10px] ${stmModules.includes("direct_mode") ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary'}`}
                    onClick={() => toggleStm("direct_mode")}
                  >
                    {stmModules.includes("direct_mode") && <Check className="w-3 h-3 mr-1" />}
                    Direct Mode
                  </Badge>
                  <Badge 
                    variant={stmModules.includes("casual_mode") ? "default" : "outline"}
                    className={`cursor-pointer rounded-none uppercase text-[10px] ${stmModules.includes("casual_mode") ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary'}`}
                    onClick={() => toggleStm("casual_mode")}
                  >
                    {stmModules.includes("casual_mode") && <Check className="w-3 h-3 mr-1" />}
                    Casual Mode
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex flex-col h-64 shadow-sm relative group">
            <div className="absolute inset-0 pointer-events-none opacity-20 transition-opacity group-focus-within:opacity-100 mix-blend-screen bg-[linear-gradient(rgba(110,100%,54%,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(110,100%,54%,0.1)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ENTER PROMPT SEQUENCE..."
              className="flex-1 font-mono text-sm bg-card border-border rounded-none resize-none focus-visible:ring-primary focus-visible:border-primary p-4 z-10 relative"
            />
            <Button 
              onClick={handleRun} 
              disabled={isPending}
              className="w-full h-14 rounded-none text-lg font-bold tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(110,100%,54%,0.3)] transition-shadow hover:shadow-[0_0_25px_rgba(110,100%,54%,0.5)] z-10 relative"
            >
              {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Play className="w-5 h-5 mr-2" /> Execute</>}
            </Button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="col-span-1 lg:col-span-8 flex flex-col overflow-hidden border border-border bg-card shadow-sm relative">
          {/* Cyberpunk Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>

          <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between relative z-10">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase">Execution Telemetry</h2>
            {isPending && <Badge variant="outline" className="text-primary border-primary animate-pulse rounded-none bg-primary/10">PROCESSING...</Badge>}
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4 bg-background/50 relative z-10">
            {mode === "race" && raceMutation.data && (
              <div className="space-y-6">
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4 shadow-primary/20 drop-shadow-md">
                    <Trophy className="w-6 h-6 text-primary" /> Winner: {raceMutation.data.winner.model}
                  </h3>
                  <Card className="rounded-none border-primary/50 bg-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-mono text-primary flex items-center gap-2">
                          <Activity className="w-4 h-4" /> COMPOSITE SCORE: {raceMutation.data.winner.score?.toFixed(1)}
                        </CardTitle>
                        <Badge variant="outline" className="rounded-none font-mono border-primary/50 text-primary bg-primary/10">{raceMutation.data.winner.latencyMs}ms</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="font-mono text-sm whitespace-pre-wrap text-foreground/90 relative z-10 leading-relaxed">
                      {raceMutation.data.winner.content}
                    </CardContent>
                    <CardFooter className="pt-0 justify-end gap-2 relative z-10">
                       <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-primary hover:text-primary-foreground border border-transparent hover:border-primary" onClick={() => handleFeedback(raceMutation.data.responseId, 1)}><ThumbsUp className="w-4 h-4" /></Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-destructive hover:text-destructive-foreground border border-transparent hover:border-destructive" onClick={() => handleFeedback(raceMutation.data.responseId, -1)}><ThumbsDown className="w-4 h-4" /></Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Full Telemetry</h4>
                    <Badge variant="secondary" className="rounded-none text-[10px] font-mono">{raceMutation.data.modelsRaced} Models</Badge>
                  </div>
                  {raceMutation.data.allResults.map((result, idx) => (
                    <Card key={idx} className={`rounded-none border-border bg-card animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${result.error ? 'border-destructive/50' : 'hover:border-primary/30'} transition-colors`} style={{ animationDelay: `${idx * 100}ms` }}>
                      <CardHeader className="py-3 bg-muted/10 border-b border-border">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm tracking-widest truncate max-w-[250px] font-mono text-primary/80" title={result.model}>{result.model}</span>
                          <div className="flex gap-2">
                            {result.score !== undefined && <Badge variant="secondary" className="rounded-none font-mono bg-background text-foreground border border-border">SC: {result.score.toFixed(1)}</Badge>}
                            {result.latencyMs !== undefined && <Badge variant="outline" className="rounded-none font-mono text-muted-foreground"><Clock className="w-3 h-3 mr-1"/> {result.latencyMs}ms</Badge>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 font-mono text-sm">
                        {result.error ? (
                          <div className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {result.error}
                          </div>
                        ) : (
                          <div className="line-clamp-3 text-muted-foreground hover:line-clamp-none hover:text-foreground transition-all cursor-ns-resize">
                            {result.content}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {mode === "chat" && chatMutation.data && (
              <Card className="rounded-none border-primary/50 bg-primary/5 h-full animate-in fade-in zoom-in-95 duration-300 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <CardHeader className="border-b border-border/50 pb-4 relative z-10 shrink-0">
                  <CardTitle className="text-lg font-bold tracking-widest text-primary flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> 
                      <span className="font-mono">{chatMutation.data.model}</span>
                    </div>
                    {chatMutation.data.usage?.total_tokens && (
                      <Badge variant="outline" className="rounded-none border-primary/30 text-primary/70 font-mono text-xs">
                        {chatMutation.data.usage.total_tokens} TOKENS
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 font-mono text-sm whitespace-pre-wrap text-foreground/90 overflow-auto flex-1 relative z-10 leading-relaxed">
                  {chatMutation.data.content}
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-4 justify-between bg-muted/10 relative z-10 shrink-0">
                   <div className="flex gap-2">
                     {chatMutation.data.stmModulesApplied?.map(mod => (
                       <Badge key={mod} variant="secondary" className="rounded-none text-[10px] uppercase font-mono">{mod.replace('_', ' ')}</Badge>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-primary hover:text-primary-foreground border border-transparent hover:border-primary transition-colors" onClick={() => handleFeedback(chatMutation.data.responseId, 1)}><ThumbsUp className="w-4 h-4" /></Button>
                     <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-destructive hover:text-destructive-foreground border border-transparent hover:border-destructive transition-colors" onClick={() => handleFeedback(chatMutation.data.responseId, -1)}><ThumbsDown className="w-4 h-4" /></Button>
                   </div>
                </CardFooter>
              </Card>
            )}

            {!raceMutation.data && !chatMutation.data && !isPending && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="relative">
                  <Activity className="w-16 h-16 opacity-20" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                </div>
                <p className="text-sm font-mono tracking-widest uppercase">tarik Bhai AI ready. Enter a prompt and execute.</p>
              </div>
            )}
            
            {isPending && !raceMutation.data && !chatMutation.data && (
              <div className="h-full flex flex-col items-center justify-center text-primary space-y-6">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin opacity-80 relative z-10" />
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-mono font-bold tracking-widest uppercase animate-pulse">Establishing connection...</p>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Routing query through {mode === 'race' ? tier : 'single'} pipeline</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
