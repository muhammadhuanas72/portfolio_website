import { useRef } from "react";
import { gsap, useGsap, MOTION_OK } from "../lib/motion";

// Mask with an ink-drip lower edge. It is 2.3× the element's height: opaque for the first
// 100 units, drips hanging to ~125, transparent below. Sliding it from 100% to 0% on scroll
// pours the rendered image down over the line drawing beneath it.
const DRIP_MASK = (() => {
  const rand = (i) => {
    const x = Math.sin(i * 91.7) * 43758.5453;
    return x - Math.floor(x);
  };
  let d = "M0 0H100V100";
  const n = 26;
  for (let i = 0; i < n; i++) {
    const x1 = 100 - (i * 100) / n;
    const x0 = 100 - ((i + 1) * 100) / n;
    const len = 2 + 23 * rand(i) ** 2;
    d += `C${(x1 - 0.6).toFixed(2)} ${(100 + len).toFixed(2)} ${(x0 + 0.6).toFixed(2)} ${(100 + len).toFixed(2)} ${x0.toFixed(2)} 100`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 230" preserveAspectRatio="none"><path d="${d}Z" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

const maskStyle = {
  "--reveal": "0%",
  maskImage: DRIP_MASK,
  WebkitMaskImage: DRIP_MASK,
  maskSize: "100% 230%",
  WebkitMaskSize: "100% 230%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "0 var(--reveal)",
  WebkitMaskPosition: "0 var(--reveal)",
};

/**
 * Draw-to-render scroll reveal, as on the reference site: a line drawing is rendered into the
 * real image from the top as the element scrolls through the viewport, and reverses on the way up.
 * Without motion preferences it simply shows the rendered image.
 */
export default function RenderReveal({
  lines,
  src,
  alt,
  className = "",
  imgClassName = "",
  renderClassName = "",
  start = "top 85%",
  end = "center 45%",
  loading = "lazy",
}) {
  const wrap = useRef(null);
  const render = useRef(null);

  useGsap(
    wrap,
    (add) => {
      add(MOTION_OK, () => {
        gsap.fromTo(
          render.current,
          { "--reveal": "100%" },
          {
            "--reveal": "0%",
            ease: "none",
            scrollTrigger: { trigger: wrap.current, start, end, scrub: 0.7 },
          }
        );
      });
    },
    [src, lines]
  );

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <img src={lines} alt="" aria-hidden="true" loading={loading} decoding="async" className={`absolute inset-0 h-full w-full ${imgClassName}`} />
      <img
        ref={render}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`absolute inset-0 h-full w-full ${imgClassName} ${renderClassName}`}
        style={maskStyle}
      />
    </div>
  );
}
