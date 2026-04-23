import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Send,
  Mic,
  Upload,
  Sparkles,
  Activity,
  Leaf,
  Droplets,
  ScanLine,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import leafImg from "@/assets/pest-aphid.png";

export const Route = createFileRoute("/ai-brain")({
  head: () => ({
    meta: [
      { title: "AI Brain — Neural Crop Analysis · AgriPredict" },
      {
        name: "description",
        content:
          "Futuristic neural core for deep crop analysis. Upload leaf scans for pathology detection, chlorophyll mapping and species identification.",
      },
    ],
  }),
  component: AIBrainPage,
});

interface ChatMessage {
  role: "ai" | "user";
  content: string;
  ts: string;
}

const seedMessages: ChatMessage[] = [
  {
    role: "ai",
    content:
      "Neural Core online. I'm AgriPredict's pathology assistant. Upload a high-resolution leaf scan and I'll analyze chlorophyll density, necrosis patterns and pest signatures.",
    ts: "10:42",
  },
  {
    role: "user",
    content: "Analyzing field 7G — armyworm alert was triggered earlier today.",
    ts: "10:43",
  },
  {
    role: "ai",
    content:
      "Confirmed. Cross-referenced with Sector 7G alert A-2381. Initiating deep scan on uploaded leaf sample. Detecting Vitis Vinifera. Necrosis confidence 87.3%.",
    ts: "10:43",
  },
];

function AIBrainPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [input, setInput] = useState("");
  const [scanning, setScanning] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setScanning((s) => !s), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const userMessage = input;
    setMessages((m) => [...m, { role: "user", content: userMessage, ts }]);
    setInput("");
    
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: data.reply,
          ts,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: "Neural connection interrupted. Please check your connection and try again.",
          ts,
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Neural core · v3.2
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold flex items-center gap-3">
            AI Brain
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary px-2 py-1 rounded-full bg-primary/10 ring-1 ring-primary/30">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-primary live-dot" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              Scan active
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Deep neural pathology engine — analyzing chlorophyll, necrosis and pest signatures from
            high-resolution scans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Chat */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-card overflow-hidden flex flex-col h-[640px]">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">AgriPredict Assistant</div>
              <div className="text-[10px] text-muted-foreground">Neural model · 18B params</div>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
              Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug",
                    m.role === "ai"
                      ? "bg-muted/70 text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm",
                  )}
                >
                  {m.content}
                  <div
                    className={cn(
                      "text-[10px] mt-1 font-mono",
                      m.role === "ai" ? "text-muted-foreground" : "text-primary-foreground/70",
                    )}
                  >
                    {m.ts}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border bg-card/80">
            <button className="w-full mb-2 flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-primary/30 text-xs text-primary font-semibold hover:bg-primary/5 transition">
              <Upload className="w-3.5 h-3.5" /> Upload high-resolution leaf scan
            </button>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Mic className="w-4 h-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask the neural core…"
                className="flex-1 h-9 px-3 rounded-lg bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-card transition"
              />
              <button
                onClick={send}
                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Leaf visualization */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-elevated relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Leaf analysis · Specimen #LF-7G-0421
              </div>
              <h2 className="mt-1 font-semibold text-lg flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-primary" /> Neural scan visualization
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-risk-high/15 text-risk-high ring-1 ring-risk-high/30">
              Pathology: Critical
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/10 to-muted overflow-hidden ring-1 ring-primary/20">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
              }}
            />

            {/* Leaf */}
            <img
              src={leafImg}
              alt="Specimen leaf scan"
              className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-luminosity opacity-90"
            />

            {/* Scanning line */}
            <AnimatePresence>
              {scanning && (
                <motion.div
                  initial={{ y: "0%", opacity: 0 }}
                  animate={{ y: "100%", opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
                  className="absolute left-0 right-0 h-16 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, var(--color-primary)/0.4, transparent)",
                    boxShadow: "0 0 24px var(--color-primary)",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Detection markers */}
            <Marker top="22%" left="35%" label="Necrosis" value="87.3%" tone="high" />
            <Marker top="52%" left="62%" label="Hydration" value="62.4%" tone="medium" />
            <Marker top="72%" left="28%" label="Chlorophyll" value="68.1%" tone="low" />

            {/* Status overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-card/80 backdrop-blur-md ring-1 ring-primary/30 text-[10px] font-semibold uppercase tracking-widest text-primary">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-primary live-dot" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
              Neural scan active
            </div>
            <div className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-md bg-card/80 backdrop-blur-md text-[10px] font-mono text-muted-foreground">
              Analyzing crop health · 1024×1024
            </div>
          </div>

          {/* Bottom metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Metric
              icon={Activity}
              label="Pathology status"
              value="CRITICAL"
              tone="high"
            />
            <Metric
              icon={Leaf}
              label="Chlorophyll density"
              value="62.4%"
              tone="medium"
            />
            <Metric
              icon={Droplets}
              label="Hydration level"
              value="58.1%"
              tone="medium"
            />
            <Metric
              icon={Zap}
              label="Species ID"
              value="V. Vinifera"
              tone="low"
            />
          </div>

          {/* Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function Marker({
  top,
  left,
  label,
  value,
  tone,
}: {
  top: string;
  left: string;
  label: string;
  value: string;
  tone: "high" | "medium" | "low";
}) {
  const map = {
    high: { dot: "bg-risk-high", text: "text-risk-high", ring: "ring-risk-high/40" },
    medium: { dot: "bg-risk-medium", text: "text-risk-medium", ring: "ring-risk-medium/40" },
    low: { dot: "bg-risk-low", text: "text-risk-low", ring: "ring-risk-low/40" },
  } as const;
  const c = map[tone];
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top, left }}>
      <div className="relative">
        <span className={cn("absolute inset-0 rounded-full animate-ping opacity-60", c.dot)} />
        <span className={cn("relative block w-3 h-3 rounded-full ring-2 ring-card", c.dot)} />
      </div>
      <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap">
        <div
          className={cn(
            "px-2 py-1 rounded-md bg-card/90 backdrop-blur-md text-[10px] font-semibold ring-1 shadow-card",
            c.ring,
          )}
        >
          <span className="text-muted-foreground">{label}</span>{" "}
          <span className={cn("font-bold", c.text)}>{value}</span>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "high" | "medium" | "low";
}) {
  const map = {
    high: "text-risk-high bg-risk-high/10",
    medium: "text-risk-medium bg-risk-medium/10",
    low: "text-risk-low bg-risk-low/10",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-3.5">
      <div className="flex items-center gap-2">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", map[tone])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          {label}
        </div>
      </div>
      <div className="mt-2 text-lg font-bold font-display tabular-nums">{value}</div>
    </div>
  );
}
