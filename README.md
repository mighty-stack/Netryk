# Netryk web

React 19 + Vite + Tailwind v4 + Redux Toolkit (RTK Query) + Formik/Yup. Talks to `netryk-api`.

## Run

```bash
cp .env.example .env      # VITE_API_URL must point at the API (default http://localhost:5001)
npm install
npm run dev               # http://localhost:5173 (the API allows this origin by default)
npm test                  # 14 tests, API mocked
npm run build
```

Deploy to Vercel as a static Vite app (`vercel.json` rewrites all paths to `index.html`). Add the deployed URL to the API's `CLIENT_ORIGINS`, and set the API's `PAYSTACK_CALLBACK_URL` to `https://<your-domain>/payment/complete`.

## Screens

- Public: landing (live price calculator, tracking box), `/track/:id`, login, register.
- Customer (`/app`): shipments, book (live price), shipment detail (pay, delivery code, cancel, progress), profile.
- Driver (`/driver`, mobile-first): jobs, job detail (call buttons, status steps, recipient code to deliver), earnings.
- Admin (`/admin`): overview, shipments (assign driver, change status, cancel), drivers (add, verify, suspend), users, earnings (record payouts).
- `/payment/complete`: Paystack return page; the server confirms the payment, the page only displays the result.

## Behaviour worth knowing

- Sessions survive a refresh: the stored token is checked with `/auth/me` before any protected screen renders. Any 401 ends the session and clears all cached data.
- Logging out clears cached API data so the next person on the same device never sees it.
- Roles are enforced twice: here for navigation, and on the API for real. Drivers added by admin must change their temporary password first.
- Prices come only from the API. The page never calculates or sends a price.
- Driver and admin screens are lazy-loaded, so customers do not download them.
- Fonts (Manrope, Inter, JetBrains Mono) are self-hosted from npm; no Google Fonts requests.

## Placeholders and gaps

- The logo is direction A ("Route N") as a stand-in until you choose a final mark (`src/components/Logo.jsx`, `public/favicon.svg`).
- Contact details and the WhatsApp button appear only if you set `VITE_SUPPORT_PHONE`, `VITE_SUPPORT_EMAIL`, `VITE_WHATSAPP_URL`.
- No terms of service or privacy policy pages yet; add them (lawyer-reviewed) before launch, and link them in the footer and at registration.
- Not built: notifications, in-app chat, COD, password reset (the API has no endpoint for it yet), public pages beyond the landing page.
- Main bundle is about 473 kB (149 kB gzipped). Dropping Formik/Yup later would trim it.
