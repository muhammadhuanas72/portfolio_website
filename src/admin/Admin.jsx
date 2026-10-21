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

function Resumes() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("resumes").select("*");
    if (error) setState({ error: true, message: error.message });
    else setRows(data.map(toResume));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (slot, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") return setState({ error: true, message: "Resumes must be PDF files." });
    if (file.size > LIMITS.resumeBytes) return setState({ error: true, message: "Keep resumes under 5 MB." });

    setState({ message: `Uploading ${slot.label} resume…` });
    const previous = rows.find((r) => r.slug === slot.slug);
    const path = `${slot.slug}/${Date.now()}.pdf`;
    const up = await supabase.storage.from(BUCKETS.resumes).upload(path, file, { contentType: "application/pdf" });
    if (up.error) return setState({ error: true, message: up.error.message });

    const { error } = await supabase
      .from("resumes")
      .upsert({ slug: slot.slug, label: slot.label, path, updated_at: new Date().toISOString() });
    if (error) {
      await supabase.storage.from(BUCKETS.resumes).remove([path]);
      return setState({ error: true, message: error.message });
    }
    if (previous?.path) await supabase.storage.from(BUCKETS.resumes).remove([previous.path]);
    setState({ message: `${slot.label} resume updated. Visitors will see it on their next visit.` });
    load();
  };

  const revert = async (slot) => {
    const current = rows.find((r) => r.slug === slot.slug);
    if (!current) return;
    if (!window.confirm(`Remove the uploaded ${slot.label} resume and go back to the built-in file?`)) return;
    const { error } = await supabase.from("resumes").delete().eq("slug", slot.slug);
    if (error) return setState({ error: true, message: error.message });
    await supabase.storage.from(BUCKETS.resumes).remove([current.path]);
    setState({ message: `${slot.label} resume reverted to the built-in file.` });
    load();
  };

  return (
    <Section title="Resumes" index="01">
      <ul>
        {portfolioData.personalInfo.resumes.map((slot) => {
          const current = rows.find((r) => r.slug === slot.slug);
          return (
            <li key={slot.slug} className="grid gap-3 border-b border-line py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-[16px] font-semibold">{slot.label}</p>
                <p className="label mt-1 text-mute">
                  {current ? (
                    <>
                      Uploaded {new Date(current.updatedAt).toLocaleString()} ·{" "}
                      <a href={current.url} target="_blank" rel="noopener noreferrer" className="underline">
                        open
                      </a>
                    </>
                  ) : (
                    <>
                      Built-in file ·{" "}
                      <a href={slot.url} target="_blank" rel="noopener noreferrer" className="underline">
                        open
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="btn cursor-pointer">
                  <span>Upload new PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      upload(slot, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {current && (
                  <button type="button" className="btn" onClick={() => revert(slot)}>
                    <span>Revert</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Notice state={state} />
    </Section>
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
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: true });
    if (error) setState({ error: true, message: error.message });
    else setRows(data.map(toProject));
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

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.title}” from the portfolio?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) return setState({ error: true, message: error.message });
    if (p.imagePath) await supabase.storage.from(BUCKETS.images).remove([p.imagePath]);
    setState({ message: `Deleted “${p.title}”.` });
    load();
  };

  return (
    <Section title="Projects" index="02">
      <p className="mt-3 text-[13px] text-ink-2">
        Projects added here appear after the built-in ones ({portfolioData.projects.length}). Built-in projects are edited in{" "}
        <code>src/data/portfolioData.js</code>.
      </p>

      {rows.length > 0 && (
        <ul className="mt-4 border-t border-line">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 border-b border-line py-3">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="label text-mute">
                  {p.category === "data" ? "Data & analytics" : "Web build"}
                  {p.year ? ` · ${p.year}` : ""}
                </p>
              </div>
              <button type="button" className="btn" onClick={() => remove(p)}>
                <span>Delete</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
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
