/**
 * Movie Explorer Community — client entry point (ES module).
 * Pure validation functions and interactive DOM controllers are exported for testing.
 */

// ---------------------------------------------------------------------------
// Catalog Data
// ---------------------------------------------------------------------------
const GLASS_LABYRINTH_POSTER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#0d1322"/><stop offset="100%" stop-color="#070a12"/>' +
    '</linearGradient></defs><rect width="400" height="600" fill="url(#g)"/>' +
    '<rect x="28" y="28" width="344" height="544" fill="none" stroke="#334155" stroke-width="2" rx="12"/>' +
    '<text x="200" y="260" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="3" text-anchor="middle">POSTER PENDING</text>' +
    '<text x="200" y="302" fill="#f1f5f9" font-family="sans-serif" font-size="24" font-weight="700" text-anchor="middle">The Glass Labyrinth</text>' +
    '<text x="200" y="338" fill="#fbbf24" font-family="sans-serif" font-size="14" text-anchor="middle">Archival Restoration • 2022</text>' +
    "</svg>",
)}`;

export const MOVIE_CATALOG = [
  {
    id: "dune-horizon",
    title: "Chronicles of the Dune Horizon",
    year: 2025,
    genres: ["sci-fi", "adventure"],
    genreLabel: "Sci-Fi • Adventure",
    runtime: "154 min",
    director: "Elena Vance-Kovacs",
    rating: 8.9,
    votes: 1420,
    poster: "./assets/images/poster-dune-horizon.svg",
    plot: "Across the scorched meridian of a tidally locked desert world, cartographer Cassian Vale discovers an ancient acoustic beacon buried beneath shifting silicate dunes. When rival orbital syndicates move to silence the transmission, Vale must unite nomadic horizon-striders to decode a planetary warning that predates human spaceflight.",
  },
  {
    id: "midnight-sonata",
    title: "Midnight Sonata in Vienna",
    year: 2024,
    genres: ["mystery", "drama"],
    genreLabel: "Mystery • Drama",
    runtime: "128 min",
    director: "Lukas Steiner",
    rating: 8.4,
    votes: 960,
    poster: "./assets/images/poster-midnight-sonata.svg",
    plot: "During a snowbound winter festival in Vienna, a concert violinist discovers a cipher hidden inside a century-old score. Tracking the manuscript across rehearsal halls and archives, she uncovers an unsolved disappearance tied to the conservatory.",
  },
  {
    id: "neon-odyssey",
    title: "Neon Odyssey: Protocol Nine",
    year: 2026,
    genres: ["sci-fi", "thriller"],
    genreLabel: "Sci-Fi • Thriller",
    runtime: "136 min",
    director: "Kira Takahashi",
    rating: 7.9,
    votes: 1185,
    poster: "./assets/images/poster-neon-odyssey.svg",
    plot: "In a rain-slicked vertical megacity, a transit systems auditor traces a phantom routing command through nine orbital relay towers. With citywide power scheduled to reset at dawn, she must outrun corporate recovery teams to expose the override.",
  },
  {
    id: "glass-labyrinth",
    title: "The Glass Labyrinth",
    year: 2022,
    genres: ["drama", "thriller"],
    genreLabel: "Drama • Thriller",
    runtime: "119 min",
    director: "Mateusz Kowalczyk",
    rating: 8.1,
    votes: 740,
    poster: GLASS_LABYRINTH_POSTER,
    plot: "When an architectural restorer inherits an abandoned modernist conservatory, every mirrored corridor conceals forged correspondence from the 1970s. Reconstructing the original blueprints forces a reckoning between memory, authorship, and silence.",
  },
  {
    id: "solaris-echo",
    title: "Echoes of the Silent Star",
    year: 2023,
    genres: ["drama", "sci-fi"],
    genreLabel: "Drama • Sci-Fi",
    runtime: "142 min",
    director: "Nadia Okafor",
    rating: 8.6,
    votes: 830,
    poster: "./assets/images/poster-solaris-echo.svg",
    plot: "Aboard a quiet deep-space listening outpost orbiting a dying dwarf star, two telemetry engineers begin receiving harmonic echoes of their own abandoned transmissions, blurring the line between signal distortion and memory.",
  },
];

export function createAppState() {
  const movies = new Map(
    MOVIE_CATALOG.map((movie) => [
      movie.id,
      { ...movie, genres: [...movie.genres] },
    ]),
  );
  return {
    activeMovieId: "dune-horizon",
    favorites: new Set(["dune-horizon", "solaris-echo"]),
    movies,
  };
}

// ---------------------------------------------------------------------------
// Validation (pure, no DOM)
// ---------------------------------------------------------------------------
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const MIN_PROSE_LENGTH = 10;
const MIN_RELEASE_YEAR = 1888;
const MAX_RELEASE_YEAR = 2035;
// Client-side format sanity check only; the server must re-validate.
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const isFilled = (v) => typeof v === "string" && v.trim().length > 0;
const isEmail = (v) => typeof v === "string" && EMAIL_PATTERN.test(v.trim());
const hasMinTrimmedLength = (min) => (v) => typeof v === "string" && v.trim().length >= min;
const isValidRating = (v) => {
  const num = Number(v);
  return Number.isInteger(num) && num >= 1 && num <= 10;
};
const isValidOptionalYear = (v) => {
  if (!isFilled(v)) return true;
  const num = Number(v.trim());
  return Number.isInteger(num) && num >= MIN_RELEASE_YEAR && num <= MAX_RELEASE_YEAR;
};
const requiredText = (field, emptyMsg, minLength = 0, minMsg = "") => [
  [field, isFilled, emptyMsg],
  ...(minLength > 0 ? [[field, hasMinTrimmedLength(minLength), minMsg]] : []),
];

// A rule is [field, test(value, payload) => boolean, message]. The first failing rule wins.
const EMAIL_RULES = [
  ["email", isFilled, "Please enter your email address."],
  ["email", isEmail, "Please enter a valid email address."],
];
const SIGN_IN_RULES = [...EMAIL_RULES, ...requiredText("password", "Please enter your password.")];
const REGISTER_RULES = [
  ...requiredText("username", "Please enter a username.", MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters long.`),
  ...EMAIL_RULES,
  ["password", isFilled, "Please enter a password."],
  ["password", (v) => v.length >= MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`],
  ["confirmPassword", isFilled, "Please confirm your password."],
  ["confirmPassword", (v, payload) => v === payload.password, "Passwords do not match. Please verify both password entries."],
];
const REVIEW_RULES = [
  ...requiredText("username", "Please enter your display name."),
  ["rating", isValidRating, "Please select a rating between 1 and 10."],
  ...requiredText("reviewText", "Please enter your review text.", MIN_PROSE_LENGTH, `Review text must be at least ${MIN_PROSE_LENGTH} characters long.`),
];
const SUGGESTION_RULES = [
  ...requiredText("title", "Please enter a movie title."),
  ["year", isValidOptionalYear, `Release year must be between ${MIN_RELEASE_YEAR} and ${MAX_RELEASE_YEAR}.`],
  ...requiredText("reason", "Please explain why this movie should be added.", MIN_PROSE_LENGTH, `Suggestion reason must be at least ${MIN_PROSE_LENGTH} characters long.`),
];
const REPORT_RULES = [
  ...requiredText("movieTitle", "Please enter a movie title or reference ID."),
  ...requiredText("problemType", "Please select a problem type."),
  ...requiredText("description", "Please describe what needs to be corrected.", MIN_PROSE_LENGTH, `Issue description must be at least ${MIN_PROSE_LENGTH} characters long.`),
];

function validate(rules, payload) {
  const input = payload && typeof payload === "object" ? payload : {};
  for (const [field, test, message] of rules) {
    if (!test(input[field], input)) return { isValid: false, message, field };
  }
  return { isValid: true, message: "", field: null };
}

/** @param {{ email?: string, password?: string }} payload */
export const validateSignIn = (payload) => validate(SIGN_IN_RULES, payload);
/** @param {{ username?: string, email?: string, password?: string, confirmPassword?: string }} payload */
export const validateRegister = (payload) => validate(REGISTER_RULES, payload);
/** @param {{ username?: string, rating?: string | number, reviewText?: string }} payload */
export const validateReview = (payload) => validate(REVIEW_RULES, payload);
/** @param {{ title?: string, year?: string, reason?: string }} payload */
export const validateSuggestion = (payload) => validate(SUGGESTION_RULES, payload);
/** @param {{ movieTitle?: string, problemType?: string, description?: string }} payload */
export const validateReport = (payload) => validate(REPORT_RULES, payload);

// ---------------------------------------------------------------------------
// Shared DOM Helpers
// ---------------------------------------------------------------------------
const getMovieId = (node) =>
  node?.getAttribute?.("data-movie-id") ?? node?.dataset?.movieId ?? null;

function el(tag, className = "", content = "", attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (Array.isArray(content)) node.append(...content.filter(Boolean));
  else if (content !== "" && content !== null && content !== undefined) node.textContent = String(content);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function replayAnimation(target, className) {
  if (!target?.classList) return;
  target.classList.remove(className);
  if ("offsetWidth" in target) void target.offsetWidth;
  target.classList.add(className);
}

function showBanner(banner, message) {
  if (message) banner.textContent = message;
  banner.classList.remove("hidden");
}

function clearFieldErrors(fields) {
  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  });
}

function markFieldInvalid(field, errorId) {
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", errorId);
  field.focus();
}

/**
 * Bind a validated form with accessible error linking and shared submit flow.
 * @param {object} config
 */
function bindValidatedForm({
  formId,
  errorId,
  successId,
  fieldIds,
  validate: validatePayload,
  successMessage = "",
  onSuccess = () => {},
  onInvalid = () => {},
}) {
  const form = document.getElementById(formId);
  const errorBanner = document.getElementById(errorId);
  const successBanner = document.getElementById(successId);
  const fields = Object.fromEntries(
    Object.entries(fieldIds).map(([k, id]) => [k, document.getElementById(id)]),
  );

  if (!form || !errorBanner || !successBanner || Object.values(fields).some((n) => !n)) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorBanner.classList.add("hidden");
    successBanner.classList.add("hidden");
    clearFieldErrors(Object.values(fields));

    const payload = Object.fromEntries(
      Object.entries(fields).map(([k, input]) => [k, input.value ?? ""]),
    );
    const result = validatePayload(payload);
    if (!result.isValid) {
      onInvalid(result, payload);
      showBanner(errorBanner, result.message);
      if (result.field && fields[result.field]) markFieldInvalid(fields[result.field], errorId);
      return;
    }

    onSuccess(payload);
    showBanner(successBanner, successMessage);
    form.reset();
  });
}

// ---------------------------------------------------------------------------
// Navigation (click highlight + scroll-spy)
// ---------------------------------------------------------------------------
const ACTIVE_NAV_CLASSES = ["bg-amber-400/10", "text-amber-400"];
const SCROLL_SPY_OPTIONS = { root: null, rootMargin: "-25% 0px -65% 0px", threshold: 0 };
// Ignore scroll-spy while a click-triggered smooth scroll passes intermediate sections.
const CLICK_SCROLL_LOCK_MS = 650;

function setActiveNavLink(navLinks, selectedLink) {
  navLinks.forEach((link) => {
    link.classList.remove(...ACTIVE_NAV_CLASSES);
    link.removeAttribute("aria-current");
  });
  selectedLink.classList.add(...ACTIVE_NAV_CLASSES);
  // In-page hash links mark a section within the document rather than a separate page.
  selectedLink.setAttribute("aria-current", "location");
}

export function initNavigation() {
  const navLinks = document.querySelectorAll(".cinema-nav-link");
  if (!navLinks.length) return;

  const sectionToLink = new Map();
  let lockTimer = null;
  const observer =
    typeof IntersectionObserver === "function" ?
      new IntersectionObserver((entries) => {
        if (lockTimer !== null) return;
        const hit = entries.find((e) => e.isIntersecting && sectionToLink.has(e.target));
        if (hit) setActiveNavLink(navLinks, sectionToLink.get(hit.target));
      }, SCROLL_SPY_OPTIONS)
    : null;

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNavLink(navLinks, link);
      if (lockTimer !== null) clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        lockTimer = null;
      }, CLICK_SCROLL_LOCK_MS);
    });

    const href = link.getAttribute("href");
    // Resolve #id via getElementById so invalid CSS selectors cannot throw.
    const section = href?.startsWith("#") && href.length > 1 ? document.getElementById(href.slice(1)) : null;
    if (section && observer) {
      sectionToLink.set(section, link);
      observer.observe(section);
    }
  });
}

// ---------------------------------------------------------------------------
// Catalog Filtering (#search-form + #search-results)
// ---------------------------------------------------------------------------
function matchesCatalogFilter(movie, query, genre) {
  if (!movie) return false;
  if (genre && !movie.genres.includes(genre)) return false;
  if (!query) return true;
  return `${movie.title} ${movie.director} ${movie.genreLabel} ${movie.year}`.toLowerCase().includes(query);
}

/** @param {ReturnType<typeof createAppState>} state */
export function initCatalog(state) {
  const form = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const genreSelect = document.getElementById("search-genre");
  const resultsGrid = document.getElementById("search-results");
  const summary = document.getElementById("search-results-summary");
  const emptyState = document.getElementById("search-no-results");

  if (!form || !searchInput || !genreSelect || !resultsGrid) return;

  const cards = [...resultsGrid.querySelectorAll(".movie-card")];
  const totalCount = cards.length;

  function applyFilter() {
    const query = (searchInput.value ?? "").trim().toLowerCase();
    const genre = (genreSelect.value ?? "").trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const visible = matchesCatalogFilter(state.movies.get(getMovieId(card)), query, genre);
      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });

    resultsGrid.classList.toggle("hidden", visibleCount === 0);
    emptyState?.classList.toggle("hidden", visibleCount > 0);
    if (summary) {
      summary.textContent =
        visibleCount === totalCount && !query && !genre ?
          `Showing all ${totalCount} curated films in the catalog.`
        : `Showing ${visibleCount} of ${totalCount} curated films.`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilter();
  });
  searchInput.addEventListener("input", applyFilter);
  genreSelect.addEventListener("change", applyFilter);
}

// ---------------------------------------------------------------------------
// Movie Details & Live Rating (#movie-details-section)
// ---------------------------------------------------------------------------
const formatVoteSummary = (movie) =>
  `${movie.rating.toFixed(1)} / 10 from ${movie.votes.toLocaleString("en-US")} ratings`;

const DETAIL_TEXT_BINDINGS = {
  "details-title": (m) => m.title,
  "details-year": (m) => String(m.year),
  "details-genre": (m) => m.genreLabel,
  "details-runtime": (m) => m.runtime,
  "details-director": (m) => m.director,
  "details-plot": (m) => m.plot,
  "details-score-badge": (m) => m.rating.toFixed(1),
  "details-vote-count": formatVoteSummary,
  "review-target-movie": (m) => `${m.title} (${m.year})`,
};

function syncCardSelection(activeId) {
  document.querySelectorAll("#search-results .movie-card").forEach((card) => {
    card.setAttribute("data-selected", String(getMovieId(card) === activeId));
  });
}

/**
 * Bind spotlight switching, live 1-10 rating updates, and quick-comment handoff.
 * @param {ReturnType<typeof createAppState>} state
 * @param {{ syncFavoriteButton?: () => void }} [hooks]
 */
export function initMovieDetails(state, hooks = {}) {
  const detailsPanel = document.getElementById("movie-details");
  const poster = document.getElementById("details-poster");
  const scoreBadge = document.getElementById("details-score-badge");
  const voteCount = document.getElementById("details-vote-count");
  const ratingForm = document.getElementById("rating-form");
  const ratingFeedback = document.getElementById("rating-feedback");
  const quickComment = document.getElementById("details-quick-comment");
  const detailNodes = Object.entries(DETAIL_TEXT_BINDINGS).map(
    ([id, format]) => [document.getElementById(id), format],
  );

  function renderMovie(movieId) {
    const movie = state.movies.get(movieId);
    if (!movie) return;

    state.activeMovieId = movieId;
    if (poster) {
      poster.src = movie.poster;
      poster.alt = `Poster for ${movie.title}`;
    }
    for (const [node, format] of detailNodes) {
      if (node) node.textContent = format(movie);
    }
    if (quickComment) quickComment.placeholder = `What stood out to you in ${movie.title}?`;

    ratingFeedback?.classList.add("hidden");
    syncCardSelection(movieId);
    hooks.syncFavoriteButton?.();
    replayAnimation(detailsPanel, "cinema-spotlight-swap");
  }

  document.getElementById("search-results")?.addEventListener("click", (event) => {
    const movieId = getMovieId(event.target?.closest?.(".view-details-btn"));
    if (movieId) renderMovie(movieId);
  });

  ratingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const score = Number(ratingForm.querySelector?.('input[name="user-rating"]:checked')?.value);
    const movie = state.movies.get(state.activeMovieId);
    if (!movie || !Number.isInteger(score) || score < 1 || score > 10) return;

    movie.rating = Number(((movie.rating * movie.votes + score) / (movie.votes + 1)).toFixed(1));
    movie.votes += 1;

    if (scoreBadge) scoreBadge.textContent = movie.rating.toFixed(1);
    if (voteCount) voteCount.textContent = formatVoteSummary(movie);
    const badge = document.querySelector(`#search-results .movie-card[data-movie-id="${movie.id}"] .cinema-badge`);
    if (badge) badge.textContent = `★ ${movie.rating.toFixed(1)}`;
    if (ratingFeedback) showBanner(ratingFeedback, `Recorded your ${score}/10 rating for ${movie.title}.`);
  });

  document.getElementById("quick-comment-link")?.addEventListener("click", () => {
    const draft = (quickComment?.value ?? "").trim();
    const reviewText = document.getElementById("review-text");
    const reviewUser = document.getElementById("review-username");
    if (draft && reviewText) {
      reviewText.value = draft;
      if (quickComment) quickComment.value = "";
    }
    if (reviewUser && !(reviewUser.value ?? "").trim()) reviewUser.focus();
    else reviewText?.focus();
  });

  return { selectMovie: renderMovie };
}

