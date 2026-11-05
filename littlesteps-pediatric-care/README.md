# LittleSteps Pediatric Care

> **Growing Healthy, Growing Happy.**

A complete, professional, responsive website for a pediatric clinic & child wellness center — built with **HTML5, Tailwind CSS (compiled locally) and Vanilla JavaScript**. Frontend demonstration only: no frameworks, no backend, demo data in `localStorage`.

Warm pastel palette · child-friendly but clinical-grade layout · light/dark themes · LTR/RTL support · fully responsive (320px → 1920px).

---

## Quick start

```bash
# 1. Install dev dependency (Tailwind CSS CLI)
npm install

# 2. (Re)build the compiled stylesheet — required after editing css/input.css or page markup
npm run build:css        # minified production build → css/style.css
npm run watch:css        # keep rebuilding while you work

# 3. Serve the site locally (any static server works)
npm start                # http://localhost:3000  (uses `npx serve`)
# ...or: python -m http.server 3000
# ...or: open index.html with VS Code Live Server / any static host
```

`css/style.css` is **already committed and compiled** — the site works immediately by opening `index.html` in a static server, even without running `npm install`.

> Note on Windows paths containing `&`: npm scripts call the Tailwind CLI through `node node_modules/tailwindcss/lib/cli.js` so they work regardless of folder path.

---

## Demo login credentials

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| Parent | `parent@littlestepsdemo.com` | `parent123` | `dashboard/parent-dashboard.html` |
| Admin | `admin@littlestepsdemo.com` | `admin123` | `dashboard/admin-dashboard.html` |

These are **public, fictional demo credentials** — they exist so you can explore the dashboards. They are not real accounts, are not secure, and must never be reused for a real service. There is no real authentication, password hashing, server session or access control. Client-side role checks are UX only, not security.

The login page offers “fill” buttons for both accounts.

---

## Folder structure

```text
littlesteps-pediatric-care/
├── index.html               Home 1 — classic clinic homepage
├── home2.html               Home 2 — alternate composition (full-bleed hero + quick booking)
├── about.html               About, mission/vision/values, clinic environment
├── services.html            All 6 service lines with anchor deep links
├── doctors.html             Demo doctor profiles + FAQ
├── vaccinations.html        Educational vaccine info + ILLUSTRATIVE schedule
├── appointments.html        Booking form (validated) + preparation guide
├── contact.html             Contact info, form, embedded OSM map, hours, FAQ
├── login.html               Split-screen demo login
├── privacy.html             Demo privacy policy
├── terms.html               Demo terms & conditions
│
├── dashboard/
│   ├── parent-dashboard.html   Children, appointments, vaccine tracker, growth chart (Chart.js)
│   └── admin-dashboard.html    Appointments, parents, children, doctors, vaccines, messages
│
├── css/
│   ├── input.css            Tailwind directives + LittleSteps design system (source of truth)
│   └── style.css            Compiled output — do not edit by hand
├── js/
│   ├── main.js              Theme, RTL, toasts, FAQ accordion, validation helpers, demo seed/reset
│   ├── navbar.js            THE ONLY place navbar markup/behaviour exists
│   ├── footer.js            THE ONLY place footer markup exists
│   ├── auth.js              Demo login/logout, session, route guards (not security)
│   ├── appointments.js      Booking form validation + localStorage persistence
│   ├── vaccination.js       Parent-dashboard vaccination tracker logic
│   ├── parent-dashboard.js  Parent dashboard rendering & interactions
│   └── admin-dashboard.js   Admin dashboard rendering & interactions
├── images/                  27 locally-downloaded, free-to-use photos (Pexels/Unsplash)
├── assets/fonts/            (Reserved) self-hosted fonts — currently Google Fonts via CSS import
├── favicon.svg              LittleSteps logo mark
├── tailwind.config.js       darkMode: 'class', brand palette tokens
├── package.json             build:css / watch:css / start scripts
└── README.md
```

---

## Architecture rules honored

- **Navbar lives only in `js/navbar.js`.** Every page contains exactly `<div id="navbar"></div>` — active-page highlighting, Home & Dashboard dropdowns (mouse, keyboard, touch), mobile drawer, theme + RTL icon toggles, sticky positioning, skip-link for a11y.
- **Footer lives only in `js/footer.js`.** Contact, quick links, services, dynamic `© <current year>`, medical disclaimer. Adapts to dark mode & RTL.
- **CSS variables** (`--primary`, `--bg`, `--card`, …) drive both themes; Tailwind utilities + component classes in `css/input.css`.
- **No frameworks.** Vanilla DOM APIs; no React/Vue/Angular; Chart.js (the only library) is used exclusively for the growth chart.
- **XSS-safe rendering.** User-supplied text is escaped via `LittleSteps.escapeHTML()` before injection.
- **Accessible interactions.** Visible focus rings, `aria-expanded`/`aria-controls` on dropdowns & accordions, `aria-live` toasts, keyboard-navigable menus, semantic headings, `prefers-reduced-motion` respected.

---

## Themes & RTL

- **Theme toggle** — sun/moon button persists `ls_theme` in localStorage; falls back to `prefers-color-scheme` on first visit. Applied pre-paint by a tiny inline script in every `<head>` (no flash), and enforced by `main.js`.
- **RTL toggle** — directional icon flips `document.documentElement.dir` between `ltr`/`rtl`, persisted as `ls_dir`. Dropdowns, sidebar drawer, tables, spacing and forms are RTL-tested (logical properties, `[dir="rtl"]` overrides, `ms-/me-/ps-/pe-` utilities).
- Both toggles exist on **every public page and both dashboards**, with `aria-pressed`, `aria-label` and `title`.

