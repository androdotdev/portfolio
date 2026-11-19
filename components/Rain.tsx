"use client";
import { useEffect, useRef } from "react";

type Drop = { x: number; y: number; len: number; speed: number; alpha: number };

export default function Rain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    let drops: Drop[] = [];
    const slant = 0.18;

    const make = (): Drop => ({
      x: Math.random() * (w + 200) - 100,
      y: Math.random() * h,
      len: 10 + Math.random() * 18,
      speed: 9 + Math.random() * 9,
      alpha: 0.08 + Math.random() * 0.22,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: Math.floor(w / 7) }, make);
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const d of drops) {
        ctx.strokeStyle = `rgba(190,210,230,${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * slant, d.y + d.len);
        ctx.stroke();
        d.y += d.speed; d.x += d.speed * slant;
        if (d.y > h) { d.y = -d.len; d.x = Math.random() * (w + 200) - 100; }
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="rain" aria-hidden />;
}