// ---------------------------------------------------------------------------
// Favorites Watchlist (#favorites-section)
// ---------------------------------------------------------------------------
function createFavoriteCard(movie) {
  const media = el("div", "relative aspect-[2/3] w-full overflow-hidden bg-cinema-950", [
    el("img", "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105", "", {
      src: movie.poster,
      alt: `Poster for ${movie.title}`,
      loading: "lazy",
    }),
    el("span", "cinema-badge absolute top-3 left-3 text-amber-300", "Saved"),
  ]);
  const meta = el("div", "", [
    el("p", "cinema-tabular text-xs text-slate-400", `${movie.year} • ${movie.genreLabel}`),
    el("h3", "mt-1 text-base font-bold text-white", movie.title),
  ]);
  const actions = el("div", "mt-4 flex flex-col gap-2 border-t border-slate-800 pt-3", [
    el("a", "view-details-btn cinema-btn-secondary w-full text-slate-200", "View Details", {
      href: "#movie-details-section",
      "data-movie-id": movie.id,
    }),
    el("button", "remove-favorite-btn cinema-btn-danger", "Remove from Favorites", {
      type: "button",
      "data-movie-id": movie.id,
      "aria-label": `Remove ${movie.title} from favorites`,
    }),
  ]);
  return el(
    "article",
    "favorite-card cinema-card cinema-animate-in group flex flex-col overflow-hidden",
    [media, el("div", "flex flex-1 flex-col justify-between p-4", [meta, actions])],
    { "data-movie-id": movie.id },
  );
}

