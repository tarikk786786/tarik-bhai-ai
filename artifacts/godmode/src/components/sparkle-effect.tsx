import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "circle" | "star" | "ring";
}

const COLORS = [
  "0,168,132",
  "0,255,200",
  "255,200,0",
  "200,100,255",
  "0,200,255",
  "255,120,0",
  "255,255,255",
];

export function SparkleEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (x: number, y: number) => {
      const count = 28 + Math.floor(Math.random() * 14);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2.5 + Math.random() * 5.5;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const types: Particle["type"][] = ["circle", "star", "ring"];
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: 0,
          maxLife: 35 + Math.random() * 35,
          size: 2 + Math.random() * 4,
          color,
          type: types[Math.floor(Math.random() * 3)],
        });
      }
      // Center burst ring
      particlesRef.current.push({
        x, y,
        vx: 0, vy: 0,
        life: 0, maxLife: 25,
        size: 0, color: "0,168,132",
        type: "ring",
      });
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      const spikes = 5;
      const outer = r;
      const inner = r * 0.4;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        if (i === 0) ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        else ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      ctx.closePath();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.97;

        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI);

        if (p.type === "ring") {
          const radius = progress * 55;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${p.color},${alpha * 0.5})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (p.type === "star") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(progress * Math.PI * 2);
          drawStar(ctx, 0, 0, p.size * (1 - progress * 0.5));
          ctx.fillStyle = `rgba(${p.color},${alpha})`;
          ctx.fill();
          ctx.restore();
        } else {
          // Glow circle
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
          glow.addColorStop(0, `rgba(${p.color},${alpha})`);
          glow.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${alpha})`;
          ctx.fill();
        }

        if (p.life >= p.maxLife) ps.splice(i, 1);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        spawn(e.clientX, e.clientY);
      } else {
        Array.from(e.touches).forEach(t => spawn(t.clientX, t.clientY));
      }
    };

    window.addEventListener("click", onPointer);
    window.addEventListener("touchstart", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999]"
    />
  );
}
