import { useEffect, useRef } from "react";

interface Particle {
  type: "ring" | "streak" | "dot";
  x: number;
  y: number;
  angle?: number;
  speed?: number;
  life: number;
  maxLife: number;
  size: number;
  delay: number;
  color: string;
}

const BRAND = "0,168,132";
const WHITE  = "220,240,235";

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

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const spawn = (x: number, y: number) => {
      const ps = particlesRef.current;

      // Inner ripple ring — fast & tight
      ps.push({ type: "ring", x, y, life: 0, maxLife: 28, size: 6, delay: 0, color: BRAND });

      // Outer ripple ring — slower, larger
      ps.push({ type: "ring", x, y, life: 0, maxLife: 38, size: 2, delay: 6, color: WHITE });

      // Light streaks radiating outward
      const STREAKS = 10;
      for (let i = 0; i < STREAKS; i++) {
        const angle = (Math.PI * 2 * i) / STREAKS + (Math.random() - 0.5) * 0.25;
        const speed = 2.8 + Math.random() * 2.2;
        const life = 32 + Math.floor(Math.random() * 16);
        const color = Math.random() > 0.35 ? BRAND : WHITE;
        ps.push({ type: "streak", x, y, angle, speed, life: 0, maxLife: life, size: 1.2 + Math.random() * 0.8, delay: 0, color });
        // Dot at the tip of each streak
        ps.push({ type: "dot", x, y, angle, speed: speed * 1.05, life: 0, maxLife: life + 6, size: 1.4 + Math.random() * 1, delay: 2, color });
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particlesRef.current;

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        const age = p.life - p.delay;
        p.life++;
        if (age < 0) continue;

        const t = age / p.maxLife;
        if (t >= 1) { ps.splice(i, 1); continue; }

        if (p.type === "ring") {
          const progress = easeOut(t);
          const maxRadius = p.size === 6 ? 38 : 62;
          const radius = maxRadius * progress;
          const alpha = (1 - t) * (p.size === 6 ? 0.55 : 0.25);
          const lw    = p.size === 6 ? 1.5 : 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${p.color},${alpha})`;
          ctx.lineWidth = lw;
          ctx.stroke();

        } else if (p.type === "streak") {
          const progress = easeOut(t);
          // Fade in quickly, then fade out
          const alpha = t < 0.25 ? (t / 0.25) * 0.7 : (1 - t) * 0.7;
          const dist = p.speed! * p.maxLife * 0.45 * progress;
          const tailDist = dist * Math.max(0, 1 - t * 1.8);
          const ex = p.x + Math.cos(p.angle!) * dist;
          const ey = p.y + Math.sin(p.angle!) * dist;
          const tx = p.x + Math.cos(p.angle!) * tailDist;
          const ty = p.y + Math.sin(p.angle!) * tailDist;

          const grad = ctx.createLinearGradient(tx, ty, ex, ey);
          grad.addColorStop(0, `rgba(${p.color},0)`);
          grad.addColorStop(1, `rgba(${p.color},${alpha})`);
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.stroke();

        } else if (p.type === "dot") {
          const progress = easeOut(t);
          const alpha = t < 0.2 ? (t / 0.2) * 0.9 : Math.pow(1 - t, 2) * 0.9;
          const dist = p.speed! * p.maxLife * 0.45 * progress;
          const dx = p.x + Math.cos(p.angle!) * dist;
          const dy = p.y + Math.sin(p.angle!) * dist;
          const r  = p.size * (1 - t * 0.5);

          // Soft glow
          const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, r * 3.5);
          glow.addColorStop(0, `rgba(${p.color},${alpha * 0.5})`);
          glow.addColorStop(1, `rgba(${p.color},0)`);
          ctx.beginPath();
          ctx.arc(dx, dy, r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(dx, dy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color},${alpha})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent) {
        spawn(e.clientX, e.clientY);
      } else {
        Array.from(e.changedTouches).forEach(t => spawn(t.clientX, t.clientY));
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[999]" />;
}