/**
 * Synchronize favorite toggle button, watchlist cards, empty state, and nav badge.
 * @param {ReturnType<typeof createAppState>} state
 * @param {{ onSelectMovie?: (movieId: string) => void }} [hooks]
 */
export function initFavorites(state, hooks = {}) {
  const favoriteBtn = document.getElementById("details-favorite-btn");
  const favoritesList = document.getElementById("favorites-list");
  const emptyState = document.getElementById("favorites-empty-state");
  const countBadge = document.getElementById("nav-favorites-count");

  function syncFavoriteButton() {
    if (!favoriteBtn) return;
    const isSaved = state.favorites.has(state.activeMovieId);
    favoriteBtn.setAttribute("aria-pressed", String(isSaved));
    favoriteBtn.textContent = isSaved ? "♥ Saved in Favorites" : "♥ Add to Favorites";
  }

  function syncFavoritesMeta() {
    if (countBadge) {
      countBadge.textContent = String(state.favorites.size);
      replayAnimation(countBadge, "cinema-badge-pop");
    }
    emptyState?.classList.toggle("hidden", state.favorites.size > 0);
    syncFavoriteButton();
  }

  function removeFavorite(movieId) {
    if (!state.favorites.has(movieId)) return;
    state.favorites.delete(movieId);
    favoritesList?.querySelector?.(`.favorite-card[data-movie-id="${movieId}"]`)?.remove();
    syncFavoritesMeta();
  }

  favoriteBtn?.addEventListener("click", () => {
    const movie = state.movies.get(state.activeMovieId);
    if (!movie) return;
    if (state.favorites.has(movie.id)) {
      removeFavorite(movie.id);
      return;
    }
    state.favorites.add(movie.id);
    favoritesList?.appendChild(createFavoriteCard(movie));
    syncFavoritesMeta();
  });

  favoritesList?.addEventListener("click", (event) => {
    const removeId = getMovieId(event.target?.closest?.(".remove-favorite-btn"));
    if (removeId) {
      removeFavorite(removeId);
      return;
    }
    const detailsId = getMovieId(event.target?.closest?.(".view-details-btn"));
    if (detailsId) hooks.onSelectMovie?.(detailsId);
  });

  syncFavoriteButton();
  return { syncFavoriteButton };
}

