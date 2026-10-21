// Owner-only: read a live website (and its GitHub repo), let Claude work out what kind of
// project it is, and return a draft portfolio entry plus a cover screenshot saved to storage.
//
// Secrets (npx supabase secrets set ...):
//   ANTHROPIC_API_KEY   required
//   OWNER_EMAIL         required, the only account allowed to call this
//   GITHUB_TOKEN        optional, lifts GitHub's 60-requests-an-hour anonymous limit
//   MICROLINK_API_KEY   optional, for more than Microlink's free daily screenshots
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "claude-opus-5-5";
const BUCKET = "project-images";
const PAGE_TEXT_LIMIT = 20_000;
const FILE_LIMIT = 8_000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Started only when run as the function (tests import the helpers below).
if (import.meta.main) Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Use POST." });

  // Only the owner. The platform has already verified the JWT; this checks whose it is.
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: auth } = await supabase.auth.getUser();
  const owner = (Deno.env.get("OWNER_EMAIL") ?? "").toLowerCase();
  if (!owner || auth.user?.email?.toLowerCase() !== owner) return reply(403, { error: "Only the portfolio owner can do this." });

  let body: { url?: string; github?: string };
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "Send JSON: { url, github? }" });
  }
  const url = body.url?.trim() ?? "";
  const github = body.github?.trim() || null;
  if (!/^https?:\/\/\S+$/i.test(url)) return reply(400, { error: "The live link must start with http:// or https://" });
  if (github && !/github\.com\/[^/]+\/[^/#?]+/i.test(github)) return reply(400, { error: "The GitHub link should look like https://github.com/user/repo" });

  try {
    const [page, repo] = await Promise.all([readPage(url), github ? readRepo(github) : Promise.resolve(null)]);
    const draft = await analyse(url, page, repo);

    let image_path: string | null = null;
    if (page.screenshot) {
      const img = await fetch(page.screenshot);
      if (img.ok) {
        image_path = `${crypto.randomUUID()}.jpg`;
        const up = await supabase.storage
          .from(BUCKET)
          .upload(image_path, new Uint8Array(await img.arrayBuffer()), { contentType: "image/jpeg" });
        if (up.error) image_path = null;
      }
    }

    return reply(200, {
      draft: {
        ...draft,
        year: repo?.created_at?.slice(0, 4) ?? String(new Date().getFullYear()),
        demo_url: url,
        github_url: github,
      },
      image_path,
      notes: [
        !page.screenshot && "No screenshot could be taken; add one yourself.",
        !page.rendered && "The site's text was read without running its scripts, so the draft may be thin.",
        github && !repo && "The GitHub repo could not be read (private or rate-limited).",
      ].filter(Boolean),
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Anthropic.RateLimitError) return reply(429, { error: "The AI is busy. Try again in a minute." });
    if (err instanceof Anthropic.AuthenticationError) return reply(500, { error: "ANTHROPIC_API_KEY is missing or invalid." });
    if (err instanceof Anthropic.APIError) return reply(502, { error: `AI request failed (${err.status}).` });
    return reply(500, { error: err instanceof Error ? err.message : "Something went wrong." });
  }
});

// ---------------------------------------------------------------- the live site

type Page = { title: string; description: string; text: string; screenshot: string | null; rendered: boolean };

// Microlink renders the page in a real browser, so single-page apps (React, Vite) return
// their actual text, and it takes the 1600 x 724 cover in the same request.
export async function readPage(url: string): Promise<Page> {
  const key = Deno.env.get("MICROLINK_API_KEY");
  const api = new URL(key ? "https://pro.microlink.io/" : "https://api.microlink.io/");
  const params: Record<string, string> = {
    url,
    meta: "true",
    screenshot: "true",
    "screenshot.type": "jpeg",
    "viewport.width": "1600",
    "viewport.height": "724",
    "viewport.deviceScaleFactor": "1",
    waitForTimeout: "3000",
    "data.text.selector": "body",
    "data.text.attr": "text",
  };
  for (const [k, v] of Object.entries(params)) api.searchParams.set(k, v);

  try {
    const res = await fetch(api, { headers: key ? { "x-api-key": key } : {} });
    const json = await res.json();
    if (json.status === "success") {
      const d = json.data;
      return {
        title: d.title ?? "",
        description: d.description ?? "",
        text: String(d.text ?? ""),
        screenshot: d.screenshot?.url ?? null,
        rendered: true,
      };
    }
    console.warn("Microlink:", json.message ?? res.status);
  } catch (err) {
    console.warn("Microlink failed:", err);
  }

  // Fallback: the raw HTML, scripts not run.
  const html = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 portfolio-analyser" } })).text();
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? "";
  return {
    title: pick(/<title[^>]*>([^<]*)<\/title>/i),
    description: pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i),
    text: html
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    screenshot: null,
    rendered: false,
  };
}

// ---------------------------------------------------------------- the repo

type Repo = {
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  created_at: string;
  files: string[];
  sources: { path: string; text: string }[];
};

