import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion";

const LIFE = 900; // ms a stroke stays on the sheet
const MAX_POINTS = 120;
const EASE = 0.32; // how quickly the pen catches up with the pointer
const STEP = 2.5; // px between recorded samples
const FAST = 1.4; // px/ms: below this pointer speed nothing is drawn
const FULL = 3; // px/ms: at this speed the scribble is at full strength

// Smooth pencil scribble that trails the pointer in the accent colour and fades out.
// It only appears on fast flicks of the mouse; normal movement leaves no trail.
// The pen follows an eased copy of the pointer, samples are evenly spaced, the wobble is a
// low-frequency sway along the path (not random jitter), and segments are drawn as
// quadratic curves through midpoints, so the line flows like a hand-drawn loop.
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

    const target = { x: 0, y: 0 };
    const pen = { x: 0, y: 0 };
    const points = [];
    let started = false;
    let dist = 0; // distance travelled, drives the sway
    let raf = 0;
    let vel = 0; // smoothed pointer speed, px/ms
    let lastMove = { x: 0, y: 0, t: 0 };
    let broken = true; // next drawn sample starts a new stroke

    const sample = (now) => {
      const dx = target.x - pen.x;
      const dy = target.y - pen.y;
      pen.x += dx * EASE;
      pen.y += dy * EASE;

      if (now - lastMove.t > 70) vel = 0; // pointer has stopped
      const ink = Math.min(Math.max((vel - FAST) / (FULL - FAST), 0), 1);
      if (!ink) {
        broken = true;
        return;
      }
      const last = points[points.length - 1];
      const gap = !broken && last ? Math.hypot(pen.x - last.bx, pen.y - last.by) : Infinity;
      if (gap < STEP) return;

      dist += Math.min(gap, 40);
      // Perpendicular sway: two slow sines layered for an organic, looping line.
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const speed = Math.min(gap / 8, 1.6);
      const sway = (Math.sin(dist * 0.06) * 3.2 + Math.sin(dist * 0.023 + 1.3) * 2) * (0.6 + speed);
      points.push({ bx: pen.x, by: pen.y, x: pen.x + nx * sway, y: pen.y + ny * sway, t: now, ink, brk: broken });
      broken = false;
      if (points.length > MAX_POINTS) points.shift();
    };

    const stroke = (now, offset, widthScale, alphaScale) => {
      for (let i = 1; i < points.length - 1; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        if (p1.brk || p2.brk) continue; // gap between separate flicks
        const life = Math.max(1 - (now - p1.t) / LIFE, 0);
        if (!life) continue;
        // Fade in at the pen tip too, so the newest segment does not start abruptly.
        const tip = Math.min((points.length - 1 - i) / 4, 1);
        ctx.globalAlpha = life * alphaScale * tip * (0.35 + 0.65 * p1.ink);
        ctx.lineWidth = (0.5 + 1.6 * life) * widthScale * (0.6 + 0.4 * p1.ink);
        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2 + offset, (p0.y + p1.y) / 2 - offset);
        ctx.quadraticCurveTo(p1.x + offset, p1.y - offset, (p1.x + p2.x) / 2 + offset, (p1.y + p2.y) / 2 - offset);
        ctx.stroke();
      }
    };

    const draw = (now) => {
      if (started) sample(now);
      while (points.length && now - points[0].t > LIFE) points.shift();

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      stroke(now, 0, 1, 0.9); // main line
      stroke(now, 0.9, 0.55, 0.35); // faint second pass, like graphite drag
      ctx.globalAlpha = 1;

      const moving = Math.abs(target.x - pen.x) + Math.abs(target.y - pen.y) > 0.3;
      raf = points.length || moving ? requestAnimationFrame(draw) : 0;
    };

    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      const dt = e.timeStamp - lastMove.t;
      if (dt > 0 && dt < 100) {
        const v = Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) / dt;
        vel = vel * 0.6 + v * 0.4;
      } else {
        vel = 0;
      }
      lastMove = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      if (!started) {
        pen.x = target.x;
        pen.y = target.y;
        started = true;
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    // Leaving the window lifts the pen, so re-entering elsewhere doesn't draw a long line.
    const lift = () => {
      started = false;
      broken = true;
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", lift);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", lift);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[94] h-full w-full" />;
}
