// Add a website to the Work section in one step.
//
//   npm run add-project -- <live url> [--github <repo url>] [options]
//
// It screenshots the live site for the cover (public/work/<slug>.webp), reads the site's
// title and description, pulls the tech stack and year from the GitHub repo, and appends
// the project to src/data/projects.json. Features are left empty for you to fill in.
//
// Options:
//   --github <url>     GitHub repo (used for tech stack, year and the GitHub button)
//   --title <text>     Project name (default: the site's title)
//   --subtitle <text>  Short type line, e.g. "E-Commerce Website" (default: "Website")
//   --year <yyyy>      Year shown on the card (default: repo creation year, else this year)
//   --image <file>     Use your own cover image instead of taking a screenshot
//   --data             Add it to "Data & analytics" instead of the web gallery
//   --dry              Show what would be added without changing any files
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = join(root, "src/data/projects.json");

// ---- arguments ----
const argv = process.argv.slice(2);
const opts = { flags: new Set() };
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--data" || a === "--dry") opts.flags.add(a.slice(2));
  else if (a.startsWith("--")) opts[a.slice(2)] = argv[++i];
  else positional.push(a);
}
const url = positional[0];
if (!url || !/^https?:\/\//.test(url)) {
  console.error("Usage: npm run add-project -- <https://live-site> [--github <repo url>] [--title ..] [--subtitle ..]");
  process.exit(1);
}
const dry = opts.flags.has("dry");

const projects = JSON.parse(readFileSync(dataFile, "utf8"));
const clean = (u) => u.replace(/\/+$/, "").toLowerCase();
if (projects.some((p) => p.demoUrl && clean(p.demoUrl) === clean(url))) {
  console.error(`Already listed: ${url}`);
  process.exit(1);
}

// ---- GitHub: description, year, tech stack ----
const TECH = {
  next: "Next.js",
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  "@angular/core": "Angular",
  typescript: "TypeScript",
  vite: "Vite",
  tailwindcss: "Tailwind CSS",
  "@tailwindcss/vite": "Tailwind CSS",
  bootstrap: "Bootstrap",
  sass: "Sass",
  gsap: "GSAP",
  "framer-motion": "Framer Motion",
  motion: "Motion",
  three: "Three.js",
  lenis: "Lenis",
  "react-router-dom": "React Router",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  express: "Express",
  mongoose: "MongoDB",
  stripe: "Stripe",
  razorpay: "Razorpay API",
  "chart.js": "Chart.js",
};
const HOSTS = [
  [/\.vercel\.app/, "Vercel"],
  [/\.onrender\.com/, "Render"],
  [/\.netlify\.app/, "Netlify"],
  [/\.github\.io/, "GitHub Pages"],
];

async function getJson(u) {
  const r = await fetch(u, { headers: { "User-Agent": "portfolio-add-project" } });
  return r.ok ? r.json() : null;
}

let repo = null;
const tech = [];
if (opts.github) {
  const m = opts.github.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!m) {
    console.error("--github should look like https://github.com/<user>/<repo>");
    process.exit(1);
  }
  const [, owner, name] = m;
  repo = await getJson(`https://api.github.com/repos/${owner}/${name.replace(/\.git$/, "")}`);
  if (!repo) console.warn("! Could not read the GitHub repo (private or rate-limited); skipping tech detection.");
  const pkg = repo && (await getJson(`https://raw.githubusercontent.com/${repo.full_name}/HEAD/package.json`));
  if (pkg) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [dep, label] of Object.entries(TECH)) if (dep in deps && !tech.includes(label)) tech.push(label);
    if (repo.language === "TypeScript" && !tech.includes("TypeScript")) tech.splice(1, 0, "TypeScript");
  } else if (repo?.language) {
    tech.push(...(repo.language === "HTML" || repo.language === "CSS" ? ["HTML5", "CSS3", "JavaScript"] : [repo.language]));
  }
}
for (const [re, label] of HOSTS) if (re.test(url) && !tech.includes(label)) tech.push(label);

