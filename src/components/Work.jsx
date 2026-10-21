import { useEffect, useRef, useState } from "react";
import { useContent } from "../lib/contentContext";
import { pauseScroll } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import { Btn, Eyebrow } from "./ui";

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
          <Gallery items={data} data />
        </div>
      )}
    </section>
  );
}

const num = (i) => String(i + 1).padStart(2, "0");

// Expanding gallery: the open project is a wide panel, the rest are narrow strips with
// vertical labels. Hover or click a strip to open it; its details sit underneath.
// `data` galleries hold dashboards: the open panel and the View button open the viewer.
function Gallery({ items, data = false }) {
  const [open, setOpen] = useState(0);
  const [viewing, setViewing] = useState(null);
  const active = Math.min(open, items.length - 1);
  const p = items[active];

  // The Process wireframe markers open a web project here.
  useEffect(() => {
    if (data) return;
    const onOpen = (e) => setOpen(e.detail);
    window.addEventListener("work:open", onOpen);
    return () => window.removeEventListener("work:open", onOpen);
  }, [data]);

  return (
    <div id={data ? "analytics-gallery" : "work-gallery"} className="scroll-mt-[var(--nav-h)] border-t border-line">
      <div className="flex flex-col gap-2 p-4 md:h-[min(74svh,720px)] md:flex-row md:gap-3 md:p-6">
        {items.map((it, i) => (
          <Panel
            key={it.id}
            p={it}
            i={i}
            data={data}
            active={i === active}
            onOpen={() => setOpen(i)}
            onView={data && viewOf(it) ? () => setViewing(it) : null}
          />
        ))}
      </div>
      <Details p={p} i={active} data={data} onView={data && viewOf(p) ? () => setViewing(p) : null} />
      {viewing && <Viewer p={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function Panel({ p, i, active, onOpen, data = false, onView = null }) {
  const label = (
    <>
      <span className="label text-paper/80">
        {num(i)}
        {p.year ? ` · ${p.year}` : ""}
      </span>
      <span className="display mt-2 text-[clamp(28px,3.6vw,56px)] leading-[0.95]">{p.title}</span>
      <span className="mt-3 text-[14px] text-paper/85 md:text-[15px]">{p.subtitle}</span>
    </>
  );
  const cover = "absolute inset-0 flex flex-col justify-end p-5 text-left text-paper md:p-10";

  return (
    <article
      id={`${data ? "dashboard" : "project"}-${i + 1}`}
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
          <IsoGlyph name={data ? dataGlyphs[i % dataGlyphs.length] : "layers"} className="h-1/2 w-1/2 md:h-[40%] md:w-[40%]" />
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

      {active && data ? (
        onView ? (
          <button type="button" onClick={onView} data-cursor="View dashboard" aria-label={`${p.title}: view`} className={cover}>
            {label}
          </button>
        ) : (
          <div className={cover}>{label}</div>
        )
      ) : active ? (
        <a
          href={p.demoUrl || p.githubUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor={p.demoUrl ? "Open live demo ↗" : undefined}
          aria-label={`${p.title}: open the live site`}
          className={cover}
        >
          {label}
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

function Details({ p, i, data = false, onView = null }) {
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
        {(onView || p.demoUrl || p.githubUrl || p.file) && (
          <div className="mt-6 flex flex-wrap gap-2 md:mt-auto md:pt-6">
            {onView && (
              <Btn onClick={onView} signal>
                View
              </Btn>
            )}
            {!data && p.file && <FileBtn p={p} />}
            {p.demoUrl && !(data && viewsOf(p).some((v) => v.src === p.demoUrl)) && (
              <Btn href={p.demoUrl} external signal={!onView}>
                {data ? "Open report" : "Live demo"}
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

// Everything "View" can show for a data project: the screenshot first, then the work itself (a
// Power BI publish-to-web report, a PDF, or an Excel workbook read right in the browser).
// Files a browser can't show (Power BI .pbix, .csv, .zip) are offered as a download instead.
function viewsOf(p) {
  const views = [];
  if (p.image) views.push({ kind: "image", src: p.image, label: "Screenshot" });
  if (p.demoUrl && /^https:\/\/app\.powerbi\.com\/(view|reportEmbed)/i.test(p.demoUrl)) views.push({ kind: "frame", src: p.demoUrl, label: "Power BI report" });
  const ext = extOf(p.fileName || p.filePath);
  if (p.file && ext === "pdf") views.push({ kind: "frame", src: p.file, label: "PDF" });
  if (p.file && (ext === "xlsx" || ext === "xls")) views.push({ kind: "sheet", src: p.file, label: "Excel workbook" });
  return views;
}
const VIEWABLE = ["pdf", "xlsx", "xls"];
const viewOf = (p) => viewsOf(p).length > 0 || Boolean(p.file);

// Full-screen viewer on a native <dialog>: tabs switch between the screenshot and the file;
// Esc and the close button dismiss it.
function Viewer({ p, onClose }) {
  const ref = useRef(null);
  const views = viewsOf(p);
  const [tab, setTab] = useState(0);
  const view = views[tab];
  const ext = extOf(p.fileName || p.filePath);
  const name = p.fileName || p.filePath?.split("/").pop();
  const download = p.file && `${p.file}?download=${encodeURIComponent(name)}`;

  useEffect(() => {
    ref.current.showModal();
    pauseScroll(true);
    return () => pauseScroll(false);
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={p.title}
      data-lenis-prevent
      className="m-auto h-[min(92svh,900px)] w-[min(96vw,1400px)] max-w-none border border-ink bg-paper p-0 text-ink backdrop:bg-ink/70"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="label min-w-0 truncate">{p.title}</p>
          <button type="button" onClick={onClose} className="btn shrink-0" autoFocus>
            <span>Close</span>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="label flex flex-wrap items-stretch border-b border-line" role="tablist">
          {views.map((v, i) => (
            <button
              key={v.label}
              type="button"
              role="tab"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={`border-r border-line px-4 py-2.5 transition-colors ${i === tab ? "bg-ink text-paper" : "hover:bg-paper-2"}`}
            >
              {v.label}
            </button>
          ))}
          {download && (
            <a href={download} className={`px-4 py-2.5 hover:bg-paper-2 ${VIEWABLE.includes(ext) ? "ml-auto" : "border-r border-line text-signal"}`}>
              Download .{ext} ↓
            </a>
          )}
        </div>
        <div className="relative min-h-0 flex-1 bg-paper-2">
          {!view ? (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-[14px] text-ink-2">
              This file can&rsquo;t be shown in the browser. Use the download link above to open it.
            </p>
          ) : view.kind === "sheet" ? (
            <Sheet src={view.src} />
          ) : view.kind === "frame" ? (
            <iframe key={view.src} src={view.src} title={`${p.title}: ${view.label}`} className="absolute inset-0 h-full w-full border-0" allowFullScreen />
          ) : (
            <img src={view.src} alt={`${p.title} screenshot`} className="absolute inset-0 h-full w-full object-contain p-4" />
          )}
        </div>
      </div>
    </dialog>
  );
}

const MAX_ROWS = 2000;

// An Excel workbook read in the browser with SheetJS (loaded only when a workbook is opened),
// one tab per sheet. Charts and pivot visuals aren't drawn; the screenshot tab covers those.
function Sheet({ src }) {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [sheet, setSheet] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([import("xlsx"), fetch(src).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))])
      .then(([XLSX, data]) => {
        if (!alive) return;
        const wb = XLSX.read(data, { type: "array" });
        setBook({ XLSX, wb });
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [src]);

  if (error) return <p className="absolute inset-0 flex items-center justify-center p-6 text-[14px] text-ink-2">The workbook couldn&rsquo;t be opened. Try the download link.</p>;
  if (!book) return <p className="label absolute inset-0 flex items-center justify-center text-mute">Opening workbook…</p>;

  const { XLSX, wb } = book;
  const ws = wb.Sheets[wb.SheetNames[sheet]];
  // Show at most MAX_ROWS rows so very large sheets stay quick.
  let cut = false;
  if (ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    if (range.e.r - range.s.r + 1 > MAX_ROWS) {
      range.e.r = range.s.r + MAX_ROWS - 1;
      cut = true;
    }
    ws["!ref"] = XLSX.utils.encode_range(range);
  }
  const html = ws["!ref"] ? XLSX.utils.sheet_to_html(ws, { header: "", footer: "" }) : "";

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="xl-sheet min-h-0 flex-1 overflow-auto bg-paper p-3" dangerouslySetInnerHTML={{ __html: html || "<p>This sheet is empty.</p>" }} />
      <div className="label flex flex-wrap items-center gap-1 border-t border-line bg-paper-2 px-2 py-1.5">
        {wb.SheetNames.map((n, i) => (
          <button
            key={n}
            type="button"
            onClick={() => setSheet(i)}
            className={`px-3 py-1.5 ${i === sheet ? "bg-paper text-ink shadow-[0_0_0_1px_var(--color-line)]" : "text-mute hover:text-ink"}`}
          >
            {n}
          </button>
        ))}
        {cut && <span className="ml-auto px-2 text-mute">First {MAX_ROWS} rows shown</span>}
      </div>
    </div>
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
