# Deploying the client (Render)

## Fix "Not Found" on reload / direct links (SPA)

This app uses client-side routing (React Router). When you reload a path like `/student/dashboard` or open it directly, the server must serve `index.html` so the app can load and the router can handle the URL.

**On Render:**

1. Open your **Static Site** in the [Render Dashboard](https://dashboard.render.com).
2. Go to **Redirects/Rewrites**.
3. Add a **Rewrite** rule:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** Rewrite

After saving, reloading or opening any route (e.g. `/login`, `/student/dashboard`) will show the app instead of "Not Found".

---

The `public/_redirects` file is used by Netlify and some other hosts. Render uses the rule you add in the Dashboard.
