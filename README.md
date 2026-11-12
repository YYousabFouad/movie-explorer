# Movie Explorer Community

![HTML5](https://img.shields.io/badge/HTML5-Semantic_Markup-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B_Ready-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Accessibility](https://img.shields.io/badge/A11y-WCAG_AA_%2F_ARIA-10B981?style=flat-square)

A dark, cinema-inspired frontend platform foundation for **Movie Explorer Community**, engineered with semantic **HTML5**, **Tailwind CSS v4**, and a strict **DOM selector contract** designed for modular Vanilla JavaScript integration.

> [!IMPORTANT]
> **Architectural Scope:** This repository delivers the **Presentation Layer & DOM Contract** (`index.html`, `src/input.css`, `dist/output.css`) alongside modular client-side ES modules (`src/js/`). Navigation scroll-spy, demo authentication validation, and static-form submit guards are wired; search, rating, reviews, community submissions, and favorites remain static UI prototypes (disabled until their controllers and API layer are implemented).

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
| **Application Logic** | Vanilla JavaScript (`ES6+`) | Initialized entry module (`src/js/main.js`) for OOP controllers, Fetch API, and DOM state |
| **Visual Assets** | Custom SVG + CSS Fallbacks | Vector cinema posters (`2:3` aspect ratio) and pure CSS archival placeholder cards |

### Design Tokens & Component Primitives (`src/input.css`)

The visual system is defined using Tailwind CSS v4's CSS-first `@theme` directive and `@layer components` abstractions:

- **Surface Palette (`cinema-*`):** Deep slate-navy surfaces (`--color-cinema-950: #070a12` through `--color-cinema-700: #263352`) engineered for high contrast and low eye strain.
- **Accent Palette (`gold-*`):** Warm cinema gold highlights (`--color-gold-400: #fbbf24` through `--color-gold-600: #d97706`) used for ratings, primary calls-to-action, and keyboard focus rings.
- **Reusable Component Classes:**
  - `.cinema-card`: Standardized surface, border (`rgba(51, 65, 85, 0.65)`), and `1rem` border radius for movie and review cards.
  - `.cinema-panel`: Elevated container styling (`--color-cinema-850`) for primary spotlight and form sections.
  - `.cinema-input`: Unified form control styling with deterministic focus ring transitions (`--color-gold-400`).

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

- **Node.js:** `v18.0.0` or higher recommended
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
| **`npm run watch:css`** | `tailwindcss -i ./src/input.css -o ./dist/output.css --watch` | Watches `index.html` and `src/` for changes and recompiles CSS incrementally. |
| **`npm run check:css`** | `tailwindcss -i ./src/input.css -o /tmp/movie-explorer-check.css --minify && cmp /tmp/movie-explorer-check.css dist/output.css` | Rebuilds CSS to a temp file and `cmp`s it with `dist/output.css`. |
| **`npm run check:js`** | `node --check src/js/main.js` | Syntax-checks `src/js/main.js`. |
| **`npm test`** | `node --test tests/main.test.js` | Runs the unit and contract test suite using Node's built-in test runner. |
| **`npm run check`** | `npm run check:js && npm run check:css && npm test` | Runs JS syntax check, CSS freshness check, and the full test suite. |

### Running the Application Locally

Serve the repository over HTTP so the browser can load ES modules (`<script type="module">`; opening `index.html` via `file://` is blocked by browser CORS rules for module scripts):

```bash
npx serve .
# or
python3 -m http.server
```

---

## 5. DOM Contract Specification

All dynamic regions in `index.html` expose stable, deterministic IDs and class hooks to decouple markup structure from JavaScript business logic.

| Functional Domain | Primary Containers & Forms | Interactive Controls & Inputs | State & Feedback Selectors |
| :--- | :--- | :--- | :--- |
| **Header & Navigation** | `#main-header`<br>`#brand-logo` | `#nav-search`, `#nav-details`<br>`#nav-community`, `#nav-favorites`<br>`#nav-signin-btn`, `#nav-register-btn` | `#nav-favorites-count` |
| **Search & Discovery** | `#search-section`<br>`#search-form`<br>`#search-results-section`<br>`#search-results` | `#search-input`<br>`#search-genre`<br>`#search-submit-btn`<br>`.movie-card`, `.view-details-btn` | `#search-results-summary`<br>`#search-loading`<br>`#search-error`, `#search-error-message`<br>`#search-no-results` |
| **Movie Details & Rating** | `#movie-details-section`<br>`#movie-details`<br>`#rating-form` | `#details-favorite-btn`<br>`#details-quick-comment`<br>`#rating-submit-btn`<br>`input[name="user-rating"]` | `#details-loading`, `#details-error`<br>`#details-poster`, `#details-title`<br>`#details-year`, `#details-genre`<br>`#details-runtime`, `#details-director`<br>`#details-plot`, `#details-rating`<br>`#details-vote-count`, `#rating-feedback` |
| **Audience Reviews** | `#reviews-section`<br>`#review-form`<br>`#reviews-list` | `#review-username`<br>`#review-rating`<br>`#review-text`<br>`#review-submit-btn` | `#review-target-movie`<br>`#review-error`, `#review-success`<br>`#reviews-empty-state` |
| **Community Curation** | `#community-section`<br>`#community-suggestion-form`<br>`#problem-report-form`<br>`#community-submissions-list` | `#suggest-title`, `#suggest-year`<br>`#suggest-description`, `#suggest-reason`<br>`#suggest-submit-btn`<br>`#report-movie-title`, `#report-problem-type`<br>`#report-description`, `#report-submit-btn` | `#suggestion-feedback`<br>`#report-feedback`<br>`#community-empty-state` |
| **Favorites (Watchlist)** | `#favorites-section`<br>`#favorites-list` | `.favorite-card`<br>`.remove-favorite-btn` | `#favorites-empty-state` |
| **Authentication** | `#auth-section`<br>`#signin-card`, `#signin-form`<br>`#register-card`, `#register-form` | `#signin-email`, `#signin-password`<br>`#signin-submit-btn`, `#go-to-register-link`<br>`#register-username`, `#register-email`<br>`#register-password`, `#register-confirm-password`<br>`#register-submit-btn`, `#go-to-signin-link` | `#signin-error`, `#signin-success`<br>`#register-error`, `#register-success` |

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
   - Validate user payloads prior to submission, prevent default page reloads (`event.preventDefault()`), and populate accessible feedback containers (`#review-error`, `#signin-error`, `#register-error`).

---

## 7. Engineering & Accessibility Standards

- **Keyboard Navigation & Focus Management:** Includes a high-contrast skip link (`Skip to main content`) and explicit `:focus-visible` ring styles across all interactive elements.
- **Screen Reader Support:** Asynchronous status containers use `role="status"`, `role="alert"`, and `aria-live="polite"` so dynamic state transitions are announced non-intrusively.
- **Semantic Form Grouping:** Multi-option controls (such as the 1–10 movie rating selector) use native `<fieldset>` and `<legend>` elements paired with explicit `<label>` associations.
- **Graceful Asset Degradation:** Movie cards support both vector/raster `<img>` posters with `loading="lazy"` and a pure CSS archival fallback state (`role="img"`) when poster artwork is unavailable.
