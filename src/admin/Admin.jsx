import { useCallback, useEffect, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { BUCKETS, remoteEnabled, toProject, toResume } from "../lib/remote";
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

function Projects() {
  const [rows, setRows] = useState([]);
  const [hidden, setHidden] = useState(new Set());
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

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

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setState({ error: true, message: "Give the project a title." });
    if (!isUrl(form.demo_url) || !isUrl(form.github_url)) {
      return setState({ error: true, message: "Links must start with http:// or https://" });
    }
    if (image && !LIMITS.imageTypes[image.type]) return setState({ error: true, message: "Images must be PNG, JPG or WebP." });
    if (image && image.size > LIMITS.imageBytes) return setState({ error: true, message: "Keep images under 4 MB." });

    setBusy(true);
    setState({ message: "Saving project…" });
    let image_path = null;
    if (image) {
      image_path = `${crypto.randomUUID()}.${LIMITS.imageTypes[image.type]}`;
      const up = await supabase.storage.from(BUCKETS.images).upload(image_path, image, { contentType: image.type });
      if (up.error) {
        setBusy(false);
        return setState({ error: true, message: up.error.message });
      }
    }

    const lines = (v) => v.split("\n").map((x) => x.trim()).filter(Boolean);
    const { error } = await supabase.from("projects").insert({
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      category: form.category,
      year: form.year.trim() || null,
      details: form.details.trim() || null,
      features: lines(form.features),
      tech: form.tech.split(",").map((x) => x.trim()).filter(Boolean),
      demo_url: form.demo_url.trim() || null,
      github_url: form.github_url.trim() || null,
      image_path,
    });
    setBusy(false);
    if (error) {
      if (image_path) await supabase.storage.from(BUCKETS.images).remove([image_path]);
      return setState({ error: true, message: error.message });
    }
    setForm(empty);
    setImage(null);
    e.target.reset();
    setState({ message: "Project added. It now appears on the site." });
    load();
  };

  // Added here: delete the row and its image. Built-in: hide it (it stays in projects.json).
  const remove = async (p) => {
    if (p.remote) {
      if (!window.confirm(`Delete “${p.title}” from the portfolio?`)) return;
      const { error } = await supabase.from("projects").delete().eq("id", p.id);
      if (error) return setState({ error: true, message: error.message });
      if (p.imagePath) await supabase.storage.from(BUCKETS.images).remove([p.imagePath]);
      setState({ message: `Deleted “${p.title}”.` });
    } else {
      if (!window.confirm(`Remove “${p.title}” from the site? You can restore it later.`)) return;
      const { error } = await hide("project", p.id);
      if (error) return setState({ error: true, message: error.message });
      setState({ message: `Removed “${p.title}” from the site.` });
    }
    load();
  };

  const restore = async (p) => {
    const { error } = await unhide("project", p.id);
    if (error) return setState({ error: true, message: error.message });
    setState({ message: `“${p.title}” is back on the site.` });
    load();
  };

  const all = [...portfolioData.projects, ...rows];

  return (
    <Section title="Projects" index="02">
      <p className="mt-3 text-[13px] text-ink-2">
        Every project on the site. Built-in ones (from <code>src/data/projects.json</code>) can be removed and restored; ones added below
        can be deleted.
      </p>

      <ul className="mt-4 border-t border-line">
        {all.map((p) => {
          const off = !p.remote && hidden.has(String(p.id));
          return (
            <li key={p.id} className={`flex items-center justify-between gap-4 border-b border-line py-3 ${off ? "opacity-60" : ""}`}>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {p.title}
                  {off && <span className="label ml-2 text-signal">Removed from site</span>}
                </p>
                <p className="label text-mute">
                  {p.category === "data" ? "Data & analytics" : "Web build"}
                  {p.year ? ` · ${p.year}` : ""} · {p.remote ? "Added here" : "Built-in"}
                </p>
              </div>
              {off ? (
                <button type="button" className="btn btn-signal shrink-0" onClick={() => restore(p)}>
                  <span>Restore</span>
                </button>
              ) : (
                <button type="button" className="btn shrink-0" onClick={() => remove(p)}>
                  <span>{p.remote ? "Delete" : "Remove"}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="label mt-8 text-mute">Add a project</p>
      <form onSubmit={submit} className="mt-3 grid gap-4 md:grid-cols-2">
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
          <span className="label text-mute">Live demo URL</span>
          <input type="url" value={form.demo_url} onChange={set("demo_url")} placeholder="https://" className={`${field} mt-1`} />
        </label>
        <label className="block">
          <span className="label text-mute">GitHub URL</span>
          <input type="url" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/…" className={`${field} mt-1`} />
        </label>
        <label className="block md:col-span-2">
          <span className="label text-mute">Screenshot (PNG, JPG or WebP, under 4 MB)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-[13px]"
          />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="btn btn-signal" disabled={busy}>
            <span>{busy ? "Saving…" : "Add project"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <Notice state={state} />
        </div>
      </form>
    </Section>
  );
}
