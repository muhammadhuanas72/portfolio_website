# Muhammadhu Anas M — Portfolio

React + Vite site with GSAP/Lenis motion. Content lives in `src/data/portfolioData.js`; projects live in `src/data/projects.json`.

```bash
npm install
npm run dev      # http://localhost:5173  (admin: /admin.html)
npm run build    # outputs dist/ with index.html and admin.html
```

## Adding a website project

One command screenshots the live site for the cover, reads its title and description, pulls the
tech stack and year from the GitHub repo, and adds it to the Work gallery:

```bash
npm run add-project -- https://my-site.vercel.app --github https://github.com/muhammadhuanas72/my-site --subtitle "E-Commerce Website"
```

Then open `src/data/projects.json`, find the new entry (last web project) and write 2–4
`features`. Check `title`, `subtitle` and `details` too. Commit the JSON and the new image in
`public/work/`.

| Option | Use |
| --- | --- |
| `--github <url>` | Repo for the GitHub button, tech stack and year |
| `--title <text>` | Name on the card (default: the site's title) |
| `--subtitle <text>` | Type line, e.g. "Portfolio Website" (default: "Website") |
| `--year <yyyy>` | Year on the card (default: repo creation year) |
| `--image <file>` | Use your own cover image instead of a screenshot |
| `--data` | Add to "Data & analytics" instead of the web gallery |
| `--dry` | Preview the entry and cover without changing files |

Needs Chrome or Edge installed (set `CHROME_PATH` if it is somewhere unusual). Already-listed URLs
are refused.

## Owner-only editing (resumes and projects)

Visitors only read. Uploading a new resume or adding a project happens at `/admin.html`,
which only the owner's email can sign in to. Writes are enforced by Supabase row-level
security, not just hidden in the page.

Without the steps below the site still works and shows the built-in content; the admin
page just explains that editing isn't connected.

1. Create a free project at <https://supabase.com>.
2. **SQL editor** → paste and run `supabase/schema.sql`. It creates the `projects` and
   `resumes` tables, two public storage buckets, and the owner-only write policies.
   The owner email is set inside `is_portfolio_owner()`; change it there if it ever changes.
3. **Authentication → Sign In / Providers**: keep Email enabled and turn **off**
   "Allow new users to sign up".
4. **Authentication → Users → Add user**: add `muhammadhuanas72@gmail.com`
   (sign-in links are only sent to existing users).
5. **Authentication → URL Configuration**: set the Site URL to the live site, and add
   `https://portfolio-website-cczd.onrender.com/admin.html` and
   `http://localhost:5173/admin.html` to Redirect URLs.
6. **Project Settings → API**: copy the Project URL and anon key into `.env.local`
   (see `.env.example`) and into Render → Environment as `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`. Vite bakes them in at build time, so redeploy afterwards.

Then open `/admin.html`, enter the owner email, and use the link that arrives.

- **Resumes**: upload a PDF (under 5 MB) for "Software Developer" or "Data Analyst".
  It replaces that resume everywhere on the site. "Revert" goes back to the built-in file
  in `public/resume/`.
- **Projects**: add a title, category (web build or data & analytics), description,
  highlights, tech, links and an optional screenshot (PNG/JPG/WebP under 4 MB).
  Added projects appear after the built-in ones and can be deleted from the same page.

## Deploying on Render

Static site · Build command `npm install && npm run build` · Publish directory `dist`.
