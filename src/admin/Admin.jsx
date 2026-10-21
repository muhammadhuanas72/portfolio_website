import { useCallback, useEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { BUCKETS, remoteEnabled, toCertification, toExperience, toProject, toResume } from "../lib/remote";
import { builtInExperience } from "../lib/experience";
import { LIMITS, OWNER_EMAIL, supabase } from "./supabase";

const field = "w-full border border-line bg-paper px-3 py-2 text-[14px] outline-none focus:border-ink";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(!remoteEnabled);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const email = session?.user?.email?.toLowerCase();

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="label text-mute">[ Owner only ]</p>
          <h1 className="display mt-2 text-[40px]">Portfolio admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="label underline underline-offset-4">
            View site
          </a>
          {session && (
            <button type="button" className="btn" onClick={() => supabase.auth.signOut()}>
              <span>Sign out</span>
            </button>
          )}
        </div>
      </header>

      {!remoteEnabled && <SetupNotice />}
      {remoteEnabled && ready && !session && <SignIn />}
      {session && email !== OWNER_EMAIL && (
        <p className="mt-8 border border-ink p-4 text-[14px]">
          Signed in as {email}. This account can&rsquo;t edit the portfolio.
        </p>
      )}
      {session && email === OWNER_EMAIL && (
        <>
          <Resumes />
          <Projects />
          <Experience />
          <Certifications />
        </>
      )}
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mt-8 space-y-3 border border-ink p-5 text-[14px] leading-snug">
      <p className="font-semibold">Editing isn&rsquo;t connected yet.</p>
      <p>
        Create a Supabase project, run <code>supabase/schema.sql</code> in its SQL editor, then set{" "}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see <code>README.md</code>) and rebuild.
      </p>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  const send = async (e) => {
    e.preventDefault();
    setState({ status: "busy", message: "" });
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/admin.html` },
    });
    setState(
      error
        ? { status: "error", message: error.message }
        : { status: "sent", message: "Check your inbox for a sign-in link." }
    );
  };

  return (
    <form onSubmit={send} className="mt-10 max-w-md space-y-4">
      <p className="text-[14px] text-ink-2">Sign in with the owner&rsquo;s email. A one-time link will be sent there.</p>
      <label className="block">
        <span className="label text-mute">Email</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1`} />
      </label>
      <button type="submit" className="btn btn-signal" disabled={state.status === "busy"}>
        <span>{state.status === "busy" ? "Sending…" : "Send sign-in link"}</span>
        <span aria-hidden="true">→</span>
      </button>
      {state.message && (
        <p role="status" className={`text-[14px] ${state.status === "error" ? "font-semibold" : "text-ink-2"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function Section({ title, index, children }) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between border-b border-ink pb-2">
        <h2 className="display text-[24px]">{title}</h2>
        <span className="label text-mute">[{index}]</span>
      </div>
      {children}
    </section>
  );
}

function Notice({ state }) {
  if (!state?.message) return null;
  return (
    <p role="status" className={`mt-3 text-[13px] ${state.error ? "font-semibold" : "text-ink-2"}`}>
      {state.message}
    </p>
  );
}

/* ---------------- Resumes ---------------- */

// The owner's removals of built-in items, as a Set of ids for one kind.
async function loadHidden(kind) {
  const { data, error } = await supabase.from("hidden").select("item_id").eq("kind", kind);
  if (error) throw error;
  return new Set(data.map((r) => r.item_id));
}
const hide = (kind, id) => supabase.from("hidden").upsert({ kind, item_id: String(id) });
const unhide = (kind, id) => supabase.from("hidden").delete().eq("kind", kind).eq("item_id", String(id));

const slugify = (v) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "resume";

const pdfError = (file) =>
  file.type !== "application/pdf" ? "Resumes must be PDF files." : file.size > LIMITS.resumeBytes ? "Keep resumes under 5 MB." : null;

function Resumes() {
  const [rows, setRows] = useState([]);
  const [hidden, setHidden] = useState(new Set());
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ data, error }, h] = await Promise.all([
        supabase.from("resumes").select("*").order("created_at", { ascending: true }),
        loadHidden("resume"),
      ]);
      if (error) throw error;
      setRows(data.map(toResume));
      setHidden(h);
    } catch (err) {
      setState({ error: true, message: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const builtIn = portfolioData.personalInfo.resumes;
  const items = [
    ...builtIn.map((b) => ({ ...b, builtIn: true, upload: rows.find((r) => r.slug === b.slug) })),
    ...rows.filter((r) => !builtIn.some((b) => b.slug === r.slug)).map((r) => ({ ...r, builtIn: false, upload: r })),
  ];

  const run = async (message, fn) => {
    setBusy(true);
    setState({ message });
    try {
      const done = await fn();
      setState({ message: done });
    } catch (err) {
      setState({ error: true, message: err.message });
    }
    setBusy(false);
    load();
  };

  // Upload a PDF into a slot: replaces a built-in or extra resume, or creates a new one.
  const putPdf = async (slug, label, file, previousPath) => {
    const path = `${slug}/${Date.now()}.pdf`;
    const up = await supabase.storage.from(BUCKETS.resumes).upload(path, file, { contentType: "application/pdf" });
    if (up.error) throw up.error;
    const { error } = await supabase.from("resumes").upsert({ slug, label, path, updated_at: new Date().toISOString() });
    if (error) {
      await supabase.storage.from(BUCKETS.resumes).remove([path]);
      throw error;
    }
    if (previousPath) await supabase.storage.from(BUCKETS.resumes).remove([previousPath]);
  };

  const replace = (item, file) => {
    if (!file) return;
    const bad = pdfError(file);
    if (bad) return setState({ error: true, message: bad });
    run(`Uploading the new ${item.label} resume…`, async () => {
      await putPdf(item.slug, item.label, file, item.upload?.path);
      if (hidden.has(item.slug)) await unhide("resume", item.slug);
      return `${item.label} resume replaced. Visitors get the new file on their next visit.`;
    });
  };

  const add = (label, file) => {
    const fail = (message) => {
      setState({ error: true, message });
      return false;
    };
    const name = label.trim();
    if (!name) return fail("Give the new resume a name, e.g. “Frontend Developer”.");
    if (name.length > 60) return fail("Keep the name under 60 characters.");
    if (!file) return fail("Choose a PDF for the new resume.");
    const bad = pdfError(file);
    if (bad) return fail(bad);
    run(`Adding the ${name} resume…`, async () => {
      await putPdf(`${slugify(name)}-${Date.now().toString(36)}`, name, file);
      return `${name} resume added. It now appears in the resume menus.`;
    });
    return true;
  };

  // Built-in: hide it (its file stays in the code). Uploaded extra: delete it and its file.
  const remove = (item) => {
    if (item.builtIn) {
      if (!window.confirm(`Remove the ${item.label} resume from the site? You can restore it later.`)) return;
      run(`Removing ${item.label}…`, async () => {
        const { error } = await hide("resume", item.slug);
        if (error) throw error;
        return `${item.label} resume removed from the site.`;
      });
    } else {
      if (!window.confirm(`Delete the ${item.label} resume? This deletes the uploaded file.`)) return;
      run(`Deleting ${item.label}…`, async () => {
        const { error } = await supabase.from("resumes").delete().eq("slug", item.slug);
        if (error) throw error;
        await supabase.storage.from(BUCKETS.resumes).remove([item.path]);
        return `${item.label} resume deleted.`;
      });
    }
  };

  const restore = (item) =>
    run(`Restoring ${item.label}…`, async () => {
      const { error } = await unhide("resume", item.slug);
      if (error) throw error;
      return `${item.label} resume is back on the site.`;
    });

  // Built-in with an upload: drop the upload and go back to the file in the code.
  const revert = (item) => {
    if (!window.confirm(`Go back to the original ${item.label} resume? The uploaded file is deleted.`)) return;
    run(`Reverting ${item.label}…`, async () => {
      const { error } = await supabase.from("resumes").delete().eq("slug", item.slug);
      if (error) throw error;
      await supabase.storage.from(BUCKETS.resumes).remove([item.upload.path]);
      return `${item.label} resume reverted to the original file.`;
    });
  };

  return (
    <Section title="Resumes" index="01">
      <ul>
        {items.map((item) => {
          const off = item.builtIn && hidden.has(item.slug);
          const file = item.upload ?? item;
          return (
            <li key={item.slug} className={`grid gap-3 border-b border-line py-4 md:grid-cols-[1fr_auto] md:items-center ${off ? "opacity-60" : ""}`}>
              <div>
                <p className="text-[16px] font-semibold">
                  {item.label}
                  {off && <span className="label ml-2 text-signal">Removed from site</span>}
                </p>
                <p className="label mt-1 text-mute">
                  {item.upload ? `Uploaded ${new Date(item.upload.updatedAt).toLocaleString()}` : "Original file"} ·{" "}
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline">
                    open
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className={`btn cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
                  <span>Replace PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      replace(item, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {item.builtIn && item.upload && (
                  <button type="button" className="btn" disabled={busy} onClick={() => revert(item)}>
                    <span>Use original</span>
                  </button>
                )}
                {off ? (
                  <button type="button" className="btn btn-signal" disabled={busy} onClick={() => restore(item)}>
                    <span>Restore</span>
                  </button>
                ) : (
                  <button type="button" className="btn" disabled={busy} onClick={() => remove(item)}>
                    <span>{item.builtIn ? "Remove" : "Delete"}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <AddResume busy={busy} onAdd={add} />
      <Notice state={state} />
    </Section>
  );
}

function AddResume({ busy, onAdd }) {
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (onAdd(label, file)) {
      setLabel("");
      setFile(null);
      e.target.reset();
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 border border-line p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <p className="label text-mute md:col-span-3">Add another resume</p>
      <label className="block">
        <span className="label text-mute">Name shown on the site</span>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Frontend Developer" className={`${field} mt-1`} />
      </label>
      <label className="block">
        <span className="label text-mute">PDF, under 5 MB</span>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-[13px]" />
      </label>
      <button type="submit" className="btn btn-signal" disabled={busy}>
        <span>Add resume</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

/* ---------------- Projects ---------------- */

const empty = {
  title: "",
  subtitle: "",
  category: "web",
  year: String(new Date().getFullYear()),
  details: "",
  features: "",
  tech: "",
  demo_url: "",
  github_url: "",
};

const isUrl = (v) => !v || /^https?:\/\/\S+$/i.test(v);
const lines = (v) => v.split("\n").map((x) => x.trim()).filter(Boolean);

// Project files visitors can download. Power BI files have no registered type, so they go up as binary.
const FILE_TYPES = {
  pbix: "application/octet-stream",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  pdf: "application/pdf",
  zip: "application/zip",
};
const FILE_BYTES = 50 * 1024 * 1024;
const extOf = (name) => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");

// A project (built-in or from the database) -> the form's string fields.
const toForm = (p) => ({
  title: p.title ?? "",
  subtitle: p.subtitle ?? "",
  category: p.category === "data" ? "data" : "web",
  year: p.year ?? "",
  details: p.details ?? "",
  features: (p.features ?? []).join("\n"),
  tech: (p.tech ?? []).join(", "),
  demo_url: p.demoUrl ?? "",
  github_url: p.githubUrl ?? "",
});

// Storage paths only; built-in images ("/work/...") live in the code and are never deleted.
const stored = (path) => (path && !path.startsWith("/") ? path : null);

function Projects() {
  const [rows, setRows] = useState([]);
  const [hidden, setHidden] = useState(new Set());
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [dropFile, setDropFile] = useState(false);
  // { base, current }: base is the built-in project (or null), current is what the site shows.
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [{ data, error }, h] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: true }),
        loadHidden("project"),
      ]);
      if (error) throw error;
      setRows(data.map(toProject));
      setHidden(h);
    } catch (err) {
      setState({ error: true, message: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const items = [
    ...portfolioData.projects.map((b) => {
      const edit = rows.find((r) => r.replaces === b.id);
      return { base: b, current: edit ?? b, edited: Boolean(edit) };
    }),
    ...rows.filter((r) => !r.replaces).map((r) => ({ base: null, current: r, edited: false })),
  ];

  const resetForm = () => {
    setForm(empty);
    setImage(null);
    setFile(null);
    setDropFile(false);
    setEditing(null);
    setFormKey((k) => k + 1); // clears the file inputs
  };

  const startEdit = (item) => {
    resetForm();
    setEditing(item);
    setForm(toForm(item.current));
    setState({ message: `Editing “${item.current.title}”. Change anything, add a screenshot or file, then save.` });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const upload = async (bucket, f, contentType) => {
    const path = `${crypto.randomUUID()}.${extOf(f.name) || "bin"}`;
    const up = await supabase.storage.from(bucket).upload(path, f, { contentType });
    if (up.error) throw up.error;
    return path;
  };

  const submit = async (e) => {
    e.preventDefault();
    const fail = (message) => setState({ error: true, message });
    if (!form.title.trim()) return fail("Give the project a title.");
    if (!isUrl(form.demo_url) || !isUrl(form.github_url)) return fail("Links must start with http:// or https://");
    if (image && !LIMITS.imageTypes[image.type]) return fail("Images must be PNG, JPG or WebP.");
    if (image && image.size > LIMITS.imageBytes) return fail("Keep images under 4 MB.");
    if (file && !FILE_TYPES[extOf(file.name)]) return fail("Project files can be .pbix, .xlsx, .xls, .csv, .pdf or .zip.");
    if (file && file.size > FILE_BYTES) return fail("Keep project files under 50 MB.");

    setBusy(true);
    setState({ message: file ? `Uploading ${file.name}…` : "Saving project…" });
    const fresh = [];
    try {
      const imagePath = image ? await upload(BUCKETS.images, image, image.type) : null;
      if (imagePath) fresh.push([BUCKETS.images, imagePath]);
      const filePath = file ? await upload(BUCKETS.files, file, FILE_TYPES[extOf(file.name)]) : null;
      if (filePath) fresh.push([BUCKETS.files, filePath]);

      const cur = editing?.current;
      const keepFile = !dropFile && !filePath;
      const fields = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        category: form.category,
        year: form.year.trim() || null,
        details: form.details.trim() || null,
        features: lines(form.features),
        tech: form.tech.split(",").map((x) => x.trim()).filter(Boolean),
        demo_url: form.demo_url.trim() || null,
        github_url: form.github_url.trim() || null,
        image_path: imagePath ?? (cur ? (cur.remote ? cur.imagePath : cur.image) ?? null : null),
        file_path: filePath ?? (keepFile ? cur?.filePath ?? null : null),
        file_name: file ? file.name : keepFile ? cur?.fileName ?? null : null,
      };

      let error;
      if (cur?.remote) ({ error } = await supabase.from("projects").update(fields).eq("id", cur.id));
      else ({ error } = await supabase.from("projects").insert({ ...fields, replaces: editing?.base?.id ?? null }));
      if (error) throw error;

      // Files the saved row no longer points at.
      if (cur?.remote) {
        const old = [];
        if (imagePath && stored(cur.imagePath)) old.push([BUCKETS.images, cur.imagePath]);
        if ((filePath || dropFile) && cur.filePath) old.push([BUCKETS.files, cur.filePath]);
        for (const [bucket, path] of old) await supabase.storage.from(bucket).remove([path]);
      }

      setState({ message: `“${fields.title}” ${editing ? "updated" : "added"}. It now shows on the site.` });
      resetForm();
      load();
    } catch (err) {
      for (const [bucket, path] of fresh) await supabase.storage.from(bucket).remove([path]);
      setState({ error: true, message: err.message });
    }
    setBusy(false);
  };

  // Delete a database row and the files only it uses.
  const dropRow = async (p) => {
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) throw error;
    if (stored(p.imagePath)) await supabase.storage.from(BUCKETS.images).remove([p.imagePath]);
    if (p.filePath) await supabase.storage.from(BUCKETS.files).remove([p.filePath]);
  };

  const act = async (confirmText, fn, done) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await fn();
      setState({ message: done });
      if (editing) resetForm();
      load();
    } catch (err) {
      setState({ error: true, message: err.message });
    }
  };

  return (
    <Section title="Projects" index="02">
      <p className="mt-3 text-[13px] text-ink-2">
        Every project on the site. <strong>Edit</strong> changes any of them, including adding a screenshot or a Power BI / Excel file
        visitors can download. Built-in projects can be removed and restored; ones you added can be deleted.
      </p>

      <ul className="mt-4 border-t border-line">
        {items.map((item) => {
          const { base, current: p } = item;
          const off = base && hidden.has(String(base.id));
          return (
            <li key={base?.id ?? p.id} className={`flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 ${off ? "opacity-60" : ""}`}>
              <div className="min-w-0">
                <p className="font-semibold">
                  {p.title}
                  {off && <span className="label ml-2 text-signal">Removed from site</span>}
                </p>
                <p className="label text-mute">
                  {p.category === "data" ? "Data & analytics" : "Web build"}
                  {p.year ? ` · ${p.year}` : ""} · {base ? (item.edited ? "Built-in, edited" : "Built-in") : "Added here"}
                  {p.image ? " · Image" : ""}
                  {p.fileName ? ` · File: ${p.fileName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn" disabled={busy} onClick={() => startEdit(item)}>
                  <span>Edit</span>
                </button>
                {item.edited && (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() => act(`Undo your edits to “${base.title}”? Its uploaded image and file are deleted.`, () => dropRow(p), `“${base.title}” is back to the original.`)}
                  >
                    <span>Use original</span>
                  </button>
                )}
                {base && off && (
                  <button type="button" className="btn btn-signal" disabled={busy} onClick={() => act(null, async () => {
                    const { error } = await unhide("project", base.id);
                    if (error) throw error;
                  }, `“${p.title}” is back on the site.`)}>
                    <span>Restore</span>
                  </button>
                )}
                {base && !off && (
                  <button type="button" className="btn" disabled={busy} onClick={() => act(`Remove “${p.title}” from the site? You can restore it later.`, async () => {
                    const { error } = await hide("project", base.id);
                    if (error) throw error;
                  }, `Removed “${p.title}” from the site.`)}>
                    <span>Remove</span>
                  </button>
                )}
                {!base && (
                  <button type="button" className="btn" disabled={busy} onClick={() => act(`Delete “${p.title}” from the portfolio? Its image and file are deleted too.`, () => dropRow(p), `Deleted “${p.title}”.`)}>
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={formRef} className="mt-8 flex scroll-mt-6 items-baseline justify-between gap-4">
        <p className="label text-mute">{editing ? `Editing: ${editing.current.title}` : "Add a project"}</p>
        {editing && (
          <button type="button" className="label underline underline-offset-4" onClick={() => { resetForm(); setState(null); }}>
            Cancel editing
          </button>
        )}
      </div>
      <form key={formKey} onSubmit={submit} className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="label text-mute">Title *</span>
          <input required value={form.title} onChange={set("title")} className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Subtitle</span>
          <input value={form.subtitle} onChange={set("subtitle")} placeholder="e.g. Power BI Dashboard" className={`${field} mt-1`} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label text-mute">Category</span>
            <select value={form.category} onChange={set("category")} className={`${field} mt-1`}>
              <option value="web">Web build</option>
              <option value="data">Data &amp; analytics</option>
            </select>
          </label>
          <label className="block">
            <span className="label text-mute">Year</span>
            <input value={form.year} onChange={set("year")} inputMode="numeric" className={`${field} mt-1`} />
          </label>
        </div>
        <label className="block md:col-span-2">
          <span className="label text-mute">Description</span>
          <textarea rows={3} value={form.details} onChange={set("details")} className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Highlights — one per line</span>
          <textarea rows={4} value={form.features} onChange={set("features")} className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Tech — comma separated</span>
          <input value={form.tech} onChange={set("tech")} placeholder="Power BI, DAX, SQL" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Live demo URL · for Power BI, the “Publish to web” link</span>
          <input type="url" value={form.demo_url} onChange={set("demo_url")} placeholder="https://" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">GitHub URL</span>
          <input type="url" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/…" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Screenshot (PNG, JPG or WebP, under 4 MB)</span>
          {editing?.current.image && !image && <span className="mt-1 block text-[12px] text-ink-2">Keeps the current image unless you choose a new one.</span>}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-[13px]"
          />
        </label>
        <div className="block">
          <label className="block">
            <span className="label text-mute">Project file (.pbix, .xlsx, .xls, .csv, .pdf, .zip, under 50 MB)</span>
            <span className="mt-1 block text-[12px] text-ink-2">
              Visitors press View: Excel and PDF files open on the page; for .pbix they see the screenshot.
            </span>
            <input
              type="file"
              accept=".pbix,.xlsx,.xls,.csv,.pdf,.zip"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setDropFile(false);
              }}
              className="mt-1 block w-full text-[13px]"
            />
          </label>
          {editing?.current.fileName && !file && (
            <label className="mt-2 flex items-center gap-2 text-[12px] text-ink-2">
              <input type="checkbox" checked={dropFile} onChange={(e) => setDropFile(e.target.checked)} />
              Remove the current file ({editing.current.fileName})
            </label>
          )}
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-signal" disabled={busy}>
            <span>{busy ? "Saving…" : editing ? "Save changes" : "Add project"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <Notice state={state} />
        </div>
      </form>
    </Section>
  );
}

/* ---------------- Experience & education ---------------- */

const KINDS = ["Internship", "Full-time", "Part-time", "Freelance", "Education"];
const emptyExp = { kind: "Internship", title: "", org: "", location: "", period: "", summary: "", points: "", position: "5" };

const expToForm = (e) => ({
  kind: e.kind ?? "Internship",
  title: e.title ?? "",
  org: e.org ?? "",
  location: e.location ?? "",
  period: e.period ?? "",
  summary: e.summary ?? "",
  points: (e.points ?? []).join("\n"),
  position: String(e.position ?? 0),
});

function Experience() {
  const [rows, setRows] = useState([]);
  const [hidden, setHidden] = useState(new Set());
  const [form, setForm] = useState(emptyExp);
  const [editing, setEditing] = useState(null); // { base, current }
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [{ data, error }, h] = await Promise.all([
        supabase.from("experience").select("*").order("created_at", { ascending: true }),
        loadHidden("experience"),
      ]);
      if (error) throw error;
      setRows(data.map(toExperience));
      setHidden(h);
    } catch (err) {
      setState({ error: true, message: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Same order as the site: by position, built-in entries replaced by their edited copies.
  const items = [
    ...builtInExperience.map((b) => {
      const edit = rows.find((r) => r.replaces === b.id);
      return { base: b, current: edit ?? b, edited: Boolean(edit) };
    }),
    ...rows.filter((r) => !r.replaces).map((r) => ({ base: null, current: r, edited: false })),
  ].sort((a, b) => a.current.position - b.current.position);

  const resetForm = () => {
    setForm(emptyExp);
    setEditing(null);
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm(expToForm(item.current));
    setState({ message: `Editing “${item.current.title}”.` });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fieldsOf = (f) => ({
    kind: f.kind.trim() || "Internship",
    title: f.title.trim(),
    org: f.org.trim() || null,
    location: f.location.trim() || null,
    period: f.period.trim() || null,
    summary: f.summary.trim() || null,
    points: lines(f.points),
    position: Number.parseInt(f.position, 10) || 0,
  });

  // Save `fields` for an item: update its row, or create one (a copy that replaces a built-in).
  const saveItem = async (item, fields) => {
    const cur = item?.current;
    const { error } = cur?.remote
      ? await supabase.from("experience").update(fields).eq("id", cur.id)
      : await supabase.from("experience").insert({ ...fields, replaces: item?.base?.id ?? null });
    if (error) throw error;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setState({ error: true, message: "Give the entry a title, e.g. “Frontend Developer”." });
    setBusy(true);
    try {
      const fields = fieldsOf(form);
      await saveItem(editing, fields);
      setState({ message: `“${fields.title}” ${editing ? "updated" : "added"}. It now shows on the site.` });
      resetForm();
      load();
    } catch (err) {
      setState({ error: true, message: err.message });
    }
    setBusy(false);
  };

  const act = async (confirmText, fn, done) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    try {
      await fn();
      setState({ message: done });
      if (editing) resetForm();
      load();
    } catch (err) {
      setState({ error: true, message: err.message });
    }
    setBusy(false);
  };

  // Swap positions with the neighbour above or below.
  const move = (i, dir) => {
    const a = items[i];
    const b = items[i + dir];
    if (!b) return;
    const pa = a.current.position;
    const pb = b.current.position === pa ? pa + dir : b.current.position;
    act(
      null,
      async () => {
        await saveItem(a, { ...fieldsOf(expToForm(a.current)), position: pb });
        await saveItem(b, { ...fieldsOf(expToForm(b.current)), position: pa });
      },
      `Moved “${a.current.title}” ${dir < 0 ? "up" : "down"}.`
    );
  };

  const dropRow = async (row) => {
    const { error } = await supabase.from("experience").delete().eq("id", row.id);
    if (error) throw error;
  };

  return (
    <Section title="Experience & education" index="03">
      <p className="mt-3 text-[13px] text-ink-2">
        The timeline in “Where I learned to build”, top to bottom. Add a new role or course, edit any entry, reorder with the arrows, and
        remove or restore the built-in ones.
      </p>

      <ul className="mt-4 border-t border-line">
        {items.map((item, i) => {
          const { base, current: e } = item;
          const off = base && hidden.has(String(base.id));
          return (
            <li key={base?.id ?? e.id} className={`flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 ${off ? "opacity-60" : ""}`}>
              <div className="min-w-0">
                <p className="font-semibold">
                  {e.title}
                  {off && <span className="label ml-2 text-signal">Removed from site</span>}
                </p>
                <p className="label text-mute">
                  {[e.kind, e.org, e.period].filter(Boolean).join(" · ")} · {base ? (item.edited ? "Built-in, edited" : "Built-in") : "Added here"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${e.title} up`}>
                  <span>↑</span>
                </button>
                <button type="button" className="btn" disabled={busy || i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${e.title} down`}>
                  <span>↓</span>
                </button>
                <button type="button" className="btn" disabled={busy} onClick={() => startEdit(item)}>
                  <span>Edit</span>
                </button>
                {item.edited && (
                  <button type="button" className="btn" disabled={busy} onClick={() => act(`Undo your edits to “${base.title}”?`, () => dropRow(e), `“${base.title}” is back to the original.`)}>
                    <span>Use original</span>
                  </button>
                )}
                {base && off && (
                  <button
                    type="button"
                    className="btn btn-signal"
                    disabled={busy}
                    onClick={() =>
                      act(null, async () => {
                        const { error } = await unhide("experience", base.id);
                        if (error) throw error;
                      }, `“${e.title}” is back on the site.`)
                    }
                  >
                    <span>Restore</span>
                  </button>
                )}
                {base && !off && (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      act(`Remove “${e.title}” from the site? You can restore it later.`, async () => {
                        const { error } = await hide("experience", base.id);
                        if (error) throw error;
                      }, `Removed “${e.title}” from the site.`)
                    }
                  >
                    <span>Remove</span>
                  </button>
                )}
                {!base && (
                  <button type="button" className="btn" disabled={busy} onClick={() => act(`Delete “${e.title}”?`, () => dropRow(e), `Deleted “${e.title}”.`)}>
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={formRef} className="mt-8 flex scroll-mt-6 items-baseline justify-between gap-4">
        <p className="label text-mute">{editing ? `Editing: ${editing.current.title}` : "Add an entry"}</p>
        {editing && (
          <button
            type="button"
            className="label underline underline-offset-4"
            onClick={() => {
              resetForm();
              setState(null);
            }}
          >
            Cancel editing
          </button>
        )}
      </div>
      <form onSubmit={submit} className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label text-mute">Type</span>
          <input list="exp-kinds" value={form.kind} onChange={set("kind")} className={`${field} mt-1`} />
          <datalist id="exp-kinds">
            {KINDS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="label text-mute">Order (lower shows first)</span>
          <input value={form.position} onChange={set("position")} inputMode="numeric" className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Title * (role, or course for education)</span>
          <input required value={form.title} onChange={set("title")} placeholder="e.g. Frontend Developer" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Company / institution</span>
          <input value={form.org} onChange={set("org")} className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Location</span>
          <input value={form.location} onChange={set("location")} placeholder="e.g. Remote or Chennai" className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Period</span>
          <input value={form.period} onChange={set("period")} placeholder="e.g. Jan 2026 – Present" className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Summary</span>
          <textarea rows={2} value={form.summary} onChange={set("summary")} className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Highlights — one per line</span>
          <textarea rows={4} value={form.points} onChange={set("points")} className={`${field} mt-1`} />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-signal" disabled={busy}>
            <span>{busy ? "Saving…" : editing ? "Save changes" : "Add entry"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <Notice state={state} />
        </div>
      </form>
    </Section>
  );
}

/* ---------------- Certifications ---------------- */

const emptyCert = { title: "", issuer: "", date: "", description: "", link: "" };
const CERT_TYPES = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
const CERT_BYTES = 10 * 1024 * 1024;

const certToForm = (c) => ({
  title: c.title ?? "",
  issuer: c.issuer ?? "",
  date: c.date ?? "",
  description: c.description ?? "",
  link: c.link && c.link !== "#" ? c.link : "",
});

function Certifications() {
  const [rows, setRows] = useState([]);
  const [hidden, setHidden] = useState(new Set());
  const [form, setForm] = useState(emptyCert);
  const [file, setFile] = useState(null);
  const [dropFile, setDropFile] = useState(false);
  const [editing, setEditing] = useState(null); // { base, current }
  const [formKey, setFormKey] = useState(0);
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [{ data, error }, h] = await Promise.all([
        supabase.from("certifications").select("*").order("created_at", { ascending: true }),
        loadHidden("certification"),
      ]);
      if (error) throw error;
      setRows(data.map(toCertification));
      setHidden(h);
    } catch (err) {
      setState({ error: true, message: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const items = [
    ...portfolioData.certifications.map((b) => {
      const edit = rows.find((r) => r.replaces === b.id);
      return { base: b, current: edit ?? b, edited: Boolean(edit) };
    }),
    ...rows.filter((r) => !r.replaces).map((r) => ({ base: null, current: r, edited: false })),
  ];

  const resetForm = () => {
    setForm(emptyCert);
    setFile(null);
    setDropFile(false);
    setEditing(null);
    setFormKey((k) => k + 1);
  };

  const startEdit = (item) => {
    resetForm();
    setEditing(item);
    setForm(certToForm(item.current));
    setState({ message: `Editing “${item.current.title}”.` });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const fail = (message) => setState({ error: true, message });
    if (!form.title.trim()) return fail("Give the certificate a title.");
    if (!isUrl(form.link.trim())) return fail("The credential link must start with http:// or https://");
    if (file && !CERT_TYPES[extOf(file.name)]) return fail("Certificate files can be PDF, PNG, JPG or WebP.");
    if (file && file.size > CERT_BYTES) return fail("Keep certificate files under 10 MB.");

    setBusy(true);
    setState({ message: "Saving certificate…" });
    let uploaded = null;
    try {
      if (file) {
        uploaded = `${crypto.randomUUID()}.${extOf(file.name)}`;
        const up = await supabase.storage.from(BUCKETS.certificates).upload(uploaded, file, { contentType: CERT_TYPES[extOf(file.name)] });
        if (up.error) throw up.error;
      }
      const cur = editing?.current;
      const keepFile = !dropFile && !uploaded;
      const fields = {
        title: form.title.trim(),
        issuer: form.issuer.trim() || null,
        date: form.date.trim() || null,
        description: form.description.trim() || null,
        link: form.link.trim() || null,
        file_path: uploaded ?? (keepFile ? cur?.filePath ?? null : null),
        file_name: file ? file.name : keepFile ? cur?.fileName ?? null : null,
      };
      let error;
      if (cur?.remote) ({ error } = await supabase.from("certifications").update(fields).eq("id", cur.id));
      else ({ error } = await supabase.from("certifications").insert({ ...fields, replaces: editing?.base?.id ?? null }));
      if (error) throw error;
      if (cur?.remote && cur.filePath && (uploaded || dropFile)) await supabase.storage.from(BUCKETS.certificates).remove([cur.filePath]);

      setState({ message: `“${fields.title}” ${editing ? "updated" : "added"}. It now shows on the site.` });
      resetForm();
      load();
    } catch (err) {
      if (uploaded) await supabase.storage.from(BUCKETS.certificates).remove([uploaded]);
      setState({ error: true, message: err.message });
    }
    setBusy(false);
  };

  const dropRow = async (c) => {
    const { error } = await supabase.from("certifications").delete().eq("id", c.id);
    if (error) throw error;
    if (c.filePath) await supabase.storage.from(BUCKETS.certificates).remove([c.filePath]);
  };

  const act = async (confirmText, fn, done) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await fn();
      setState({ message: done });
      if (editing) resetForm();
      load();
    } catch (err) {
      setState({ error: true, message: err.message });
    }
  };

  return (
    <Section title="Certifications" index="04">
      <p className="mt-3 text-[13px] text-ink-2">
        Every certificate in “Always learning”. Add new ones with a credential link or the certificate itself (PDF or image); visitors get a
        “View certificate” link. Built-in ones can be edited, removed and restored.
      </p>

      <ul className="mt-4 border-t border-line">
        {items.map((item) => {
          const { base, current: c } = item;
          const off = base && hidden.has(String(base.id));
          return (
            <li key={base?.id ?? c.id} className={`flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 ${off ? "opacity-60" : ""}`}>
              <div className="min-w-0">
                <p className="font-semibold">
                  {c.title}
                  {off && <span className="label ml-2 text-signal">Removed from site</span>}
                </p>
                <p className="label text-mute">
                  {[c.issuer, c.date].filter(Boolean).join(" · ")} · {base ? (item.edited ? "Built-in, edited" : "Built-in") : "Added here"}
                  {c.fileName ? ` · File: ${c.fileName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn" disabled={busy} onClick={() => startEdit(item)}>
                  <span>Edit</span>
                </button>
                {item.edited && (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() => act(`Undo your edits to “${base.title}”?`, () => dropRow(c), `“${base.title}” is back to the original.`)}
                  >
                    <span>Use original</span>
                  </button>
                )}
                {base && off && (
                  <button
                    type="button"
                    className="btn btn-signal"
                    disabled={busy}
                    onClick={() =>
                      act(null, async () => {
                        const { error } = await unhide("certification", base.id);
                        if (error) throw error;
                      }, `“${c.title}” is back on the site.`)
                    }
                  >
                    <span>Restore</span>
                  </button>
                )}
                {base && !off && (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() =>
                      act(`Remove “${c.title}” from the site? You can restore it later.`, async () => {
                        const { error } = await hide("certification", base.id);
                        if (error) throw error;
                      }, `Removed “${c.title}” from the site.`)
                    }
                  >
                    <span>Remove</span>
                  </button>
                )}
                {!base && (
                  <button
                    type="button"
                    className="btn"
                    disabled={busy}
                    onClick={() => act(`Delete “${c.title}”? Its uploaded file is deleted too.`, () => dropRow(c), `Deleted “${c.title}”.`)}
                  >
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={formRef} className="mt-8 flex scroll-mt-6 items-baseline justify-between gap-4">
        <p className="label text-mute">{editing ? `Editing: ${editing.current.title}` : "Add a certificate"}</p>
        {editing && (
          <button
            type="button"
            className="label underline underline-offset-4"
            onClick={() => {
              resetForm();
              setState(null);
            }}
          >
            Cancel editing
          </button>
        )}
      </div>
      <form key={formKey} onSubmit={submit} className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="label text-mute">Title *</span>
          <input required value={form.title} onChange={set("title")} placeholder="e.g. Google Data Analytics" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Issued by</span>
          <input value={form.issuer} onChange={set("issuer")} placeholder="e.g. Google · Coursera" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Date</span>
          <input value={form.date} onChange={set("date")} placeholder="e.g. 2025 or Mar 2025" className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">What you learned</span>
          <textarea rows={3} value={form.description} onChange={set("description")} className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">Credential link</span>
          <input type="url" value={form.link} onChange={set("link")} placeholder="https://…" className={`${field} mt-1`} />
        </label>
        <div className="block">
          <label className="block">
            <span className="label text-mute">Certificate file (PDF, PNG, JPG or WebP, under 10 MB)</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setDropFile(false);
              }}
              className="mt-1 block w-full text-[13px]"
            />
          </label>
          {editing?.current.fileName && !file && (
            <label className="mt-2 flex items-center gap-2 text-[12px] text-ink-2">
              <input type="checkbox" checked={dropFile} onChange={(e) => setDropFile(e.target.checked)} />
              Remove the current file ({editing.current.fileName})
            </label>
          )}
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-signal" disabled={busy}>
            <span>{busy ? "Saving…" : editing ? "Save changes" : "Add certificate"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <Notice state={state} />
        </div>
      </form>
    </Section>
  );
}
