import { Fragment } from "react";

// Small drafting-sheet primitives shared by every section.

const corners = {
  tl: "left-1.5 top-1",
  tr: "right-1.5 top-1",
  bl: "left-1.5 bottom-1",
  br: "right-1.5 bottom-1",
};

export function Plus({ at = "tl" }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute z-10 text-[13px] leading-none text-mute ${corners[at]}`}>
      +
    </span>
  );
}

export function Corners() {
  return (
    <>
      <Plus at="tl" />
      <Plus at="tr" />
      <Plus at="bl" />
      <Plus at="br" />
    </>
  );
}

export function Ruler({ className = "" }) {
  return <div aria-hidden="true" className={`ruler mx-6 ${className}`} />;
}

export function Eyebrow({ children, signal = false, className = "" }) {
  return (
    <p className={`label flex items-center gap-2 text-ink ${className}`}>
      {signal && <span aria-hidden="true" className="h-2 w-2 bg-signal" />}
      {children}
    </p>
  );
}

export function Btn({ children, href, onClick, signal = false, download, external = false, className = "" }) {
  const cls = `btn ${signal ? "btn-signal" : ""} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span aria-hidden="true">
        <span className="arrow">→</span>
      </span>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        download={download}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

// Splits text into word spans so GSAP can colour or lift them individually.
// `mask` clips each word so it can rise into view from below its own baseline.
export function Words({ text, className = "", wordClass = "", mask = false }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <span className={mask ? "inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-top" : undefined}>
            <span data-word className={`inline-block ${wordClass}`}>{w}</span>
          </span>{" "}
        </Fragment>
      ))}
    </span>
  );
}