export async function readRepo(link: string): Promise<Repo | null> {
  const [, owner, rawName] = link.match(/github\.com\/([^/]+)\/([^/#?]+)/i)!;
  const name = rawName.replace(/\.git$/, "");
  const token = Deno.env.get("GITHUB_TOKEN");
  const headers: Record<string, string> = { "User-Agent": "portfolio-analyser", Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const meta = await fetch(`https://api.github.com/repos/${owner}/${name}`, { headers });
  if (!meta.ok) return null;
  const r = await meta.json();
  const tree = await fetch(`https://api.github.com/repos/${r.full_name}/git/trees/${r.default_branch}?recursive=1`, { headers });
  const files: string[] = tree.ok
    ? (await tree.json()).tree
        .filter((n: { type: string }) => n.type === "blob")
        .map((n: { path: string }) => n.path)
        .filter((p: string) => !/(^|\/)(node_modules|dist|build|\.git|vendor)\//.test(p) && !/package-lock|\.lock$|\.min\.|\.(png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|mov|woff2?|ttf|otf)$/i.test(p))
    : [];

  // The files that say the most about what the project is and how it's built.
  const wanted = [
    ...files.filter((p) => /^readme\.md$/i.test(p)),
    ...files.filter((p) => /^(package\.json|requirements\.txt|pyproject\.toml|index\.html)$/i.test(p)),
    ...files.filter((p) => /^src\/(App|main|index)\.(jsx?|tsx?|vue|svelte)$/i.test(p)),
    ...files.filter((p) => /^(src\/)?(components|pages|app|routes)\/[^/]+\.(jsx?|tsx?|vue|svelte)$/i.test(p)).slice(0, 8),
    ...files.filter((p) => /^(app|main|server)\.(py|js|ts)$/i.test(p)),
  ];
  const raw = (p: string) => `https://raw.githubusercontent.com/${r.full_name}/${r.default_branch}/${p.split("/").map(encodeURIComponent).join("/")}`;
  const sources = (
    await Promise.all(
      [...new Set(wanted)].slice(0, 14).map(async (path) => {
        const res = await fetch(raw(path));
        return res.ok ? { path, text: await res.text() } : null;
      })
    )
  ).filter((s): s is { path: string; text: string } => s !== null);

  return { full_name: r.full_name, description: r.description, language: r.language, topics: r.topics ?? [], created_at: r.created_at, files, sources };
}

// ---------------------------------------------------------------- the analysis

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "The project's name as the site presents it, e.g. a brand or product name." },
    subtitle: { type: "string", description: "What kind of project it is in 2-4 words, e.g. 'E-Commerce Website', 'Booking Platform', 'Power BI Dashboard'." },
    category: { type: "string", enum: ["web", "data"], description: "'data' only for dashboards, data analysis or database projects; otherwise 'web'." },
    details: { type: "string", description: "One or two sentences, at most 300 characters: what the project is, who it is for, and the main technology." },
    features: {
      type: "array",
      items: { type: "string" },
      description: "Three or four concrete things the project does or shows, one sentence each, under 120 characters.",
    },
    tech: {
      type: "array",
      items: { type: "string" },
      description: "Languages, frameworks, libraries and services the evidence shows it uses, with their usual names (React, Tailwind CSS, GSAP, Supabase). Leave out minor utilities and icon packs.",
    },
  },
  required: ["title", "subtitle", "category", "details", "features", "tech"],
  additionalProperties: false,
} as const;

const SYSTEM = `You write entries for the Work section of Muhammadhu Anas M's developer portfolio. He is a frontend web developer and data analyst. You are given one of his projects: the rendered text of its live site, a screenshot of it, and sometimes its source repository.

Work out what kind of project it is and who it is for, then write the entry. Visitors are recruiters and clients, so be specific and plain: name real features you can see in the text, screenshot or code, not generic claims like "modern design" or "seamless experience".

Only state what the evidence supports. Do not invent numbers, clients, results or features. Content about a business on the site describes the client's business, not the developer's work; describe what the website does. Tech comes from package.json, imports and file types first; use the page only for what it clearly shows.`;

async function analyse(url: string, page: Page, repo: Repo | null) {
  const client = new Anthropic();

  const parts: string[] = [`Live site: ${url}`, `Page title: ${page.title}`, `Meta description: ${page.description}`];
  const text = page.text.length > PAGE_TEXT_LIMIT ? `${page.text.slice(0, PAGE_TEXT_LIMIT)}\n[page text cut at ${PAGE_TEXT_LIMIT} characters]` : page.text;
  parts.push(`<page_text${page.rendered ? "" : ' note="scripts not run; may be incomplete"'}>\n${text}\n</page_text>`);
  if (repo) {
    parts.push(
      `Repository: ${repo.full_name}\nDescription: ${repo.description ?? "none"}\nMain language: ${repo.language ?? "unknown"}\nTopics: ${repo.topics.join(", ") || "none"}`,
      `<file_list>\n${repo.files.slice(0, 400).join("\n")}${repo.files.length > 400 ? `\n[${repo.files.length - 400} more files not listed]` : ""}\n</file_list>`,
      ...repo.sources.map(
        (s) => `<file path="${s.path}">\n${s.text.length > FILE_LIMIT ? `${s.text.slice(0, FILE_LIMIT)}\n[file cut at ${FILE_LIMIT} characters]` : s.text}\n</file>`
      )
    );
  }

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (page.screenshot) content.push({ type: "image", source: { type: "url", url: page.screenshot } });
  content.push({ type: "text", text: `${parts.join("\n\n")}\n\nWrite the portfolio entry for this project.` });

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "refusal") throw new Error("The AI declined to analyse this site.");
  if (response.stop_reason === "max_tokens") throw new Error("The AI response was cut off. Try again.");
  const out = response.content.find((b) => b.type === "text");
  if (!out || out.type !== "text") throw new Error("The AI returned no draft.");
  return JSON.parse(out.text) as {
    title: string;
    subtitle: string;
    category: "web" | "data";
    details: string;
    features: string[];
    tech: string[];
  };
}
