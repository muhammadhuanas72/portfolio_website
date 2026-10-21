import { useEffect, useRef, useState } from "react";
import { useContent } from "../lib/contentContext";
import { pauseScroll } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import { Btn, Eyebrow, Plus } from "./ui";

export default function Work() {
  const { projects } = useContent();
  const web = projects.filter((p) => p.category !== "data");
  const data = projects.filter((p) => p.category === "data");

  return (
    <section id="work" className="border-b border-line">
      <div className="grid gap-6 px-4 pb-10 pt-12 md:grid-cols-12 md:px-6 md:pt-16">
        <div className="md:col-span-8">
          <Eyebrow signal>Selected work</Eyebrow>
          <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
            Built, shipped
            <br />
            and measured
          </h2>
        </div>
        <p className="label self-end text-mute md:col-span-4 md:text-right">
          [{String(web.length).padStart(2, "0")}] Web builds · [{String(data.length).padStart(2, "0")}] Data &amp; analytics
        </p>
      </div>

      {web.length > 0 && <Gallery items={web} />}

      {data.length > 0 && (
        <div id="analytics" className="scroll-mt-[var(--nav-h)] border-t border-line">
          <div className="grid gap-4 px-4 pb-8 pt-12 md:grid-cols-12 md:px-6">
            <div className="md:col-span-8">
              <Eyebrow>Data &amp; analytics</Eyebrow>
              <h3 className="display mt-3 text-[clamp(26px,2.8vw,42px)]">
                Dashboards, models
                <br />
                and queries
              </h3>
            </div>
          </div>
          <div className="grid border-t border-line md:grid-cols-2 lg:grid-cols-3">
            {data.map((p, i) => (
              <DataProject key={p.id} p={p} i={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const num = (i) => String(i + 1).padStart(2, "0");

// Expanding gallery: the open project is a wide panel, the rest are narrow strips with
// vertical labels. Hover or click a strip to open it; its details sit underneath.
function Gallery({ items }) {
  const [open, setOpen] = useState(0);
  const active = Math.min(open, items.length - 1);
  const p = items[active];

  // The Process wireframe markers open a project here.
  useEffect(() => {
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("work:open", onOpen);
    return () => window.removeEventListener("work:open", onOpen);
  }, []);

  return (
    <div id="work-gallery" className="scroll-mt-[var(--nav-h)] border-t border-line">
      <div className="flex flex-col gap-2 p-4 md:h-[min(74svh,720px)] md:flex-row md:gap-3 md:p-6">
        {items.map((it, i) => (
          <Panel key={it.id} p={it} i={i} active={i === active} onOpen={() => setOpen(i)} />
        ))}
      </div>
      <Details p={p} i={active} />
    </div>
  );
}

function Panel({ p, i, active, onOpen }) {
  return (
    <article
      id={`project-${i + 1}`}
      onMouseEnter={onOpen}
      style={{ flexGrow: active ? 6 : 1 }}
      className={`relative min-w-0 overflow-hidden bg-ink transition-[flex-grow,height] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none md:h-auto md:basis-0 ${
        active ? "h-[max(62vw,260px)]" : "h-16"
      }`}
    >
      {p.image ? (
        <img
          src={p.image}
          alt={active ? `Screenshot of ${p.title}` : ""}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${active ? "object-left-top" : "object-center"}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-2 text-ink-2">
          <IsoGlyph name="layers" className="h-1/2 w-1/2" />
        </div>
      )}
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-colors duration-700 ${
          active
            ? "bg-gradient-to-t from-ink/95 from-[8%] via-ink/45 via-[45%] to-transparent max-md:bg-ink/35"
            : "bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10 max-md:bg-ink/70"
        }`}
      />

      {active ? (
        <a
          href={p.demoUrl || p.githubUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor={p.demoUrl ? "Open live demo ↗" : undefined}
          aria-label={`${p.title}: open the live site`}
          className="absolute inset-0 flex flex-col justify-end p-5 text-paper md:p-10"
        >
          <span className="label text-paper/80">
            {num(i)}
            {p.year ? ` · ${p.year}` : ""}
          </span>
          <span className="display mt-2 text-[clamp(28px,3.6vw,56px)] leading-[0.95]">{p.title}</span>
          <span className="mt-3 text-[14px] text-paper/85 md:text-[15px]">{p.subtitle}</span>
        </a>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          onFocus={onOpen}
          aria-label={`Show ${p.title}`}
          className="absolute inset-0 flex items-center justify-between px-4 text-paper md:flex-col-reverse md:justify-start md:px-0 md:pb-8"
        >
          <span className="label whitespace-nowrap tracking-[0.2em] md:rotate-180 md:[writing-mode:vertical-rl]">{p.title}</span>
          <span className="label text-paper/70 md:hidden">{num(i)}</span>
        </button>
      )}
    </article>
  );
}

function Details({ p, i }) {
  return (
    <div className="grid border-t border-line md:grid-cols-12">
      <div className="border-line px-4 py-6 md:col-span-5 md:border-r md:px-6">
        <p className="label flex justify-between text-mute">
          <span>
            [{num(i)}]{p.year ? ` · ${p.year}` : ""}
          </span>
          <span className="text-ink">{p.subtitle}</span>
        </p>
        <h3 className="display mt-4 text-[clamp(24px,2.4vw,36px)]">{p.title}</h3>
        {p.details && <p className="mt-3 max-w-[52ch] text-[14px] leading-snug text-ink-2">{p.details}</p>}
      </div>

      {p.features?.length > 0 && (
        <ul className="border-t border-line md:col-span-4 md:border-r md:border-t-0">
          {p.features.map((f, k) => (
            <li key={f} className="flex gap-4 border-b border-line px-4 py-3 text-[13px] leading-snug last:border-b-0 md:px-6">
              <span className="label pt-0.5 text-mute">{num(k)}</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col border-t border-line px-4 py-6 md:col-span-3 md:border-t-0 md:px-6">
        <Tags items={p.tech} />
        {(p.demoUrl || p.githubUrl || p.file) && (
          <div className="mt-6 flex flex-wrap gap-2 md:mt-auto md:pt-6">
            {p.file && <FileBtn p={p} />}
            {p.demoUrl && (
              <Btn href={p.demoUrl} external signal>
                Live demo
              </Btn>
            )}
            {p.githubUrl && (
              <Btn href={p.githubUrl} external>
                GitHub
              </Btn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const dataGlyphs = ["bars", "orb", "shaft"];

const extOf = (name = "") => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");

// What "View" opens for a data project, best first: a Power BI publish-to-web report, the
// uploaded PDF or Excel file (Excel through Microsoft's free web viewer), else the screenshot.
// Power BI .pbix files can't be shown in a browser, so for those the screenshot is the view.
function viewOf(p) {
  if (p.demoUrl && /^https:\/\/app\.powerbi\.com\/(view|reportEmbed)/i.test(p.demoUrl)) return { kind: "frame", src: p.demoUrl, label: "Power BI report" };
  const ext = extOf(p.fileName || p.filePath);
  if (p.file && ext === "pdf") return { kind: "frame", src: p.file, label: "PDF" };
  if (p.file && (ext === "xlsx" || ext === "xls"))
    return { kind: "frame", src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(p.file)}`, label: "Excel workbook" };
  if (p.image) return { kind: "image", src: p.image, label: "Screenshot" };
  return null;
}

function ViewBtn({ p }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Btn onClick={() => setOpen(true)} signal>
        View
      </Btn>
      {open && <Viewer p={p} view={viewOf(p)} onClose={() => setOpen(false)} />}
    </>
  );
}

// Full-screen viewer on a native <dialog>: Esc and the close button dismiss it.
function Viewer({ p, view, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    pauseScroll(true);
    return () => pauseScroll(false);
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={`${p.title}: ${view.label}`}
      data-lenis-prevent
      className="m-auto h-[min(92svh,900px)] w-[min(96vw,1400px)] max-w-none border border-ink bg-paper p-0 text-ink backdrop:bg-ink/70"
    >
      <div className="flex h-full flex-col">
        <div className="label flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <span className="truncate">
            {p.title} <span className="text-mute">· {view.label}</span>
          </span>
          <div className="flex shrink-0 items-center gap-4">
            {view.kind === "frame" && (
              <a href={view.src} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                Open in new tab ↗
              </a>
            )}
            <button type="button" onClick={onClose} className="btn" autoFocus>
              <span>Close</span>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 bg-paper-2">
          {view.kind === "frame" ? (
            <iframe src={view.src} title={`${p.title}: ${view.label}`} className="absolute inset-0 h-full w-full border-0" allowFullScreen />
          ) : (
            <img src={view.src} alt={`${p.title} screenshot`} className="absolute inset-0 h-full w-full object-contain p-4" />
          )}
        </div>
      </div>
    </dialog>
  );
}

function DataProject({ p, i }) {
  return (
    <article className="flex flex-col border-b border-line md:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0">
      <header className="label flex justify-between border-b border-line px-4 py-3">
        <span>{p.subtitle}</span>
        <span className="text-mute">
          [D{String(i + 1).padStart(2, "0")}]{p.year ? ` · ${p.year}` : ""}
        </span>
      </header>
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-dashed border-line text-ink-2">
        <Plus at="tl" />
        <Plus at="tr" />
        <Plus at="bl" />
        <Plus at="br" />
        {p.image ? (
          <img src={p.image} alt={`Preview of ${p.title}`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <IsoGlyph name={dataGlyphs[i % dataGlyphs.length]} className="h-[62%] w-[62%]" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-5">
        <h4 className="display text-[clamp(20px,1.7vw,26px)] leading-[1]">{p.title}</h4>
        {p.details && <p className="text-[13px] leading-snug text-ink-2">{p.details}</p>}
        {p.features?.length > 0 && (
          <ul className="space-y-2">
            {p.features.map((f, k) => (
              <li key={f} className="flex gap-3 text-[13px] leading-snug">
                <span className="label pt-0.5 text-mute">{String(k + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-2">
          <Tags items={p.tech} />
          {(viewOf(p) || p.demoUrl || p.githubUrl) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {viewOf(p) && <ViewBtn p={p} />}
              {p.demoUrl && !viewOf(p) && (
                <Btn href={p.demoUrl} external signal>
                  View
                </Btn>
              )}
              {p.githubUrl && (
                <Btn href={p.githubUrl} external>
                  GitHub
                </Btn>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// Download link for an uploaded project file (Power BI, Excel, CSV, PDF, ZIP). The file lives on
// Supabase's domain, where the download attribute is ignored, so ask storage to send it as a download.
function FileBtn({ p, signal = false }) {
  const name = p.fileName || p.filePath.split("/").pop();
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  return (
    <Btn href={`${p.file}?download=${encodeURIComponent(name)}`} signal={signal}>
      Download {ext ? `.${ext}` : "file"}
    </Btn>
  );
}

function Tags({ items = [] }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="label border border-line px-2 py-1 text-ink-2">
          {t}
        </li>
      ))}
    </ul>
  );
}
