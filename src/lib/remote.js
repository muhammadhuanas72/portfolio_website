// Read-only access to owner-uploaded content in Supabase. The public site uses plain
// fetch against the REST API (no SDK in the main bundle); writes happen only in /admin.html.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const remoteEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const BUCKETS = { resumes: "resumes", images: "project-images", files: "project-files" };

export const publicUrl = (bucket, path) =>
  path ? `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}` : null;

async function get(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`${table}: ${res.status}`);
  return res.json();
}

// Database rows -> the shape used by portfolioData.js
export const toProject = (row) => ({
  id: row.id,
  remote: true,
  category: row.category,
  year: row.year,
  title: row.title,
  subtitle: row.subtitle,
  details: row.details,
  features: row.features ?? [],
  tech: row.tech ?? [],
  demoUrl: row.demo_url || null,
  githubUrl: row.github_url || null,
  // An edited built-in project can keep its original image from public/ ("/work/...").
  image: row.image_path?.startsWith("/") ? row.image_path : publicUrl(BUCKETS.images, row.image_path),
  imagePath: row.image_path,
  file: publicUrl(BUCKETS.files, row.file_path),
  filePath: row.file_path,
  fileName: row.file_name,
  replaces: row.replaces,
});

export const toResume = (row) => ({
  slug: row.slug,
  label: row.label,
  url: publicUrl(BUCKETS.resumes, row.path),
  path: row.path,
  updatedAt: row.updated_at,
  remote: true,
});

// Built-in content + the owner's uploads, minus anything the owner has removed.
// A remote resume with a built-in slug replaces that file; other slugs are extra resumes.
export function mergeContent(base, remote) {
  if (!remote) return base;
  const hidden = new Set(remote.hidden.map((h) => `${h.kind}:${h.item_id}`));
  const builtInSlugs = new Set(base.resumes.map((r) => r.slug));
  const resumes = [
    ...base.resumes.map((r) => remote.resumes.find((x) => x.slug === r.slug) ?? r),
    ...remote.resumes.filter((r) => !builtInSlugs.has(r.slug)),
  ].filter((r) => !hidden.has(`resume:${r.slug}`));
  // An edited copy takes the built-in project's place; removals are keyed by the built-in id.
  const projects = [
    ...base.projects.map((p) => remote.projects.find((r) => r.replaces === p.id) ?? p),
    ...remote.projects.filter((r) => !r.replaces),
  ].filter((p) => !hidden.has(`project:${p.replaces ?? p.id}`));
  return { projects, resumes };
}

export async function fetchRemote() {
  if (!remoteEnabled) return null;
  try {
    const [projects, resumes, hidden] = await Promise.all([
      get("projects", "select=*&order=sort.asc,created_at.asc"),
      get("resumes", "select=*&order=created_at.asc"),
      get("hidden", "select=kind,item_id"),
    ]);
    return { projects: projects.map(toProject), resumes: resumes.map(toResume), hidden };
  } catch (err) {
    console.warn("Remote content unavailable, showing built-in content.", err);
    return null;
  }
}
