# Movie Explorer Community

A dark cinema-inspired static frontend foundation for **Movie Explorer
Community**, built exclusively with semantic **HTML5** and **Tailwind CSS v4**.

> **Important Note:** This repository currently provides the **static visual
> interface only**. No JavaScript functionality has been implemented yet. All
> buttons, forms, rating controls, and hidden state containers are structured
> and ready so that you can implement the interactive behavior yourself using
> Vanilla JavaScript.

---

## 1. Project Overview

**Movie Explorer Community** is a single-page movie discovery and discussion
interface where film enthusiasts can:

- Search for movies by title, keyword, or genre.
- Inspect detailed movie synopses, release years, genres, directors, and
  community ratings.
- Rate movies on a 1–10 scale and publish audience reviews.
- Participate in catalog curation by suggesting missing movies or reporting
  metadata issues.
- Maintain a personal watchlist of saved favorite movies.
- Sign in or register for a community member account.

---

## 2. Planned Features

When you add your JavaScript application layer, you will connect the existing
static UI to support:

- **Live Movie Search & Filtering:** Querying a movie API (or local dataset)
  and rendering matching movie cards inside `#search-results`.
- **Asynchronous UI States:** Toggling loading spinners (`#search-loading`,
  `#details-loading`), error alerts (`#search-error`, `#details-error`), and
  empty states (`#search-no-results`, `#favorites-empty-state`).
- **Dynamic Movie Details Panel:** Populating `#movie-details` when a user
  clicks a movie card's "View Movie Details" action.
- **User Ratings & Reviews:** Handling submissions on `#rating-form` and
  `#review-form` and dynamically updating `#reviews-list`.
- **Community Contributions:** Validating and appending entries from
  `#community-suggestion-form` and `#problem-report-form` into
  `#community-submissions-list`.
- **Favorites Management:** Adding and removing movies in `#favorites-list` and
  updating the `#nav-favorites-count` badge.
- **Form Validation & Authentication Simulation:** Validating inputs on
  `#signin-form` and `#register-form` and displaying feedback banners.

---

## 3. Learning Objectives

This static foundation is specifically designed so you can practice and master
core JavaScript concepts on your own:

- **Object-Oriented Programming (OOP) & ES6 Classes:** Designing clean models
  and UI controllers (e.g., movie entities, favorites manager, form
  validators).
- **Fetch API & AJAX:** Making asynchronous HTTP requests to external movie
  endpoints.
- **Promises & `async` / `await`:** Managing asynchronous control flow cleanly.
- **DOM Manipulation & Event Delegation:** Selecting elements, rendering
  dynamic templates, toggling CSS classes (`hidden`), and handling form/click
  events.
- **Error Handling:** Gracefully catching network failures, invalid responses,
  and form validation errors and presenting accessible feedback to the user.

---

## 4. Technologies Used

- **HTML5:** Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`,
  `<article>`, `<footer>`), accessible forms, `<fieldset>` / `<legend>` rating
  controls, and ARIA live regions.
- **Tailwind CSS v4 (`@tailwindcss/cli`):** Local CSS build pipeline using
  CSS-first `@theme` customization and utility classes.
- **SVG Artwork:** Custom local cinema poster illustrations in `assets/images/`
  with consistent `2:3` poster aspect ratios, plus a pure CSS placeholder card
  for titles without poster artwork.

---

## 5. Repository Structure

```text
movie-explorer/
├── .gitignore
├── index.html          # Complete single-page static HTML5 interface
├── package.json        # Tailwind CSS CLI scripts & devDependencies
├── README.md           # Project documentation & setup guide
├── src/
│   └── input.css       # Tailwind CSS v4 entry point & theme tokens
├── dist/
│   └── output.css      # Compiled CSS stylesheet used by index.html
└── assets/
    └── images/         # Local SVG movie posters (2:3 aspect ratio)
        ├── poster-dune-horizon.svg
        ├── poster-midnight-sonata.svg
        ├── poster-neon-odyssey.svg
        └── poster-solaris-echo.svg
```

---

## 6. Installing Dependencies & Compiling Tailwind CSS

### Prerequisites

Make sure you have **Node.js** (v18 or newer recommended) and **npm** installed
on your computer.

### Step 1: Install Tailwind CSS Development Dependencies

Open a terminal in the project root directory (`movie-explorer/`) and run:

```bash
npm install
```

### Step 2: Compile the CSS Once (Production / Minified Build)

To compile `src/input.css` into `dist/output.css`, run:

```bash
npm run build:css
```

### Step 3: Watch for HTML / CSS Changes During Development

If you edit `index.html` or `src/input.css` and want Tailwind CSS to recompile
automatically whenever you save a file, run:

```bash
npm run watch:css
```

---

## 7. How to Open the HTML Interface Locally

Because `dist/output.css` is pre-compiled, you can view the interface
immediately in two ways:

1. **Direct Browser Open:** Double-click `index.html` in your file manager or
   open it directly in any modern browser (Chrome, Firefox, Edge, Safari).
2. **Local Development Server:** Use the VS Code **Live Server** extension or
   any static file server from the project directory to preview changes with
   automatic page reload.

---

## 8. Key DOM Selectors Prepared for Your JavaScript

The HTML markup uses stable, descriptive IDs and classes so you can easily hook
up your scripts later:

- **Header Navigation:**
  - `#main-header`, `#nav-search`, `#nav-community`, `#nav-favorites`
  - `#nav-favorites-count`, `#nav-signin-btn`, `#nav-register-btn`
- **Movie Search:**
  - `#search-form`, `#search-input`, `#search-genre`, `#search-submit-btn`
- **Search Results & Feedback States:**
  - `#search-results`, `#search-loading`, `#search-error`, `#search-no-results`
  - `.movie-card`, `.view-details-btn`
- **Movie Details Panel:**
  - `#movie-details`, `#details-poster`, `#details-title`, `#details-year`
  - `#details-genre`, `#details-plot`, `#details-rating`, `#details-favorite-btn`
  - `#details-loading`, `#details-error`
- **User Rating Form:**
  - `#rating-form`, `#rating-submit-btn`, `#rating-feedback`
- **Reviews & Comments:**
  - `#review-form`, `#review-username`, `#review-rating`, `#review-text`
  - `#review-submit-btn`, `#review-error`, `#review-success`
  - `#reviews-list`, `#reviews-empty-state`
- **Community Section:**
  - `#community-suggestion-form`, `#problem-report-form`
  - `#community-submissions-list`, `#community-empty-state`
  - `#suggestion-feedback`, `#report-feedback`
- **Favorites Section:**
  - `#favorites-list`, `#favorites-empty-state`
  - `.favorite-card`, `.remove-favorite-btn`
- **Sign In & Registration:**
  - `#signin-form`, `#signin-email`, `#signin-password`
  - `#signin-error`, `#signin-success`
  - `#register-form`, `#register-username`, `#register-email`
  - `#register-password`, `#register-confirm-password`
  - `#register-error`, `#register-success`
