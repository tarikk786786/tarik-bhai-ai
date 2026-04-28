import { useEffect, useRef } from "react";

interface Star3D {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

interface Planet {
  orbitA: number;
  orbitB: number;
  orbitSpeed: number;
  angle: number;
  size: number;
  rgb: string;
  hasRing: boolean;
  moons: number;
  moonAngle: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 3D Warp Stars
    const stars: Star3D[] = Array.from({ length: 320 }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      color: ["255,255,255", "180,220,255", "0,255,180", "255,200,120", "150,100,255"][Math.floor(Math.random() * 5)],
    }));

    // Planets
    const planets: Planet[] = [
      { orbitA: 155, orbitB: 52, orbitSpeed: 0.0025, angle: 0.8,   size: 18, rgb: "80,140,220",  hasRing: false, moons: 1, moonAngle: 0 },
      { orbitA: 265, orbitB: 88, orbitSpeed: 0.0015, angle: 2.5,   size: 26, rgb: "210,140,60",  hasRing: true,  moons: 2, moonAngle: 0 },
      { orbitA: 375, orbitB: 115, orbitSpeed: 0.001, angle: 4.8,   size: 14, rgb: "0,200,160",   hasRing: false, moons: 0, moonAngle: 0 },
      { orbitA: 98,  orbitB: 32,  orbitSpeed: 0.004, angle: 1.5,   size: 9,  rgb: "200,80,80",   hasRing: false, moons: 0, moonAngle: 0 },
    ];

    // Comets
    const comets: Comet[] = Array.from({ length: 5 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 100, active: false,
    }));

    const launchComet = (c: Comet) => {
      const W = canvas.width; const H = canvas.height;
      const speed = 8 + Math.random() * 10;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { c.x = -20; c.y = Math.random() * H; }
      else if (edge === 1) { c.x = W + 20; c.y = Math.random() * H; }
      else if (edge === 2) { c.x = Math.random() * W; c.y = -20; }
      else { c.x = Math.random() * W; c.y = H + 20; }
      const tx = W * 0.3 + Math.random() * W * 0.4;
      const ty = H * 0.3 + Math.random() * H * 0.4;
      const dx = tx - c.x; const dy = ty - c.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      c.vx = (dx / len) * speed; c.vy = (dy / len) * speed;
      c.maxLife = 50 + Math.random() * 70;
      c.life = 0; c.active = true;
    };

    // Nebula blobs
    const nebulas = [
      { rx: 0.18, ry: 0.22, rgb: "0,168,132" },
      { rx: 0.80, ry: 0.68, rgb: "40,80,200" },
      { rx: 0.55, ry: 0.88, rgb: "140,0,210" },
      { rx: 0.88, ry: 0.16, rgb: "0,168,132" },
    ];

    // Galaxy spiral points
    type GP = { a: number; r: number; zy: number; bri: number; sz: number; rgb: string };
    const galPoints: GP[] = Array.from({ length: 1200 }, (_, i) => {
      const arm = i % 3;
      const dist = Math.pow(Math.random(), 0.5) * 220;
      const baseA = (arm * Math.PI * 2) / 3 + dist * 0.02 + (Math.random() - 0.5) * 0.6;
      return {
        a: baseA, r: dist + (Math.random() - 0.5) * 20,
        zy: (Math.random() - 0.5) * 20,
        bri: Math.random() * 0.55 + 0.1,
        sz: Math.random() * 1.4 + 0.3,
        rgb: dist < 60 ? "200,180,255" : dist < 130 ? "0,220,160" : "0,168,132",
      };
    });

    const proj = (x: number, y: number, z: number) => {
      const fov = 0.8;
      const s = fov / Math.max(z, 0.001);
      return { sx: x * s, sy: y * s };
    };

    const drawPlanet = (p: Planet, cx: number, cy: number) => {
      const px = cx + Math.cos(p.angle) * p.orbitA;
      const py = cy + Math.sin(p.angle) * p.orbitB;

      // Outer glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4.5);
      glow.addColorStop(0, `rgba(${p.rgb},0.35)`);
      glow.addColorStop(0.5, `rgba(${p.rgb},0.08)`);
      glow.addColorStop(1, `rgba(${p.rgb},0)`);
      ctx.beginPath(); ctx.arc(px, py, p.size * 4.5, 0, Math.PI * 2);
      ctx.fillStyle = glow; ctx.fill();

      // Planet body
      const body = ctx.createRadialGradient(
        px - p.size * 0.35, py - p.size * 0.35, 0,
        px, py, p.size
      );
      body.addColorStop(0, `rgba(${p.rgb},1)`);
      body.addColorStop(0.65, `rgba(${p.rgb},0.85)`);
      body.addColorStop(1, `rgba(${p.rgb},0.2)`);
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = body; ctx.fill();

      // Ring
      if (p.hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, 0.32);
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${p.rgb},0.5)`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2.0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${p.rgb},0.2)`;
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Moons
      p.moonAngle += 0.012;
      for (let m = 0; m < p.moons; m++) {
        const ma = p.moonAngle + m * Math.PI;
        const mr = p.size * 2.2 + m * 12;
        const mx = px + Math.cos(ma) * mr;
        const my = py + Math.sin(ma) * mr * 0.38;
        ctx.beginPath();
        ctx.arc(mx, my, p.size * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(210,220,235,0.85)";
        ctx.fill();
      }

      p.angle += p.orbitSpeed;
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Nebula glow blobs
      nebulas.forEach(n => {
        const nx = n.rx * W; const ny = n.ry * H;
        const r = W * 0.18 + 50;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
        g.addColorStop(0, `rgba(${n.rgb},0.09)`);
        g.addColorStop(0.5, `rgba(${n.rgb},0.04)`);
        g.addColorStop(1, `rgba(${n.rgb},0)`);
        ctx.beginPath(); ctx.arc(nx, ny, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      // Galaxy disk
      const gRot = frame * 0.00007;
      ctx.save(); ctx.translate(cx, cy);
      galPoints.forEach(p => {
        const a = p.a + gRot;
        const wx = Math.cos(a) * p.r;
        const wz = Math.sin(a) * p.r;
        const sy = p.zy + wz * 0.28;
        const alpha = p.bri * (0.5 + 0.2 * Math.sin(frame * 0.002 + a));
        ctx.beginPath();
        ctx.arc(wx, sy * 0.38, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb},${alpha})`;
        ctx.fill();
      });
      // Galaxy core
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
      const ca = 0.22 + 0.07 * Math.sin(frame * 0.015);
      core.addColorStop(0, `rgba(220,200,255,${ca})`);
      core.addColorStop(0.4, `rgba(0,200,140,${ca * 0.4})`);
      core.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fillStyle = core; ctx.fill();
      ctx.restore();

      // Orbit rings (dashed ellipses)
      planets.forEach(p => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.orbitA, p.orbitB, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,168,132,0.1)";
        ctx.lineWidth = 0.7;
        ctx.setLineDash([4, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Planets behind center
      planets.forEach(p => { if (Math.sin(p.angle) > 0) drawPlanet(p, cx, cy); });

      // 3D warp starfield
      stars.forEach(s => {
        s.z -= 0.0045;
        if (s.z <= 0.001) {
          s.x = (Math.random() - 0.5) * 2;
          s.y = (Math.random() - 0.5) * 2;
          s.z = 1;
        }

        const { sx: ox, sy: oy } = proj(s.x, s.y, s.z + 0.045);
        const { sx, sy } = proj(s.x, s.y, s.z);
        const px = cx + sx * W;
        const py = cy + sy * H;
        const px0 = cx + ox * W;
        const py0 = cy + oy * H;

        if (px < -10 || px > W + 10 || py < -10 || py > H + 10) return;

        const brightness = Math.min(1, (1 - s.z) * 1.5);
        const r = Math.max(0.3, s.size * (1 - s.z) * 2.8);

        // Warp trail
        if (s.z < 0.82) {
          const tg = ctx.createLinearGradient(px, py, px0, py0);
          tg.addColorStop(0, `rgba(${s.color},${brightness * 0.7})`);
          tg.addColorStop(1, `rgba(${s.color},0)`);
          ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(px0, py0);
          ctx.strokeStyle = tg;
          ctx.lineWidth = r * 0.55;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${brightness})`;
        ctx.fill();

        // Star sparkle
        if (brightness > 0.75 && r > 1.6) {
          ctx.strokeStyle = `rgba(${s.color},${brightness * 0.25})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(px - r * 3, py); ctx.lineTo(px + r * 3, py);
          ctx.moveTo(px, py - r * 3); ctx.lineTo(px, py + r * 3);
          ctx.stroke();
        }
      });

      // Planets in front
      planets.forEach(p => { if (Math.sin(p.angle) <= 0) drawPlanet(p, cx, cy); });

      // Comets
      comets.forEach(c => {
        if (!c.active) {
          if (Math.random() < 0.004) launchComet(c);
          return;
        }
        c.x += c.vx; c.y += c.vy; c.life++;
        const alpha = Math.sin((c.life / c.maxLife) * Math.PI);
        const spd = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        const tailLen = 70 + c.life * 2;
        const tx = c.x - (c.vx / spd) * tailLen;
        const ty = c.y - (c.vy / spd) * tailLen;
        const tg = ctx.createLinearGradient(c.x, c.y, tx, ty);
        tg.addColorStop(0, `rgba(255,255,255,${alpha})`);
        tg.addColorStop(0.2, `rgba(0,255,200,${alpha * 0.7})`);
        tg.addColorStop(0.7, `rgba(0,168,132,${alpha * 0.25})`);
        tg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty);
        ctx.strokeStyle = tg; ctx.lineWidth = 2;
        ctx.lineCap = "round"; ctx.stroke();
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        if (c.life >= c.maxLife) c.active = false;
      });

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
