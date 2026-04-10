Good. Then do **not** build any backend.

## Stack

Use this:

* `index.html`
* `styles.css`
* `app.js`
* `/data/*.json`

Optional:

* `localStorage` for scores, last-seen cards, weak areas
* one `manifest.json` listing available decks

That is enough. No serverless, no database, no framework.

A clean shape is:

```text
/index.html
/styles.css
/app.js
/data/manifest.json
/data/decks/finance-objections.json
/data/decks/board-pushback.json
/data/decks/stakeholder-challenges.json
```

## Hosting

### 1) GitHub Pages — simplest

Now that the app is fully static, GitHub Pages is a real option again. GitHub Pages supports custom domains, HTTPS, and publishing from a branch or a GitHub Actions workflow. The catch is repo visibility: with GitHub Free, Pages is available for **public** repos; private-repo Pages needs GitHub Pro, Team, Enterprise Cloud, or Enterprise Server. ([GitHub Docs][1])

This is the best choice if:

* you want the least moving parts
* public repo is fine, or you already pay for GitHub
* you do not need auth

### 2) Cloudflare Pages — best free host with more headroom

Cloudflare Pages Free gives you **500 builds/month**, **unlimited active preview deployments**, and up to **100 custom domains per project**. Custom domains are supported; subdomains can be pointed with a CNAME, while apex domains require moving nameservers to Cloudflare. ([Cloudflare Docs][2])

This is the best choice if:

* you want free hosting but better deployment ergonomics than GitHub Pages
* you want preview URLs on every change
* you might outgrow the absolute simplest setup later

### 3) Azure Static Web Apps — best Azure fallback

Azure Static Web Apps Free includes web hosting, GitHub and Azure DevOps integration, globally distributed static content, auto-renewing SSL, **3 staging environments**, and **2 custom domains**. Azure also provides built-in auth support; GitHub and Microsoft Entra ID require no extra configuration in Static Web Apps. Microsoft positions **Free** for personal projects and **Standard** for production apps. ([Microsoft Learn][3])

This is the best choice if:

* you want Azure alignment
* you may want login later
* you may want to keep the site private later

### 4) Vercel / Netlify — fine, but unnecessary unless you already use them

Vercel Hobby includes built-in CI/CD, automatic HTTPS/SSL, and preview deployments, but it is restricted to **non-commercial, personal use only**. Netlify Free includes unlimited deploy previews, custom domains with SSL, a global CDN, and a **300 credit/month** cap. ([Vercel][4])

I would only pick these if you already use them.

## Actual recommendation

For your revised setup:

* **Simplest:** GitHub Pages
* **Best free default:** Cloudflare Pages
* **Best Azure option:** Azure Static Web Apps

## One important caveat

If the JSON contains the actual answers, expected responses, or anything sensitive, anyone who can access the app can usually download that JSON and inspect it.

So:

* if the content is harmless: public static hosting is fine
* if the content is sensitive: do **not** ship it on a public static site; use Azure Static Web Apps with auth, or keep it local/private

## What I’d do

I’d build it as:

* plain HTML/CSS/JS
* JSON decks committed to repo
* localStorage for progress
* host on **Cloudflare Pages**

If you want absolute minimum setup and the repo can be public, use **GitHub Pages** instead.

Next step should be the JSON schema, because that will determine how easy the UI is to build.

[1]: https://docs.github.com/pages?utm_source=chatgpt.com "GitHub Pages documentation - GitHub Docs"
[2]: https://developers.cloudflare.com/pages/platform/limits/ "Limits · Cloudflare Pages docs"
[3]: https://learn.microsoft.com/en-us/azure/static-web-apps/plans "Azure Static Web Apps hosting plans | Microsoft Learn"
[4]: https://vercel.com/docs/plans/hobby "Vercel Hobby Plan"