// ---- the live site: title, description, cover screenshot ----
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((p) => p && existsSync(p));
}

const titleFromSite = (t) => (t || "").split(/\s+[|—–-]\s+/)[0].trim();
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "project";

const chrome = findChrome();
if (!chrome) {
  console.error("Chrome or Edge not found. Set CHROME_PATH to your browser's executable.");
  process.exit(1);
}

console.log(`Opening ${url} …`);
const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--hide-scrollbars"] });
let meta;
let shotPath;
try {
  const page = await browser.newPage();
  // Same frame as the other covers: 1600 × 724.
  await page.setViewport({ width: 1600, height: 724 });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 3500)); // intro animations, web fonts

  meta = await page.evaluate(() => {
    const m = (sel) => document.querySelector(sel)?.content?.trim() || "";
    return {
      title: m('meta[property="og:site_name"]') || m('meta[property="og:title"]') || document.title,
      description: m('meta[name="description"]') || m('meta[property="og:description"]'),
    };
  });

  // Dismiss cookie banners and pop-ups so they don't land in the cover.
  await page.evaluate(() => {
    const words = /^(decline|reject( all)?|accept( all)?|got it|ok|okay|close|no thanks|dismiss)$/i;
    for (const b of document.querySelectorAll("button, [role=button], a")) {
      if (words.test(b.textContent.trim())) b.click();
    }
  });
  await new Promise((r) => setTimeout(r, 1200));

  const title = opts.title || titleFromSite(meta.title) || new URL(url).hostname;
  const name = slug(title);
  shotPath = dry ? join(tmpdir(), `${name}.webp`) : join(root, "public/work", `${name}.webp`);
  if (opts.image) {
    if (extname(opts.image).toLowerCase() !== ".webp") {
      // Convert by loading the image in the browser and screenshotting it at cover size.
      await page.goto(`file:///${resolve(opts.image).replace(/\\/g, "/")}`);
      await page.setViewport({ width: 1600, height: 724 });
      await page.addStyleTag({ content: "html,body{margin:0;height:100%}img{width:100%;height:100%;object-fit:cover}" });
      await page.screenshot({ path: shotPath, type: "webp", quality: 86 });
    } else copyFileSync(opts.image, shotPath);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: shotPath, type: "webp", quality: 86 });
  }
  meta.title = title;
} finally {
  await browser.close();
}

// ---- write the entry ----
const nextId = Math.max(0, ...projects.map((p) => +String(p.id).replace(/\D/g, "") || 0)) + 1;
const category = opts.flags.has("data") ? "data" : "web";
const entry = {
  id: `proj-${nextId}`,
  category,
  year: opts.year || (repo?.created_at ? repo.created_at.slice(0, 4) : String(new Date().getFullYear())),
  title: meta.title,
  subtitle: opts.subtitle || "Website",
  image: `/work/${shotPath.split(/[\\/]/).pop()}`,
  demoUrl: url,
  ...(opts.github ? { githubUrl: opts.github } : {}),
  tech,
  features: [],
  challenges: [],
  details: meta.description || repo?.description || "",
};

// Keep projects grouped: a new web build goes after the last web build.
const lastSame = projects.findLastIndex((p) => (p.category === "data" ? "data" : "web") === category);
projects.splice(lastSame + 1, 0, entry);

console.log("\n" + JSON.stringify(entry, null, 2));
if (dry) {
  console.log(`\nDry run: nothing changed. Cover preview: ${shotPath}`);
} else {
  writeFileSync(dataFile, JSON.stringify(projects, null, 2) + "\n");
  console.log(`\nAdded "${entry.title}" to src/data/projects.json, cover at public/work/${entry.image.split("/").pop()}.`);
  console.log('Next: add 2-4 "features" (and check "subtitle" and "details") in src/data/projects.json.');
}
