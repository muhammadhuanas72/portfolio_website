import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion";

const INTERACTIVE = "a, button, summary, label, [role='button'], input, textarea, select";

// Drafting cursor: a small "+" that follows the pointer, and a dark tag that trails it with
// the nearest [data-cursor] text. Only for fine pointers; touch keeps native behaviour.
export default function Cursor() {
  const plus = useRef(null);
  const tag = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const target = { x: -100, y: -100 };
    const p = { x: -100, y: -100 };
    const t = { x: -100, y: -100 };
    let raf = 0;
    let running = false;
    let label = "";
    let tagW = 0;
    let tagH = 0;

    const loop = () => {
      p.x += (target.x - p.x) * 0.45;
      p.y += (target.y - p.y) * 0.45;
      t.x += (target.x - t.x) * 0.16;
      t.y += (target.y - t.y) * 0.16;
      plus.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      // Keep the tag on screen: flip it to the other side of the pointer near the edges.
      const tx = t.x + 16 + tagW > window.innerWidth - 8 ? t.x - 16 - tagW : t.x + 16;
      const ty = t.y + 12 + tagH > window.innerHeight - 8 ? t.y - 12 - tagH : t.y + 12;
      tag.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (Math.abs(target.x - t.x) + Math.abs(target.y - t.y) < 0.3) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      root.classList.add("cursor-in");
      kick();
    };
    const over = (e) => {
      const el = e.target instanceof Element ? e.target : null;
      const text = el?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      if (text !== label) {
        label = text;
        tag.current.textContent = text;
        tag.current.classList.toggle("is-on", Boolean(text));
        tagW = tag.current.offsetWidth;
        tagH = tag.current.offsetHeight;
      }
      plus.current.classList.toggle("is-link", Boolean(el?.closest(INTERACTIVE)));
    };
    const out = (e) => !e.relatedTarget && root.classList.remove("cursor-in");
    const down = () => plus.current.classList.add("is-down");
    const up = () => plus.current.classList.remove("is-down");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor", "cursor-in");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div aria-hidden="true" className="cursor-layer">
      <div ref={plus} className="cursor-plus">
        <span />
        <span />
      </div>
      <div ref={tag} className="cursor-tag label" />
    </div>
  );
}
