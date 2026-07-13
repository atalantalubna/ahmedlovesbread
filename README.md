# AhmedLovesBread.com — Production Site (Netlify + Decap CMS)

This folder is the deployable version of the site. Unlike the single-file mockup, content here lives in editable data files and is managed through a real login-protected CMS at `/admin/` — the same setup lanasalah.com uses.

## What's in here

```
index.html            The whole site (one page, sections switch in the nav)
assets/               Ahmed's photos (hero + gallery)
assets/uploads/       Where CMS-uploaded images land
data/shows.json       Tour shows      ← edited in the CMS
data/eats.json        Ahmed's Eats    ← edited in the CMS
data/products.json    Shop products   ← edited in the CMS
admin/index.html      The CMS app (Decap CMS)
admin/config.yml      Defines the 3 collections: Shows, Eats, Shop
netlify.toml          Netlify config
```

The site loads the three `data/*.json` files at runtime. When Ahmed edits content in `/admin/`, Decap saves those JSON files back to the repo, Netlify redeploys automatically, and the site shows the update.

## One-time deploy (about 15 minutes)

You'll do this once. After that, Ahmed only ever touches `/admin/`.

### 1. Put this folder in a GitHub repo
- Create a free account at [github.com](https://github.com) if you don't have one.
- Make a new repository (e.g. `ahmedlovesbread`).
- Upload everything in this folder to the repo (GitHub's web uploader works, or use GitHub Desktop). Make sure the default branch is named **main**.

### 2. Connect the repo to Netlify
- At [netlify.com](https://www.netlify.com), **Add new site → Import an existing project → GitHub**, and pick the repo.
- Build command: leave **blank**. Publish directory: **`.`** (a dot). Deploy.
- You'll get a live URL like `something.netlify.app`.

### 3. Turn on the login system (Netlify Identity + Git Gateway)
This is what makes `/admin/` work.
- In your Netlify site: **Site configuration → Identity → Enable Identity**.
- Under Identity → **Registration**, set it to **Invite only** (so randoms can't sign up).
- Scroll to **Services → Git Gateway → Enable Git Gateway**.
- Go to the **Identity** tab → **Invite users** → enter Ahmed's email (and/or yours). He'll get an email to set a password.

### 4. Log in and edit
- Go to `your-site.netlify.app/admin/` → log in with the invited email.
- You'll see three collections: **Shows, Ahmed's Eats, Shop**. Add/edit/delete entries, hit Publish. The live site updates in a minute or two.

### 5. Point the domain (ahmedlovesbread.com)
The domain is at GoDaddy. Keep it there, aim it at Netlify:
- Netlify: **Domain management → Add a domain →** `ahmedlovesbread.com`.
- Follow Netlify's DNS instructions — easiest is to switch the **nameservers** at GoDaddy to Netlify's. (GoDaddy → your domain → Nameservers → Change → enter Netlify's.)
- Netlify auto-issues free HTTPS. Give DNS a few hours.
- ⚠️ Don't cancel the current GoDaddy Website Builder site until the new one is live and you're happy.

## Editing content — the fields

**Shows:** name, date (YYYY-MM-DD), time, venue, city, address, doors, age, lineup, ticket URL, button label, maps URL, flyer image URL, description. Upcoming vs. Past is decided automatically by the date.

**Ahmed's Eats:** name, cuisine, neighborhood, bread rating (1-5), emoji icon, blurb.

**Shop:** name, price, category, badge, emoji icon, **Buy link URL** (where the Buy button sends people), description.

## About the shop

Checkout is intentionally **deferred** — each product's **Buy** button links out to wherever you point `buy_url` (your GoDaddy store, a Shopify link, etc.). When you're ready for real on-site checkout, Snipcart or Shopify can be added without redoing the design.

## Notes

- Show flyer images currently point at the ticket sites' servers. For reliability, download and re-upload them via the CMS image field so they're hosted with the site.
- The photos in `assets/` are optimized web copies. Swap in performance photos anytime (via the repo or the CMS).
