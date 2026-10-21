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
const TURN = {
  src: "/videos/portrait-turn.mp4",
  srcMobile: "/videos/portrait-turn-mobile.mp4", // phones show the portrait at half width
  poster: "/media/portrait-centre.webp",
  fps: 24,
  frames: 44,
  centre: 17,
};
const EASE = 0.22; // how quickly the head follows the cursor, per animation frame

// Cursor x across the portrait (0..1) -> clip frame. The centre frame isn't midway through the
// clip, so each half of the portrait maps to its own stretch of frames.
const frameAt = (x) =>
  x <= 0.5 ? x * 2 * TURN.centre : TURN.centre + (x - 0.5) * 2 * (TURN.frames - 1 - TURN.centre);

// The video never plays; the pointer's position picks the frame shown. Over the portrait the
// head follows the cursor; anywhere else in the section (the certifications list sits to the
// right) it looks toward the cursor, so hovering the list turns it to face the list.
// On touch screens the head glances left and right once when the portrait scrolls into view,
// follows a finger sliding across the portrait, looks right when a certificate is tapped, and
// returns to centre when the finger lifts. Reduced-motion visitors keep the still poster.
function Portrait() {
  const field = useRef(null);
  const video = useRef(null);
  const [small] = useState(() => window.matchMedia("(max-width: 767px)").matches);

  useEffect(() => {
    const el = field.current;
    const area = el.closest("section") ?? el; // listen across the whole section
    const v = video.current;
    if (prefersReducedMotion()) return;
    const touchOnly = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let ready = false;
    let target = TURN.centre; // frame the cursor points at
    let current = TURN.centre; // eased frame, follows target
    let shown = TURN.centre; // frame the video is showing (or seeking to)
    let seeking = false;
    let left = 0;
    let width = 1;
    let raf = 0;
    let ease = EASE;
    let timers = [];
    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    // One seek at a time: the next frame is requested only after the last one has drawn.
    const seek = (frame) => {
      if (!ready || seeking || frame === shown) return;
      shown = frame;
      seeking = true;
      v.currentTime = (frame + 0.5) / TURN.fps; // middle of the frame, so rounding never lands on a neighbour
    };
    const tick = () => {
      current += (target - current) * ease;
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
    const aim = (e) => {
      ease = EASE;
      target = frameAt(Math.min(Math.max((e.clientX - left) / width, 0), 1));
      run();
    };
    const move = (e) => {
      if (e.pointerType === "touch" && !e.buttons) return; // a finger only steers while it's down
      aim(e);
    };
    const enter = (e) => {
      if (e.pointerType === "touch") return;
      measure();
      aim(e);
    };
    const leave = (e) => {
      if (e?.pointerType === "touch") return;
      target = TURN.centre;
      run();
    };
    // Touch: aim where the finger lands; ease back to centre a moment after it lifts.
    const down = (e) => {
      if (e.pointerType !== "touch") return;
      clearTimers();
      measure();
      aim(e);
    };
    const up = (e) => {
      if (e.pointerType !== "touch") return;
      clearTimers();
      timers.push(
        setTimeout(() => {
          ease = 0.12;
          target = TURN.centre;
          run();
        }, 900)
      );
    };
    // A slow look left, then right, then back to centre, the first time the portrait is seen.
    const glance = () => {
      clearTimers();
      ease = 0.07;
      const step = (frame, at) =>
        timers.push(
          setTimeout(() => {
            target = frame;
            run();
          }, at)
        );
      step(0, 0);
      step(TURN.frames - 1, 1100);
      step(TURN.centre, 2300);
    };
    let seen = !touchOnly;
    let wantGlance = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (seen || !entry.isIntersecting) return;
        seen = true;
        if (ready) glance();
        else wantGlance = true;
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    const onSeeked = () => {
      seeking = false;
      run(); // catch up if the cursor moved on while that frame was drawing
    };
    const onReady = () => {
      ready = true;
      shown = -1;
      seek(Math.round(current));
      if (wantGlance) glance();
    };

    v.addEventListener("seeked", onSeeked);
    v.addEventListener("loadeddata", onReady);
    area.addEventListener("pointerenter", enter);
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    area.addEventListener("pointerdown", down);
    area.addEventListener("pointerup", up);
    area.addEventListener("pointercancel", up);
    window.addEventListener("resize", measure);
    // Only now fetch the clip; until it can draw a frame the poster shows the same pose.
    v.preload = "auto";
    v.load();

    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
      io.disconnect();
      area.removeEventListener("pointerdown", down);
      area.removeEventListener("pointerup", up);
      area.removeEventListener("pointercancel", up);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("loadeddata", onReady);
      area.removeEventListener("pointerenter", enter);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={field} className="absolute inset-0 touch-pan-y">
      <video
        ref={video}
        src={small ? TURN.srcMobile : TURN.src}
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
      <div className="grid grid-cols-2">
        {/* Drawing, straight on the sheet like the hero: no frame; the head follows the cursor */}
        <div className="relative min-h-[360px] overflow-hidden md:min-h-[640px]">
          <Portrait />
          <p className="label pointer-events-none absolute bottom-4 left-4 z-10 hidden text-mute md:block">
            [ {certifications.length} certifications ]
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col">
          <div className="px-3 pb-4 pt-6 md:px-[10%] md:pb-6 md:pt-14">
            <Eyebrow>Certifications</Eyebrow>
            <h2 className="display mt-2 text-[22px] md:mt-3 md:text-[clamp(30px,3.5vw,52px)]">
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
                      className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left md:gap-4 md:px-0 md:py-4"
                    >
                      <span className="display text-[12px] leading-[1.15]! md:text-[clamp(17px,1.5vw,22px)] md:leading-[0.98]!">{c.title}</span>
                      <span aria-hidden="true" className={`text-[14px] text-mute md:text-[18px] transition-transform duration-500 ease-out-expo ${isOpen ? "rotate-45" : ""}`}>
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
                      <div className="px-3 pb-3 md:px-0 md:pb-5">
                        <p className="label text-[9px]! text-mute md:text-[11px]!">
                          {[c.issuer, c.date].filter(Boolean).join(" · ")}
                        </p>
                        {c.description && (
                          <p className="mt-1.5 max-w-[56ch] text-[11px] leading-snug text-ink-2 md:mt-2 md:text-[14px]">{c.description}</p>
                        )}
                        {linkOf(c) && (
                          <a
                            href={linkOf(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label mt-2 inline-flex items-center gap-1.5 text-[9px]! text-signal underline-offset-4 hover:underline md:mt-3 md:text-[11px]!"
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