// ---------------------------------------------------------------------------
// Reviews & Community Submissions (#reviews-section, #community-section)
// ---------------------------------------------------------------------------
const PROBLEM_LABELS = {
  "incorrect-metadata": "Incorrect Release Year, Cast, or Genre",
  "missing-poster": "Missing or Low-Resolution Poster",
  "plot-error": "Inaccurate Plot Overview or Spoiler",
  "duplicate-entry": "Duplicate Catalog Entry",
  other: "Other Data Issue",
};

const getInitials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "ME";

function createReviewCard({ username, rating, reviewText, movieTitle }) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const header = el("div", "flex items-center justify-between gap-4", [
    el("div", "flex items-center gap-3", [
      el(
        "div",
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-300 ring-1 ring-amber-400/40",
        getInitials(username),
        { "aria-hidden": "true" },
      ),
      el("div", "", [
        el("h4", "text-sm font-bold text-white", username.trim()),
        el("time", "text-xs text-slate-400", dateLabel, { datetime: now.toISOString().slice(0, 10) }),
      ]),
    ]),
    el(
      "span",
      "cinema-tabular rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30",
      `★ ${Number(rating)} / 10`,
    ),
  ]);
  return el("article", "review-item cinema-card cinema-animate-in space-y-3 p-5", [
    header,
    el("p", "text-xs font-semibold text-amber-300", movieTitle),
    el("p", "text-sm leading-relaxed text-slate-300", reviewText.trim()),
  ]);
}

