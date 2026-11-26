# Movie Explorer Community

![HTML5](https://img.shields.io/badge/HTML5-Semantic_Markup-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Accessibility](https://img.shields.io/badge/A11y-WCAG_AA_%2F_ARIA-10B981?style=flat-square)

A dark, cinema-inspired frontend platform foundation for **Movie Explorer Community**, engineered with semantic **HTML5**, **Tailwind CSS v4**, and a strict **DOM selector contract** designed for modular Vanilla JavaScript integration.

> [!IMPORTANT]
> **Architectural Scope:** This repository delivers the **Presentation Layer, DOM Contract, and Modular OOP Client Application** (`index.html`, `src/input.css`, `dist/output.css`, and `src/js/`). Catalog search/genre filtering, spotlight switching, live 1–10 rating, reviews, community submissions, favorites management, scroll-spy navigation, and demo authentication validation are all wired locally without a backend API.

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

- **Catalog Search & Filtering:** Live query input paired with genre classification filters (`Sci-Fi`, `Drama`, `Mystery`, `Thriller`, `Adventure`) and responsive `2:3` poster grid cards.
- **Title Spotlight & Rating UI:** Interactive film inspector (release year, genre, runtime, director, plot synopsis, score badge, and vote count) with a live 1–10 radio rating fieldset and quick-reaction handoff.
- **Audience Reviews & Discussions:** Validated review form with live submission rendering, accessible error/success banners, and initial sample review cards.
- **Community Curation & Quality Assurance:** Validated forms for suggesting missing films and reporting metadata inaccuracies with live submission cards.
- **Personal Watchlist (Favorites):** Synchronized favorites grid, animated navigation badge (`#nav-favorites-count`), spotlight toggle button (`#details-favorite-btn`), and per-card removal controls.
- **Member Authentication Flows (Demo):** Accessible sign-in and account registration forms wired to pure client-side validation and accessible feedback banners.

### Feature & Implementation Status

| Domain | Status | Notes |
| :--- | :--- | :--- |
| **Navigation & Scroll-Spy** | Implemented | Click highlighting, `aria-current="location"`, and `IntersectionObserver` scroll-spy (`NavigationController` in `src/js/controllers.js`). |
| **Search & Genre Filter** | Implemented (Client) | Live keyword and genre filtering across catalog cards with empty-state and summary updates (`CatalogController` in `src/js/controllers.js`). |
| **Title Spotlight & Rating** | Implemented (Client) | Card-to-spotlight switching, weighted score/vote recalculation, and quick-comment transfer (`MovieDetailsController` in `src/js/controllers.js`). |
| **Reviews & Community Forms** | Implemented (Client) | Declarative `FormValidator` rules (`src/js/validation.js`), domain models (`Review`, `MovieSuggestion`, `ProblemReport`), and live card rendering (`CardViewFactory`). |
| **Favorites Watchlist** | Implemented (Client) | Event-driven synchronization between `#details-favorite-btn`, `#favorites-list`, `#favorites-empty-state`, and `#nav-favorites-count` (`FavoritesController` + `AppState`). |
| **Authentication Forms** | Implemented (Demo) | Client-side `FormValidator` verification, `aria-invalid` / `aria-describedby` focus linking, and auto-hide timer (`AuthController`). No backend requests are sent. |

---

## 2. Architecture & Design System

### Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Markup & Semantics** | HTML5 | Semantic document landmarks, native form controls, and ARIA live regions |
| **Styling & Tokens** | Tailwind CSS v4 (`@tailwindcss/cli`) | CSS-first `@theme` configuration, utility classes, calibrated motion keyframes, and custom component primitives |
| **Application Logic** | Vanilla JavaScript (OOP ES Modules) | Layered `src/js/` modules (`models.js`, `validation.js`, `dom.js`, `views.js`, `controllers.js`, `app.js`, `main.js`) orchestrated by `MovieExplorerApp` |
| **Visual Assets** | Custom SVG + Data URI Fallbacks | Vector cinema posters (`2:3` aspect ratio) and archival placeholder artwork |

### Design Tokens & Component Primitives (`src/input.css`)

The visual system is defined using Tailwind CSS v4's CSS-first `@theme` directive and `@layer components` abstractions:

- **Surface Palette (`cinema-*`):** Deep slate-navy surfaces (`--color-cinema-950: #070a12` through `--color-cinema-700: #263352`) engineered for high contrast and low eye strain.
- **Accent Palette (`gold-*` & Motion):** Warm cinema gold highlights (`--color-gold-400: #fbbf24` through `--color-gold-600: #d97706`) paired with `--ease-cinema: cubic-bezier(0.22, 1, 0.36, 1)` and `@media (prefers-reduced-motion: reduce)` fallbacks.
- **Reusable Component Classes:**
  - `.cinema-card` / `.cinema-panel`: Standardized surfaces (`bg-cinema-900/90` with `border-slate-800/90`, hover elevation on `.movie-card`/`.favorite-card`, active `[data-selected="true"]` outline, and spotlight `.cinema-panel` gradient).
  - `.cinema-input` / `.cinema-label`: Unified form controls with `--color-gold-400` focus ring transitions and `[aria-invalid="true"]` error borders.
  - `.cinema-btn-primary`, `.cinema-btn-secondary`, `.cinema-btn-danger`, `.cinema-nav-link`, `.cinema-section-header`, `.cinema-alert-error`, `.cinema-alert-success`, `.cinema-badge`, `.cinema-rating-pill`, `.cinema-tabular`, `.cinema-animate-in`, `.cinema-spotlight-swap`, `.cinema-badge-pop`: Interactive controls, tabular numeric alignment, status banners, rating pills, and calibrated entry transitions.

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
│       ├── app.js                     # MovieExplorerApp composition root
│       ├── controllers.js             # Feature & form controllers (Navigation, Catalog, Details, Favorites, Reviews, Community, Auth)
│       ├── dom.js                     # DomAdapter, CancellableTimer, and safe DOM manipulation helpers
│       ├── main.js                    # Browser entry point, public ES module re-exports, and init* compatibility wrappers
│       ├── models.js                  # Movie, Review, CommunitySubmission hierarchy, and observable AppState
│       ├── validation.js              # ValidationRule, FormValidator, bounds parsers, and form validator schemas
│       └── views.js                   # CardViewFactory for safe DOM card rendering
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
| **`npm run watch:css`** | `tailwindcss -i ./src/input.css -o ./dist/output.css --watch` | Watches `index.html`, `src/input.css`, `src/js/views.js`, and `src/js/controllers.js` for changes and recompiles CSS incrementally. |
| **`npm run check:css`** | `tailwindcss -i ./src/input.css -o - --minify \| node -e ...` | Rebuilds CSS to stdout and compares it in memory with `dist/output.css`. |
| **`npm run check:js`** | `node --check src/js/dom.js && ... && node --check src/js/main.js` | Syntax-checks every ES module under `src/js/`. |
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
| **Movie Details & Rating** | `#movie-details-section`, `#movie-details`, `#rating-form` | `#details-favorite-btn`, `#details-quick-comment`, `#quick-comment-link`, `#rating-submit-btn`, `input[name="user-rating"]` | `#details-loading`, `#details-error`, `#details-poster`, `#details-title`, `#details-year`, `#details-genre`, `#details-runtime`, `#details-director`, `#details-plot`, `#details-rating`, `#details-score-badge`, `#details-vote-count`, `#rating-feedback` |
| **Audience Reviews** | `#reviews-section`, `#review-form`, `#reviews-list` | `#review-username`, `#review-rating`, `#review-text`, `#review-submit-btn`, `.review-item` | `#review-target-movie`, `#review-error`, `#review-success`, `#reviews-empty-state` |
| **Community Curation** | `#community-section`, `#community-suggestion-form`, `#problem-report-form`, `#community-submissions-list` | `#suggest-title`, `#suggest-year`, `#suggest-description`, `#suggest-reason`, `#suggest-submit-btn`, `#report-movie-title`, `#report-problem-type`, `#report-description`, `#report-submit-btn`, `.submission-card` | `#suggestion-error`, `#suggestion-feedback`, `#report-error`, `#report-feedback`, `#community-empty-state` |
| **Favorites (Watchlist)** | `#favorites-section`, `#favorites-list` | `.favorite-card`, `.remove-favorite-btn` | `#favorites-empty-state` |
| **Authentication** | `#auth-section`, `#signin-card`, `#signin-form`, `#register-card`, `#register-form` | `#signin-email`, `#signin-password`, `#signin-submit-btn`, `#go-to-register-link`, `#register-username`, `#register-email`, `#register-password`, `#register-confirm-password`, `#register-submit-btn`, `#go-to-signin-link` | `#signin-error`, `#signin-success`, `#register-error`, `#register-success` |

---

## 6. Modular OOP Architecture & Roadmap

The client application under `src/js/` follows a layered, object-oriented ES module architecture aligned with SOLID, Clean Code, and DRY/KISS:

1. **Domain Models & Observable State (`src/js/models.js`):**
   - `Movie`, `Review`, `CommunitySubmission` (`MovieSuggestion`, `ProblemReport`), and observable `AppState` encapsulate domain invariants, defensive copies, and `subscribe()` event notifications (`movieSelected`, `movieRated`, `favoritesChanged`).
2. **Declarative Validation (`src/js/validation.js`):**
   - `ValidationRule` and `FormValidator` enforce pure schema checks with shared integer-range parsing (`parseIntegerInRange`) and reusable rule factories (`SIGN_IN_VALIDATOR`, `REGISTER_VALIDATOR`, `REVIEW_VALIDATOR`, `SUGGESTION_VALIDATOR`, `REPORT_VALIDATOR`).
3. **DOM Adapter & Timer Abstraction (`src/js/dom.js`):**
   - `DomAdapter` and `CancellableTimer` invert direct `document` and timeout dependencies so views and controllers are testable in isolation without global DOM state.
4. **Presentation Views & Feature Controllers (`src/js/views.js`, `src/js/controllers.js`):**
   - `CardViewFactory` constructs card DOM trees safely via `textContent`; dedicated controllers (`NavigationController`, `CatalogController`, `MovieDetailsController`, `FavoritesController`, `ReviewsController`, `CommunityController`, `AuthController`, and `ValidatedFormController`) coordinate user interactions and `AppState` subscriptions with `aria-invalid` / `aria-describedby` error linking.
5. **Composition Root & Public Facade (`src/js/app.js`, `src/js/main.js`):**
   - `MovieExplorerApp` wires dependencies cleanly without circular hooks; `src/js/main.js` re-exports all classes and backward-compatible `init*` helpers and mounts automatically in browser environments.

---

## 7. Engineering & Accessibility Standards

- **Keyboard Navigation & Focus Management:** Includes a high-contrast skip link (`Skip to main content`) and explicit `:focus-visible` ring styles on primary navigation links, action buttons, and 1–10 rating pills.
- **Screen Reader Support:** Asynchronous status containers use `role="status"`, `role="alert"`, and `aria-live="polite"` so dynamic state transitions are announced non-intrusively.
- **Semantic Form Grouping:** Multi-option controls (such as the 1–10 movie rating selector) use native `<fieldset>` and `<legend>` elements paired with explicit `<label>` associations.
- **Graceful Asset Degradation:** Movie cards support both vector/raster `<img>` posters with `loading="lazy"` and a pure CSS archival fallback state (`role="img"`) when poster artwork is unavailable.
- **Content Security Policy & XSS Prevention:** `index.html` declares a strict `<meta http-equiv="Content-Security-Policy">` (`default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self';`), and `src/js/main.js` writes dynamic text solely through `textContent`.
