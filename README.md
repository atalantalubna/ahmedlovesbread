# AhmedLovesBread.com — Production Site (Cloudflare Pages + Decap CMS)

This folder is the deployable site. Content lives in editable data files and is managed through a login-protected CMS at `/admin/` — the same kind of setup as lanasalah.com, hosted on **Cloudflare Pages**.

## What's in here

```
index.html               The whole site (one page; nav switches sections)
assets/                  Ahmed's photos (hero + gallery)
assets/uploads/          Where CMS-uploaded images land
data/shows.json          Tour shows      <- edited in the CMS
data/products.json       Shop products   <- edited in the CMS
admin/index.html         The CMS app (Decap CMS)
admin/config.yml         The 2 collections: Shows, Shop
cms-oauth-worker/        Tiny Cloudflare Worker that logs the CMS into GitHub
netlify.toml             Unused on Cloudflare — safe to ignore or delete
```

The site loads the three `data/*.json` files at runtime. When Ahmed edits content in `/admin/`, Decap commits those files to the GitHub repo, Cloudflare rebuilds automatically, and the live site updates.

## Deploy — one-time setup

Cloudflare doesn't provide the CMS login for free the way Netlify does, so there's one extra piece: a tiny OAuth Worker (included). Here's the whole flow.

### 1. Put this folder in a GitHub repo
- New repository at github.com (e.g. `ahmedlovesbread`). Default branch **main**.
- Upload everything in this folder (GitHub's web uploader or GitHub Desktop).

### 2. Host it on Cloudflare Pages
- dash.cloudflare.com -> **Workers & Pages -> Create -> Pages -> Connect to Git** -> pick the repo.
- Framework preset: **None**. Build command: **blank**. Build output directory: **/** (root). Save & Deploy.
- You get a live URL like `ahmedlovesbread.pages.dev`.

### 3. Create a GitHub OAuth App (so the CMS can log in)
- GitHub -> **Settings -> Developer settings -> OAuth Apps -> New OAuth App**.
- Homepage URL: your site URL. **Authorization callback URL:** `https://YOUR-WORKER.workers.dev/callback` (you'll get the exact worker URL in the next step — come back and edit this).
- Note the **Client ID** and generate a **Client Secret**.

### 4. Deploy the OAuth Worker
- In the `cms-oauth-worker/` folder run `npx wrangler deploy` (or create a Worker in the dashboard and paste `worker.js`).
- Add two variables to the Worker (**Settings -> Variables**): `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (mark the secret as **Encrypt**).
- Copy the Worker's URL (e.g. `https://ahmedlovesbread-cms-oauth.workers.dev`) and paste it into the GitHub OAuth App's callback URL as `.../callback`.

### 5. Point the CMS at your repo + worker
Edit `admin/config.yml` (top of the file):
```yaml
backend:
  name: github
  repo: YOUR-GITHUB-USERNAME/ahmedlovesbread   # replace
  branch: main
  base_url: https://ahmedlovesbread-cms-oauth.workers.dev   # your Worker URL
  auth_endpoint: /auth
```
Commit the change.

### 6. Log in and edit
- Go to `yoursite.pages.dev/admin/` -> **Login with GitHub**.
- You'll see **Shows, Shop** — add/edit/delete, hit Publish, live site updates shortly.

### 7. Point the domain (ahmedlovesbread.com)
- Cloudflare Pages -> your project -> **Custom domains -> Set up a domain** -> `ahmedlovesbread.com`.
- If the domain's DNS isn't on Cloudflare yet, Cloudflare walks you through moving the nameservers from GoDaddy. HTTPS is automatic.
- WARNING: Don't cancel the current GoDaddy Website Builder site until the new one is live and you're happy.

## Editing content — the fields

**Shows:** name, date (YYYY-MM-DD), time, venue, city, address, doors, age, lineup, ticket URL, button label, maps URL, flyer image URL, description. Upcoming vs. Past is decided automatically by date.

**Shop:** name, price, category, badge, emoji icon, Buy link URL (where the Buy button sends people), description.

## About the shop

Checkout is intentionally **deferred** — each product's **Buy** button links out to wherever you set `buy_url` (your GoDaddy store, a Shopify link, etc.). Real on-site checkout (Snipcart/Shopify) can be added later without redoing the design.

## Notes

- Show flyer images currently point at the ticket sites' servers. For reliability, re-upload them through the CMS image field so they're hosted with the site.
- The photos in `assets/` are optimized web copies. Swap in performance photos anytime.