export function initReviews(state = createAppState()) {
  const reviewsList = document.getElementById("reviews-list");
  const emptyState = document.getElementById("reviews-empty-state");

  bindValidatedForm({
    formId: "review-form",
    errorId: "review-error",
    successId: "review-success",
    fieldIds: { username: "review-username", rating: "review-rating", reviewText: "review-text" },
    validate: validateReview,
    successMessage: "Your review has been added to the discussion!",
    onSuccess: (payload) => {
      const movie = state?.movies.get(state.activeMovieId);
      if (!movie) return;
      reviewsList?.prepend(createReviewCard({ ...payload, movieTitle: `${movie.title} (${movie.year})` }));
      emptyState?.classList.add("hidden");
    },
  });
}

function createSubmissionCard({ kindLabel, kindClass, title, summaryText, detailLabel = "" }) {
  const statusRow = el("div", "flex flex-wrap items-center justify-between gap-2 text-xs", [
    el("span", kindClass, kindLabel),
    el("span", "font-medium text-amber-200", "Status: Pending"),
  ]);
  const top = el("div", "space-y-2.5", [
    statusRow,
    el("h4", "text-base font-bold text-white", title),
    detailLabel ? el("p", "text-xs font-semibold text-amber-200", detailLabel) : null,
    el("p", "text-xs leading-relaxed text-slate-300", summaryText),
  ]);
  const footer = el("div", "cinema-tabular flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400", [
    el("span", "", "Submitted just now"),
    el("span", "font-medium text-slate-300", "0 comments"),
  ]);
  return el("article", "submission-card cinema-card cinema-animate-in flex flex-col justify-between space-y-4 p-5", [
    top,
    footer,
  ]);
}

