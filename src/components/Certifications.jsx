import { useEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { useContent } from "../lib/contentContext";
import { prefersReducedMotion } from "../lib/motion";
import { Eyebrow } from "./ui";

const { name } = portfolioData.personalInfo;
// Built-in entries use "#" for "no link".
const linkOf = (c) => c.file || (c.link && c.link !== "#" ? c.link : null);

// Oval fade: the drawing dissolves into the paper with no straight edges, so it never
// reads as a framed rectangle.
const fade = {
  maskImage: "radial-gradient(ellipse 58% 62% at 50% 48%, #000 62%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 58% 62% at 50% 48%, #000 62%, transparent 100%)",
};

// The portrait's head turn: a 44-frame clip running from looking left (frame 0) through
// straight ahead (frame 17) to looking right (frame 43). Every frame is a keyframe, so any
// frame can be shown instantly in either direction; the poster is the straight-ahead frame.
const TURN = { src: "/videos/portrait-turn.mp4", poster: "/media/portrait-centre.webp", fps: 24, frames: 44, centre: 17 };
const EASE = 0.22; // how quickly the head follows the cursor, per animation frame

// Cursor x across the portrait (0..1) -> clip frame. The centre frame isn't midway through the
// clip, so each half of the portrait maps to its own stretch of frames.
const frameAt = (x) =>
  x <= 0.5 ? x * 2 * TURN.centre : TURN.centre + (x - 0.5) * 2 * (TURN.frames - 1 - TURN.centre);

// The video never plays; the cursor's position inside the portrait picks the frame shown.
// Touch screens and reduced-motion visitors keep the still, straight-ahead poster.
function Portrait() {
  const field = useRef(null);
  const video = useRef(null);

  useEffect(() => {
    const el = field.current;
    const v = video.current;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion()) return;

    let ready = false;
    let target = TURN.centre; // frame the cursor points at
    let current = TURN.centre; // eased frame, follows target
    let shown = TURN.centre; // frame the video is showing (or seeking to)
    let seeking = false;
    let left = 0;
    let width = 1;
    let raf = 0;

    // One seek at a time: the next frame is requested only after the last one has drawn.
    const seek = (frame) => {
      if (!ready || seeking || frame === shown) return;
      shown = frame;
      seeking = true;
      v.currentTime = (frame + 0.5) / TURN.fps; // middle of the frame, so rounding never lands on a neighbour
    };
    const tick = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.02) current = target;
      seek(Math.round(current));
      raf = current !== target || Math.round(current) !== shown ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      const r = el.getBoundingClientRect();
      left = r.left;
      width = r.width || 1;
    };
    const move = (e) => {
      if (e.pointerType === "touch") return;
      target = frameAt(Math.min(Math.max((e.clientX - left) / width, 0), 1));
      run();
    };
    const enter = (e) => {
      measure();
      move(e);
    };
    const leave = () => {
      target = TURN.centre;
      run();
    };
    const onSeeked = () => {
      seeking = false;
      run(); // catch up if the cursor moved on while that frame was drawing
    };
    const onReady = () => {
      ready = true;
      shown = -1;
      seek(Math.round(current));
    };

    v.addEventListener("seeked", onSeeked);
    v.addEventListener("loadeddata", onReady);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("resize", measure);
    // Only now fetch the clip; until it can draw a frame the poster shows the same pose.
    v.preload = "auto";
    v.load();

    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("loadeddata", onReady);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={field} className="absolute inset-0">
      <video
        ref={video}
        src={TURN.src}
        poster={TURN.poster}
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        role="img"
        aria-label={`Drawing of ${name} standing in a technical construction layout`}
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={fade}
      />
    </div>
  );
}

export default function Certifications() {
  const [open, setOpen] = useState(0);
  const { certifications } = useContent();
  if (!certifications.length) return null;

  return (
    <section id="certifications" className="border-b border-line">
      <div className="grid md:grid-cols-2">
        {/* Drawing, straight on the sheet like the hero: no frame; the head follows the cursor */}
        <div className="relative min-h-[420px] overflow-hidden md:min-h-[640px]">
          <Portrait />
          <p className="label pointer-events-none absolute bottom-4 left-4 text-mute">[ {certifications.length} certifications ]</p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col">
          <div className="px-4 pb-6 pt-10 md:px-[10%] md:pt-14">
            <Eyebrow>Certifications</Eyebrow>
            <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
              Always
              <br />
              learning
            </h2>
          </div>
          <ul className="border-t border-line md:mx-[10%] md:border-t-0">
            {certifications.map((c, i) => {
              const isOpen = open === i;
              return (
                <li key={c.id} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${c.id}-panel`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-0"
                    >
                      <span className="display text-[clamp(17px,1.5vw,22px)]">{c.title}</span>
                      <span aria-hidden="true" className={`text-[18px] text-mute transition-transform duration-500 ease-out-expo ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${c.id}-panel`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-5 md:px-0">
                        <p className="label text-mute">
                          {[c.issuer, c.date].filter(Boolean).join(" · ")}
                        </p>
                        {c.description && (
                          <p className="mt-2 max-w-[56ch] text-[14px] leading-snug text-ink-2">{c.description}</p>
                        )}
                        {linkOf(c) && (
                          <a
                            href={linkOf(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label mt-3 inline-flex items-center gap-1.5 text-signal underline-offset-4 hover:underline"
                          >
                            View certificate <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
