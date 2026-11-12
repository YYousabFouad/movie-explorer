# Movie Explorer Community

![HTML5](https://img.shields.io/badge/HTML5-Semantic_Markup-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Accessibility](https://img.shields.io/badge/A11y-WCAG_AA_%2F_ARIA-10B981?style=flat-square)

A dark, cinema-inspired frontend platform foundation for **Movie Explorer Community**, engineered with semantic **HTML5**, **Tailwind CSS v4**, and a strict **DOM selector contract** designed for modular Vanilla JavaScript integration.

> [!IMPORTANT]
> **Architectural Scope:** This repository delivers the **Presentation Layer & DOM Contract** (`index.html`, `src/input.css`, `dist/output.css`) alongside its client-side ES module (`src/js/main.js`). Navigation scroll-spy and demo authentication validation are wired; search, rating, reviews, community submissions, and favorites remain static UI prototypes (disabled until their controllers and API layer are implemented).

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Design System](#2-architecture--design-system)
3. [Repository Structure](#3-repository-structure)
4. [Getting Started & Build Pipeline](#4-getting-started--build-pipeline)
5. [DOM Contract Specification](#5-dom-contract-specification)
6. [JavaScript Implementation Roadmap](#6-javascript-implementation-roadmap)
7. [Engineering & Accessibility Standards](#7-engineering--accessibility-standards)

---

## 1. System Overview

**Movie Explorer Community** is a single-page film discovery, rating, and catalog curation interface organized around six functional domains:

- **Catalog Search & Filtering:** Query input paired with genre classification filters (`Sci-Fi`, `Drama`, `Mystery`, `Thriller`, `Adventure`) and responsive `2:3` poster grid markup.
- **Title Spotlight & Rating UI:** Metadata inspection view (release year, genre, runtime, director, plot synopsis, score, and vote count) with an accessible 1–10 radio rating fieldset.
- **Audience Reviews & Discussions:** Review form markup, validation feedback containers, and static sample review cards.
- **Community Curation & Quality Assurance:** Markup for suggesting missing films and reporting metadata inaccuracies, plus static sample submission cards.
- **Personal Watchlist (Favorites):** Saved movies grid markup, navigation badge (`#nav-favorites-count`), and removal buttons.
- **Member Authentication Flows (Demo):** Accessible sign-in and account registration forms wired to pure client-side validation and accessible feedback banners.

### Feature & Implementation Status

| Domain | Status | Notes |
| :--- | :--- | :--- |
| **Navigation & Scroll-Spy** | Implemented | Click highlighting, `aria-current="location"`, and `IntersectionObserver` scroll-spy (`src/js/main.js`). |
| **Authentication Forms** | Implemented (Demo) | Pure client-side validation, `aria-invalid` / `aria-describedby` focus linking, and auto-hide after success (`src/js/main.js`). No backend requests are sent. |
| **Static Form Guards** | Implemented | Unwired prototype forms use `novalidate` with `disabled` submit buttons in `index.html`, with no JS involved. |
| **Search & Genre Filter** | Static UI Prototype | Catalog cards are hard-coded; search button is disabled until controller/API integration. |
| **Rating, Reviews & Community Forms** | Static UI Prototype | Form markup and feedback containers are ready; submit buttons are disabled until wired. |
| **Favorites Watchlist** | Static UI Prototype | Static sample cards and badge count (`2`); add/remove interactions not yet wired. |

---

## 2. Architecture & Design System

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Markup & Semantics** | HTML5 | Semantic document landmarks, native form controls, and ARIA live regions |
| **Styling & Tokens** | Tailwind CSS v4 (`@tailwindcss/cli`) | CSS-first `@theme` configuration, utility classes, and custom component primitives |
| **Application Logic** | Vanilla JavaScript (ES Modules) | Single client entry module (`src/js/main.js`) handling navigation scroll-spy and demo auth validation |
| **Visual Assets** | Custom SVG + CSS Fallbacks | Vector cinema posters (`2:3` aspect ratio) and pure CSS archival placeholder cards |

### Design Tokens & Component Primitives (`src/input.css`)

The visual system is defined using Tailwind CSS v4's CSS-first `@theme` directive and `@layer components` abstractions:

- **Surface Palette (`cinema-*`):** Deep slate-navy surfaces (`--color-cinema-950: #070a12` through `--color-cinema-700: #263352`) engineered for high contrast and low eye strain.
- **Accent Palette (`gold-*`):** Warm cinema gold highlights (`--color-gold-400: #fbbf24` through `--color-gold-600: #d97706`) used for ratings, primary calls-to-action, and keyboard focus rings.
- **Reusable Component Classes:**
  - `.cinema-card` / `.cinema-panel`: Standardized surfaces (`bg-cinema-900` with `border-slate-700/65` and `rounded-2xl`, or elevated `bg-cinema-850`).
  - `.cinema-input` / `.cinema-label`: Unified form controls with `--color-gold-400` focus ring transitions.
  - `.cinema-btn-primary`, `.cinema-btn-secondary`, `.cinema-btn-danger`, `.cinema-nav-link`, `.cinema-section-header`, `.cinema-alert-error`, `.cinema-alert-success`, `.cinema-badge`, `.cinema-rating-pill`: Interactive controls, section headers, status banners, and keyboard-accessible 1–10 rating pills.

---

## 3. Repository Structure

```text
movie-explorer/
├── assets/
│   └── images/                        # Local vector movie posters (2:3 aspect ratio)
│       ├── poster-dune-horizon.svg
│       ├── poster-midnight-sonata.svg
│       ├── poster-neon-odyssey.svg
│       └── poster-solaris-echo.svg
├── dist/
│   └── output.css                     # Compiled and minified Tailwind CSS v4 stylesheet
├── src/
│   ├── input.css                      # Tailwind CSS v4 entry point, @theme tokens & components
│   └── js/
│       └── main.js                    # ES module: validation, navigation scroll-spy, demo auth forms
├── tests/
│   └── main.test.js                   # Node test suite (node --test)
├── .gitignore                         # Git ignore rules (node_modules, OS/editor artifacts)
├── index.html                         # Single-page semantic HTML5 application interface
├── package.json                       # Build, check, and test scripts
├── package-lock.json                  # Deterministic dependency lockfile
└── README.md                          # Project architecture and engineering documentation
```

---

## 4. Getting Started & Build Pipeline

### Prerequisites

- **Node.js:** `v20.4.0` or higher (`node:test` mock timers in `tests/main.test.js` require `>=20.4`; verified on `v22.23.1`)
- **npm:** `v9.0.0` or higher

### Installation

Clone the repository and install the development dependencies from the project root:

```bash
npm install
```

### Build, Verification & Test Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **`npm run build:css`** | `tailwindcss -i ./src/input.css -o ./dist/output.css --minify` | Compiles and minifies `src/input.css` into `dist/output.css` for production. |
| **`npm run watch:css`** | `tailwindcss -i ./src/input.css -o ./dist/output.css --watch` | Watches `index.html`, `src/input.css`, and `src/js/main.js` for changes and recompiles CSS incrementally. |
| **`npm run check:css`** | `tailwindcss -i ./src/input.css -o - --minify \| node -e ...` | Rebuilds CSS to stdout and compares it in memory with `dist/output.css`. |
| **`npm run check:js`** | `node --check src/js/main.js` | Syntax-checks `src/js/main.js`. |
| **`npm test`** | `node --test tests/main.test.js` | Runs the unit and contract test suite using Node's built-in test runner. |
| **`npm run check`** | `npm run check:js && npm run check:css && npm test` | Runs JS syntax check, CSS freshness check, and the full test suite. |

### Running the Application Locally

Serve the repository over HTTP so the browser can load ES modules (`<script type="module">`; opening `index.html` via `file://` is blocked by browser CORS rules for module scripts):

```bash
python3 -m http.server
# or (if installed / online)
npx serve .
```

---

## 5. DOM Contract Specification

All dynamic regions in `index.html` expose stable, deterministic IDs and class hooks to decouple markup structure from JavaScript business logic.

| Functional Domain | Primary Containers & Forms | Interactive Controls & Inputs | State & Feedback Selectors |
| :--- | :--- | :--- | :--- |
| **Header & Navigation** | `#main-header`, `#brand-logo` | `#nav-search`, `#nav-details`, `#nav-community`, `#nav-favorites`, `#nav-signin-btn`, `#nav-register-btn` | `#nav-favorites-count` |
| **Search & Discovery** | `#search-section`, `#search-form`, `#search-results-section`, `#search-results` | `#search-input`, `#search-genre`, `#search-submit-btn`, `.movie-card`, `.view-details-btn` | `#search-results-summary`, `#search-loading`, `#search-error`, `#search-error-message`, `#search-no-results` |
| **Movie Details & Rating** | `#movie-details-section`, `#movie-details`, `#rating-form` | `#details-favorite-btn`, `#details-quick-comment`, `#rating-submit-btn`, `input[name="user-rating"]` | `#details-loading`, `#details-error`, `#details-poster`, `#details-title`, `#details-year`, `#details-genre`, `#details-runtime`, `#details-director`, `#details-plot`, `#details-rating`, `#details-vote-count`, `#rating-feedback` |
| **Audience Reviews** | `#reviews-section`, `#review-form`, `#reviews-list` | `#review-username`, `#review-rating`, `#review-text`, `#review-submit-btn`, `.review-item` | `#review-target-movie`, `#review-error`, `#review-success`, `#reviews-empty-state` |
| **Community Curation** | `#community-section`, `#community-suggestion-form`, `#problem-report-form`, `#community-submissions-list` | `#suggest-title`, `#suggest-year`, `#suggest-description`, `#suggest-reason`, `#suggest-submit-btn`, `#report-movie-title`, `#report-problem-type`, `#report-description`, `#report-submit-btn`, `.submission-card` | `#suggestion-feedback`, `#report-feedback`, `#community-empty-state` |
| **Favorites (Watchlist)** | `#favorites-section`, `#favorites-list` | `.favorite-card`, `.remove-favorite-btn` | `#favorites-empty-state` |
| **Authentication** | `#auth-section`, `#signin-card`, `#signin-form`, `#register-card`, `#register-form` | `#signin-email`, `#signin-password`, `#signin-submit-btn`, `#go-to-register-link`, `#register-username`, `#register-email`, `#register-password`, `#register-confirm-password`, `#register-submit-btn`, `#go-to-signin-link` | `#signin-error`, `#signin-success`, `#register-error`, `#register-success` |

---

## 6. JavaScript Implementation Roadmap

When building out the client-side application in `src/js/main.js`, adhere to a modular, layered architecture:

1. **Domain Models & State Management (OOP / ES6 Classes):**
   - Encapsulate entities (`Movie`, `Review`, `CommunitySubmission`) and stateful services (`FavoritesStore`, `AuthSession`) with `localStorage` persistence where appropriate.
2. **Asynchronous Data & API Service Layer:**
   - Implement a dedicated API client using `fetch` and `async`/`await` to query movie endpoints, normalize payload schemas, and surface typed network errors.
3. **Deterministic UI State Transitions:**
   - Manage mutually exclusive view states (`loading` → `data` | `empty` | `error`) by toggling the Tailwind `hidden` utility class on `#search-loading`, `#search-error`, `#search-no-results`, and `#search-results`.
4. **Event Delegation & Controller Binding:**
   - Attach delegated listeners to parent containers (`#search-results`, `#favorites-list`, `#reviews-list`) to handle dynamically rendered `.view-details-btn` and `.remove-favorite-btn` actions without memory leaks.
5. **Form Validation & Resilient Error Handling:**
   - Auth forms (`#signin-form`, `#register-form`) already implement client-side validation and error linking (`#signin-error`, `#register-error`) in `src/js/main.js`; follow the same pattern for `#rating-form`, `#review-form`, `#community-suggestion-form`, and `#problem-report-form` once wired.

---

## 7. Engineering & Accessibility Standards

- **Keyboard Navigation & Focus Management:** Includes a high-contrast skip link (`Skip to main content`) and explicit `:focus-visible` ring styles on primary navigation links, action buttons, and 1–10 rating pills.
- **Screen Reader Support:** Asynchronous status containers use `role="status"`, `role="alert"`, and `aria-live="polite"` so dynamic state transitions are announced non-intrusively.
- **Semantic Form Grouping:** Multi-option controls (such as the 1–10 movie rating selector) use native `<fieldset>` and `<legend>` elements paired with explicit `<label>` associations.
- **Graceful Asset Degradation:** Movie cards support both vector/raster `<img>` posters with `loading="lazy"` and a pure CSS archival fallback state (`role="img"`) when poster artwork is unavailable.
- **Content Security Policy & XSS Prevention:** `index.html` declares a strict `<meta http-equiv="Content-Security-Policy">` (`default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self';`), and `src/js/main.js` writes dynamic text solely through `textContent`.