export function initCommunity() {
  const list = document.getElementById("community-submissions-list");
  const emptyState = document.getElementById("community-empty-state");
  const addSubmission = (cardProps) => {
    list?.prepend(createSubmissionCard(cardProps));
    emptyState?.classList.add("hidden");
  };

  bindValidatedForm({
    formId: "community-suggestion-form",
    errorId: "suggestion-error",
    successId: "suggestion-feedback",
    fieldIds: { title: "suggest-title", year: "suggest-year", description: "suggest-description", reason: "suggest-reason" },
    validate: validateSuggestion,
    successMessage: "Movie suggestion submitted! Our community moderators will review it shortly.",
    onSuccess: ({ title, year, description, reason }) => addSubmission({
      kindLabel: "Movie Suggestion",
      kindClass: "font-semibold text-amber-300",
      title: year.trim() ? `${title.trim()} (${year.trim()})` : title.trim(),
      detailLabel: description.trim() ? `Synopsis: ${description.trim()}` : "",
      summaryText: `Reason: ${reason.trim()}`,
    }),
  });

  bindValidatedForm({
    formId: "problem-report-form",
    errorId: "report-error",
    successId: "report-feedback",
    fieldIds: { movieTitle: "report-movie-title", problemType: "report-problem-type", description: "report-description" },
    validate: validateReport,
    successMessage: "Problem report logged! Thank you for helping keep our catalog accurate.",
    onSuccess: ({ movieTitle, problemType, description }) => addSubmission({
      kindLabel: "Problem Report",
      kindClass: "font-semibold text-rose-300",
      title: movieTitle.trim(),
      detailLabel: PROBLEM_LABELS[problemType] ?? "Other Data Issue",
      summaryText: description.trim(),
    }),
  });
}

