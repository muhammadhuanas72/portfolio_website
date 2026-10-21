import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion";

const LIFE = 900; // ms a stroke stays on the sheet
const MAX_POINTS = 90;

// Pencil scribble that trails the pointer in the signal colour and fades out.
// Each sample is offset by a little seeded wobble and drawn as two thin overlapping
// strokes, so it reads as a hand-drawn line rather than a smooth vector trail.
export default function Scribble() {
  const canvas = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const color = getComputedStyle(document.documentElement).getPropertyValue("--color-signal").trim() || "#6b1d2e";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const points = [];
    let raf = 0;
    let seed = 0;
    const wobble = () => {
      seed += 1;
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return (x - Math.floor(x) - 0.5) * 2;
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      while (points.length && now - points[0].t > LIFE) points.shift();

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1];
          const b = points[i];
          const life = 1 - (now - b.t) / LIFE;
          ctx.globalAlpha = Math.max(life, 0) * (pass ? 0.5 : 0.95);
          ctx.lineWidth = pass ? 1 : 1.9 * life + 0.4;
          ctx.beginPath();
          ctx.moveTo(a.x + a.j[pass * 2], a.y + a.j[pass * 2 + 1]);
          ctx.lineTo(b.x + b.j[pass * 2], b.y + b.j[pass * 2 + 1]);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      raf = points.length ? requestAnimationFrame(draw) : 0;
    };

    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const last = points[points.length - 1];
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 2) return;
      // Faster movement scribbles wider.
      const speed = last ? Math.min(Math.hypot(e.clientX - last.x, e.clientY - last.y) / 10, 3) : 1;
      const amp = 2 + speed * 1.4;
      points.push({
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        j: [wobble() * amp, wobble() * amp, wobble() * amp * 1.6, wobble() * amp * 1.6],
      });
      if (points.length > MAX_POINTS) points.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[94] h-full w-full" />;
}