## Demo data & localStorage

Keys (all prefixed `ls_`): `ls_theme`, `ls_dir`, `ls_session`, `ls_demo_seeded`, `ls_parents`, `ls_children`, `ls_appointments`, `ls_vaccines`, `ls_growth`, `ls_history`, `ls_messages`, `ls_doctors`, `ls_clinic`, `ls_parent_profile`.

- Seeded automatically on first load with realistic, clearly fictional sample records.
- **Reset Demo Data** buttons (both dashboards, Settings sections) restore the original samples and reload (`main.js → resetDemoData()`).
- Empty states are handled everywhere; all inputs validated.
- **Nothing is sent anywhere.** localStorage is plain, unencrypted client storage — never store real patient data here. This demo cannot and must not manage protected health information.

## Appointment booking (appointments.html)

Validated end-to-end: required fields, email regex, phone regex, date-of-birth ≤ today, appointment date ≥ today, notes length cap. On success, a reference number (`LS-XXXXXX-###`) is generated, the record is appended to `ls_appointments` with status `Pending`, and a success panel is shown. The parent dashboard and admin panel immediately list it. **No email, SMS or calendar invite is ever sent — this is a frontend demo.**

`home2.html`’s quick-booking panel deep-links to `appointments.html?childName=…&type=…&date=…` and pre-fills the form.

## Vaccination content — read this

`vaccinations.html` and the tracker use **illustrative** vaccine group names and a simplified example table. They are general education only — **not** a medical schedule. Your clinician and the current official national guidance (e.g., CDC/ACIP, or your national authority) are authoritative. Nothing here generates vaccine recommendations.

## Charts & records

Growth charts plot recorded demo height/weight only. The UI states explicitly that **charts are records, not diagnosis**. Chart.js loads from jsDelivr CDN; if it fails offline, the table view still works.

---

## Customizing for a real clinic

1. **Brand name/tagline** — `js/navbar.js`, `js/footer.js`, page `<title>`s and headings.
2. **Logo** — replace the inline SVGs (search `logoSVG` in `js/navbar.js` & `js/footer.js`) and `favicon.svg`.
3. **Contact details** — replace the placeholder phone/email/address/hours in `js/footer.js` (single source), `contact.html`, and `dashboard/admin-dashboard.html` (Clinic Settings form persists to `ls_clinic`).
4. **Doctor profiles** — replace fictional profiles in `doctors.html`, `index.html` (Section 5) and the `ls_doctors` seed array in `js/main.js`. Remove “Demo” badges and the legal notices once content is verified.
5. **Testimonials** — replace sample quotes or remove the section; never present invented quotes as verified patient feedback.
6. **Images** — drop replacements into `images/<folder>/` keeping the filenames, or update references. Used photos come from Pexels and Unsplash (free license); keep `onerror` fallbacks intact.
7. **Legal** — `privacy.html` and `terms.html` are templates; have counsel review before publishing.

## Image credits (free license — Pexels & Unsplash)

Pexels photos (via `images.pexels.com`): 5998451, 5998455, 5998446, 5998449, 6970101, 19357675, 5867701, 5867700, 5998457, 32465947, 7653316, 8460043, 7447009, 7446993, 39192343, 7653108, 5234519, 19438561, 7904406, 29995617, 38624436, 21643020, 35858303, 5693034, 6969719, 4720413. Unsplash: `photo-1676313030076-4ac0b37050fd`. All images downloaded locally; no hotlinking.

## Known limitations (honesty section)

- No backend, database, email, SMS or payments.
- Authentication is plaintext-compared demo credentials in JS — session role checks are cosmetic.
- All “patient” data is fictional and browser-local; clearing site data erases it.
- Map is an OpenStreetMap embed of a placeholder location; buttons to real phone/email open `tel:`/`mailto:` with placeholder numbers.
- Google Fonts and Chart.js load from CDNs (needs network once; pages otherwise work offline).
- No build step for HTML/JS — edit and refresh. Only CSS requires `npm run build:css`.

## Browser support & testing

Modern evergreen browsers (Chrome, Edge, Firefox, Safari) on mobile → desktop. Layout verified against 320 / 375 / 425 / 768 / 1024 / 1280 / 1440 / 1920px breakpoints; no horizontal scrolling; on mobile/tablet (below 1377px) the dashboard top bar shows only the logo (left) + hamburger (right) and the hamburger opens the menu drawer — page title, account, notifications, display toggles and section links inside — swapping to a cross icon while open; from 1377px up the desktop layout returns (docked sidebar, page title and controls in the bar).

## Accessibility highlights

Skip-to-content link, consistent focus-visible outlines, keyboard-operable dropdowns (Arrow/Escape/Tab/Enter), `aria-expanded`/`aria-controls`, semantic landmarks (`header`, `main`, `footer`, `nav`), labelled form controls, `role="status"`/`role="alert"` messaging, `prefers-reduced-motion` support, minimum 44×44px touch targets, WCAG-minded contrast on the teal/off-white palette.

## License

Code: MIT (this demo). Images: Pexels/Unsplash licenses — free to use, attribution appreciated, do not resell as-is. Brand “LittleSteps Pediatric Care” is fictional.