// ---------------------------------------------------------------------------
// Auth forms (demo: validated locally, nothing is sent)
// ---------------------------------------------------------------------------
const AUTH_HIDE_DELAY_MS = 1000;

export function initAuth() {
  let hideTimer = null;
  const cancelHide = () => {
    if (hideTimer === null) return;
    clearTimeout(hideTimer);
    hideTimer = null;
  };
  const showAuth = () => {
    cancelHide();
    document.getElementById("auth-section")?.classList.remove("hidden");
  };
  const scheduleHide = () => {
    const authSection = document.getElementById("auth-section");
    if (!authSection) return;
    cancelHide();
    hideTimer = setTimeout(() => {
      authSection.classList.add("hidden");
      hideTimer = null;
    }, AUTH_HIDE_DELAY_MS);
  };

  ["nav-signin-btn", "nav-register-btn", "go-to-register-link", "go-to-signin-link"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", showAuth);
  });

  bindValidatedForm({
    formId: "signin-form",
    errorId: "signin-error",
    successId: "signin-success",
    fieldIds: { email: "signin-email", password: "signin-password" },
    validate: validateSignIn,
    successMessage: "Demo sign-in validated locally (no data was sent). Welcome back to Movie Explorer Community.",
    onSuccess: scheduleHide,
    onInvalid: cancelHide,
  });

  bindValidatedForm({
    formId: "register-form",
    errorId: "register-error",
    successId: "register-success",
    fieldIds: {
      username: "register-username",
      email: "register-email",
      password: "register-password",
      confirmPassword: "register-confirm-password",
    },
    validate: validateRegister,
    successMessage: "Demo account validated locally (no account was created or sent). Welcome to Movie Explorer Community.",
    onSuccess: scheduleHide,
    onInvalid: cancelHide,
  });
}

// ---------------------------------------------------------------------------
// Bootstrap. Module scripts are deferred, so the DOM is already parsed here.
// The guard lets Node import this file for tests without a browser.
// ---------------------------------------------------------------------------
if (typeof document !== "undefined") {
  const appState = createAppState();
  initNavigation();
  initCatalog(appState);
  let favoritesApi = null;
  const detailsApi = initMovieDetails(appState, {
    syncFavoriteButton: () => favoritesApi?.syncFavoriteButton(),
  });
  favoritesApi = initFavorites(appState, {
    onSelectMovie: (movieId) => detailsApi.selectMovie(movieId),
  });
  initReviews(appState);
  initCommunity();
  initAuth();
}
