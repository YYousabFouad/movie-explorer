/**
 * Feature controllers coordinating DOM interactions, domain state, and views.
 */

import {
  CancellableTimer,
  DomAdapter,
  clearFieldErrors,
  markFieldInvalid,
  movieSelector,
  readMovieId,
  replayAnimation,
  showBanner,
} from "./dom.js";
import { MovieSuggestion, ProblemReport, Review, createAppState } from "./models.js";
import {
  validateRegister,
  validateReport,
  validateReview,
  validateSignIn,
  validateSuggestion,
} from "./validation.js";
import { CardViewFactory } from "./views.js";

const ACTIVE_NAV_CLASSES = ["bg-amber-400/10", "text-amber-400"];
const SCROLL_SPY_OPTIONS = { root: null, rootMargin: "-25% 0px -65% 0px", threshold: 0 };
const CLICK_SCROLL_LOCK_MS = 650;
const AUTH_HIDE_DELAY_MS = 1000;
const AUTH_REVEAL_LINK_IDS = [
  "nav-signin-btn",
  "nav-register-btn",
  "go-to-register-link",
  "go-to-signin-link",
];

const DETAIL_TEXT_BINDINGS = {
  "details-title": (movie) => movie.title,
  "details-year": (movie) => String(movie.year),
  "details-genre": (movie) => movie.genreLabel,
  "details-runtime": (movie) => movie.runtime,
  "details-director": (movie) => movie.director,
  "details-plot": (movie) => movie.plot,
  "details-score-badge": (movie) => movie.formattedRating,
  "details-vote-count": (movie) => movie.voteSummary,
  "review-target-movie": (movie) => movie.titleWithYear,
};

/**
 * Controller managing accessible validation, error linking, and reset for a single form.
 */
export class ValidatedFormController {
  #dom;
  #formId;
  #errorId;
  #successId;
  #fieldIds;
  #validate;
  #successMessage;
  #onSuccess;
  #onInvalid;

  /**
   * @param {{
   *   dom?: DomAdapter,
   *   formId: string,
   *   errorId: string,
   *   successId: string,
   *   fieldIds: Record<string, string>,
   *   validate: (payload: Record<string, unknown>) => { isValid: boolean, message: string, field: string | null },
   *   successMessage?: string,
   *   onSuccess?: (payload: Record<string, string>) => void,
   *   onInvalid?: (result: { isValid: boolean, message: string, field: string | null }, payload: Record<string, string>) => void,
   * }} config
   */
  constructor({
    dom = new DomAdapter(),
    formId,
    errorId,
    successId,
    fieldIds,
    validate,
    successMessage = "",
    onSuccess = () => {},
    onInvalid = () => {},
  }) {
    this.#dom = dom;
    this.#formId = formId;
    this.#errorId = errorId;
    this.#successId = successId;
    this.#fieldIds = fieldIds;
    this.#validate = validate;
    this.#successMessage = successMessage;
    this.#onSuccess = onSuccess;
    this.#onInvalid = onInvalid;
  }

  /**
   * Bind submit listener when all required form, banner, and field elements exist.
   * @returns {this}
   */
  mount() {
    const form = this.#dom.byId(this.#formId);
    const errorBanner = this.#dom.byId(this.#errorId);
    const successBanner = this.#dom.byId(this.#successId);
    const fields = Object.fromEntries(
      Object.entries(this.#fieldIds).map(([fieldKey, elementId]) => [
        fieldKey,
        this.#dom.byId(elementId),
      ]),
    );

    if (!form || !errorBanner || !successBanner || Object.values(fields).some((element) => !element)) {
      return this;
    }

    form.addEventListener("submit", (event) => {
      this.#handleSubmit(event, form, errorBanner, successBanner, fields);
    });
    return this;
  }

  #handleSubmit(event, form, errorBanner, successBanner, fields) {
    event.preventDefault();
    errorBanner.classList.add("hidden");
    successBanner.classList.add("hidden");
    clearFieldErrors(Object.values(fields));

    const payload = Object.fromEntries(
      Object.entries(fields).map(([fieldKey, input]) => [fieldKey, input.value ?? ""]),
    );
    const result = this.#validate(payload);

    if (!result.isValid) {
      this.#onInvalid(result, payload);
      showBanner(errorBanner, result.message);
      if (result.field && fields[result.field]) {
        markFieldInvalid(fields[result.field], this.#errorId);
      }
      return;
    }

    this.#onSuccess(payload);
    showBanner(successBanner, this.#successMessage);
    form.reset();
  }
}

/**
 * Controller managing header navigation highlighting and IntersectionObserver scroll-spy.
 */
export class NavigationController {
  #dom;
  #scrollLock = new CancellableTimer();

  /**
   * @param {{ dom?: DomAdapter }} [options]
   */
  constructor({ dom = new DomAdapter() } = {}) {
    this.#dom = dom;
  }

  /**
   * Bind click listeners and section intersection observers for navigation links.
   * @returns {this}
   */
  mount() {
    const navLinks = this.#dom.queryAll(".cinema-nav-link");
    if (!navLinks.length) return this;

    const sectionToLink = new Map();
    const observer = this.#createScrollObserver(navLinks, sectionToLink);

    for (const link of navLinks) {
      this.#bindNavLink(link, navLinks, sectionToLink, observer);
    }
    return this;
  }

  #createScrollObserver(navLinks, sectionToLink) {
    if (typeof IntersectionObserver !== "function") return null;

    return new IntersectionObserver((entries) => {
      if (this.#scrollLock.isPending) return;
      const hit = entries
        .filter((entry) => entry.isIntersecting && sectionToLink.has(entry.target))
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (hit) this.#setActiveLink(navLinks, sectionToLink.get(hit.target));
    }, SCROLL_SPY_OPTIONS);
  }

  #bindNavLink(link, navLinks, sectionToLink, observer) {
    link.addEventListener("click", () => {
      this.#setActiveLink(navLinks, link);
      // Pause scroll-spy updates while smooth scrolling traverses intermediate sections.
      this.#scrollLock.schedule(() => {}, CLICK_SCROLL_LOCK_MS);
    });

    const href = link.getAttribute("href");
    const section =
      href?.startsWith("#") && href.length > 1 ? this.#dom.byId(href.slice(1)) : null;
    if (section && observer) {
      sectionToLink.set(section, link);
      observer.observe(section);
    }
  }

  #setActiveLink(navLinks, selectedLink) {
    if (selectedLink.getAttribute?.("aria-current") === "location") return;
    for (const link of navLinks) {
      link.classList.remove(...ACTIVE_NAV_CLASSES);
      link.removeAttribute("aria-current");
    }
    selectedLink.classList.add(...ACTIVE_NAV_CLASSES);
    selectedLink.setAttribute("aria-current", "location");
  }
}

/**
 * Controller managing live search query and genre filtering over catalog movie cards.
 */
export class CatalogController {
  #state;
  #dom;
  #searchInput = null;
  #genreSelect = null;
  #resultsGrid = null;
  #summary = null;
  #emptyState = null;
  #entries = [];
  #lastSummaryText = "";

  /**
   * @param {{ state: import("./models.js").AppState, dom?: DomAdapter }} options
   */
  constructor({ state, dom = new DomAdapter() }) {
    this.#state = state;
    this.#dom = dom;
  }

  /**
   * Cache catalog DOM elements and attach search/genre filter listeners.
   * @returns {this}
   */
  mount() {
    const form = this.#dom.byId("search-form");
    this.#searchInput = this.#dom.byId("search-input");
    this.#genreSelect = this.#dom.byId("search-genre");
    this.#resultsGrid = this.#dom.byId("search-results");
    this.#summary = this.#dom.byId("search-results-summary");
    this.#emptyState = this.#dom.byId("search-no-results");

    if (!form || !this.#searchInput || !this.#genreSelect || !this.#resultsGrid) {
      return this;
    }

    this.#entries = [...this.#resultsGrid.querySelectorAll(".movie-card")].map((card) => [
      card,
      this.#state.getMovie(readMovieId(card)),
    ]);
    this.#lastSummaryText = this.#summary?.textContent ?? "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.applyFilter();
    });
    this.#searchInput.addEventListener("input", () => this.applyFilter());
    this.#genreSelect.addEventListener("change", () => this.applyFilter());
    return this;
  }

  /**
   * Apply current search query and genre criteria across catalog cards.
   * @returns {void}
   */
  applyFilter() {
    if (!this.#resultsGrid) return;
    const query = (this.#searchInput?.value ?? "").trim().toLowerCase();
    const genre = (this.#genreSelect?.value ?? "").trim().toLowerCase();
    let visibleCount = 0;

    for (const [card, movie] of this.#entries) {
      const visible = movie?.matchesFilter(query, genre) ?? false;
      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    }

    this.#resultsGrid.classList.toggle("hidden", visibleCount === 0);
    this.#emptyState?.classList.toggle("hidden", visibleCount > 0);
    this.#updateSummary(visibleCount, query, genre);
  }

  #updateSummary(visibleCount, query, genre) {
    if (!this.#summary) return;
    const totalCount = this.#entries.length;
    const nextSummary =
      visibleCount === totalCount && !query && !genre
        ? `Showing all ${totalCount} curated films in the catalog.`
        : `Showing ${visibleCount} of ${totalCount} curated films.`;

    if (nextSummary !== this.#lastSummaryText) {
      this.#summary.textContent = nextSummary;
      this.#lastSummaryText = nextSummary;
    }
  }
}

/**
 * Controller managing spotlight details, live 1-10 ratings, and quick-comment transfer.
 */
export class MovieDetailsController {
  #state;
  #dom;
  #hooks;
  #detailsPanel = null;
  #poster = null;
  #scoreBadge = null;
  #voteCount = null;
  #ratingForm = null;
  #ratingFeedback = null;
  #quickComment = null;
  #detailNodes = [];
  #unsubscribe = null;

  /**
   * @param {{
   *   state: import("./models.js").AppState,
   *   dom?: DomAdapter,
   *   hooks?: { syncFavoriteButton?: () => void },
   * }} options
   */
  constructor({ state, dom = new DomAdapter(), hooks = {} }) {
    this.#state = state;
    this.#dom = dom;
    this.#hooks = hooks;
  }

  /**
   * Cache spotlight elements, subscribe to state updates, and bind interactions.
   * @returns {this}
   */
  mount() {
    this.#detailsPanel = this.#dom.byId("movie-details");
    this.#poster = this.#dom.byId("details-poster");
    this.#scoreBadge = this.#dom.byId("details-score-badge");
    this.#voteCount = this.#dom.byId("details-vote-count");
    this.#ratingForm = this.#dom.byId("rating-form");
    this.#ratingFeedback = this.#dom.byId("rating-feedback");
    this.#quickComment = this.#dom.byId("details-quick-comment");
    this.#detailNodes = Object.entries(DETAIL_TEXT_BINDINGS).map(([id, format]) => [
      this.#dom.byId(id),
      format,
    ]);

    this.#unsubscribe?.();
    this.#unsubscribe = this.#state.subscribe((event) => {
      if (event.type === "movieSelected") {
        this.#renderMovie(event.movie);
        this.#hooks.syncFavoriteButton?.();
      } else if (event.type === "movieRated") {
        this.#renderRatingUpdate(event.movie, event.score);
      }
    });

    this.#bindEvents();
    return this;
  }

  /**
   * Select a catalog movie in state to update the spotlight panel.
   * @param {string} movieId
   * @returns {import("./models.js").Movie | null}
   */
  selectMovie(movieId) {
    return this.#state.selectMovie(movieId);
  }

  #bindEvents() {
    this.#dom.byId("search-results")?.addEventListener("click", (event) => {
      const movieId = readMovieId(event.target?.closest?.(".view-details-btn"));
      if (movieId) this.selectMovie(movieId);
    });

    this.#ratingForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const checkedInput = this.#ratingForm.querySelector?.('input[name="user-rating"]:checked');
      this.#state.rateActiveMovie(Number(checkedInput?.value));
    });

    this.#dom.byId("quick-comment-link")?.addEventListener("click", () => {
      this.#transferQuickComment();
    });
  }

  #renderMovie(movie) {
    if (!movie) return;

    if (this.#poster) {
      this.#poster.src = movie.posterOrFallback;
      this.#poster.alt = `Poster for ${movie.title}`;
    }
    for (const [node, format] of this.#detailNodes) {
      if (node) node.textContent = format(movie);
    }
    if (this.#quickComment) {
      this.#quickComment.placeholder = `What stood out to you in ${movie.title}?`;
    }

    this.#ratingFeedback?.classList.add("hidden");
    this.#syncCardSelection(movie.id);
    replayAnimation(this.#detailsPanel, "cinema-spotlight-swap");
  }

  #renderRatingUpdate(movie, score) {
    if (!movie) return;

    if (this.#scoreBadge) this.#scoreBadge.textContent = movie.formattedRating;
    if (this.#voteCount) this.#voteCount.textContent = movie.voteSummary;
    const badge = this.#dom.query(
      movieSelector("#search-results .movie-card", movie.id, " .cinema-badge"),
    );
    if (badge) badge.textContent = movie.badgeText;
    if (this.#ratingFeedback) {
      showBanner(this.#ratingFeedback, `Recorded your ${score}/10 rating for ${movie.title}.`);
    }
  }

  #syncCardSelection(activeId) {
    for (const card of this.#dom.queryAll("#search-results .movie-card")) {
      card.setAttribute("data-selected", String(readMovieId(card) === activeId));
    }
  }

  #transferQuickComment() {
    const draft = (this.#quickComment?.value ?? "").trim();
    const reviewText = this.#dom.byId("review-text");
    const reviewUser = this.#dom.byId("review-username");

    if (draft && reviewText) {
      reviewText.value = draft;
      if (this.#quickComment) this.#quickComment.value = "";
    }
    if (reviewUser && !(reviewUser.value ?? "").trim()) {
      reviewUser.focus();
      return;
    }
    reviewText?.focus();
  }
}

/**
 * Controller synchronizing the spotlight favorite button, watchlist grid, empty state, and nav badge.
 */
export class FavoritesController {
  #state;
  #dom;
  #views;
  #hooks;
  #favoriteBtn = null;
  #favoritesList = null;
  #emptyState = null;
  #countBadge = null;
  #unsubscribe = null;

  /**
   * @param {{
   *   state: import("./models.js").AppState,
   *   dom?: DomAdapter,
   *   views?: CardViewFactory,
   *   hooks?: { onSelectMovie?: (movieId: string) => void },
   * }} options
   */
  constructor({ state, dom = new DomAdapter(), views = new CardViewFactory(dom), hooks = {} }) {
    this.#state = state;
    this.#dom = dom;
    this.#views = views;
    this.#hooks = hooks;
  }

  /**
   * Bind watchlist controls and subscribe to state transitions.
   * @returns {this}
   */
  mount() {
    this.#favoriteBtn = this.#dom.byId("details-favorite-btn");
    this.#favoritesList = this.#dom.byId("favorites-list");
    this.#emptyState = this.#dom.byId("favorites-empty-state");
    this.#countBadge = this.#dom.byId("nav-favorites-count");

    this.#unsubscribe?.();
    this.#unsubscribe = this.#state.subscribe((event) => {
      if (event.type === "movieSelected") {
        this.syncFavoriteButton();
      } else if (event.type === "favoritesChanged") {
        this.#handleFavoritesChanged(event);
      }
    });

    this.#bindEvents();
    this.syncFavoriteButton();
    return this;
  }

  /**
   * Sync the spotlight favorite toggle button label and aria-pressed state.
   * @returns {void}
   */
  syncFavoriteButton() {
    if (!this.#favoriteBtn) return;
    const isSaved = this.#state.isFavorite();
    this.#favoriteBtn.setAttribute("aria-pressed", String(isSaved));
    this.#favoriteBtn.textContent = isSaved ? "♥ Saved in Favorites" : "♥ Add to Favorites";
  }

  #bindEvents() {
    this.#favoriteBtn?.addEventListener("click", () => {
      this.#state.toggleFavorite();
    });

    this.#favoritesList?.addEventListener("click", (event) => {
      const removeId = readMovieId(event.target?.closest?.(".remove-favorite-btn"));
      if (removeId) {
        this.#state.removeFavorite(removeId);
        return;
      }
      const detailsId = readMovieId(event.target?.closest?.(".view-details-btn"));
      if (!detailsId) return;
      if (this.#hooks.onSelectMovie) {
        this.#hooks.onSelectMovie(detailsId);
        return;
      }
      this.#state.selectMovie(detailsId);
    });
  }

  #handleFavoritesChanged(event) {
    if (event.isFavorite && event.movie) {
      const existing = this.#favoritesList?.querySelector?.(
        movieSelector(".favorite-card", event.movie.id),
      );
      if (!existing) {
        this.#favoritesList?.appendChild(this.#views.createFavoriteCard(event.movie));
      }
    } else if (!event.isFavorite && event.movieId) {
      this.#favoritesList
        ?.querySelector?.(movieSelector(".favorite-card", event.movieId))
        ?.remove();
    }
    this.#syncFavoritesMeta();
  }

  #syncFavoritesMeta() {
    if (this.#countBadge) {
      this.#countBadge.textContent = String(this.#state.favoritesCount);
      replayAnimation(this.#countBadge, "cinema-badge-pop");
    }
    this.#emptyState?.classList.toggle("hidden", this.#state.favoritesCount > 0);
    this.syncFavoriteButton();
  }
}

/**
 * Controller managing audience review form submission and live card rendering.
 */
export class ReviewsController {
  #state;
  #dom;
  #views;
  #reviewsList = null;
  #emptyState = null;

  /**
   * @param {{
   *   state?: import("./models.js").AppState,
   *   dom?: DomAdapter,
   *   views?: CardViewFactory,
   * }} [options]
   */
  constructor({ state = createAppState(), dom = new DomAdapter(), views = new CardViewFactory(dom) } = {}) {
    this.#state = state;
    this.#dom = dom;
    this.#views = views;
  }

  /**
   * Bind the audience review form controller.
   * @returns {this}
   */
  mount() {
    this.#reviewsList = this.#dom.byId("reviews-list");
    this.#emptyState = this.#dom.byId("reviews-empty-state");

    new ValidatedFormController({
      dom: this.#dom,
      formId: "review-form",
      errorId: "review-error",
      successId: "review-success",
      fieldIds: {
        username: "review-username",
        rating: "review-rating",
        reviewText: "review-text",
      },
      validate: validateReview,
      successMessage: "Your review has been added to the discussion!",
      onSuccess: (payload) => this.#appendReview(payload),
    }).mount();

    return this;
  }

  #appendReview(payload) {
    const movie = this.#state?.activeMovie;
    if (!movie) return;
    const review = new Review({ ...payload, movieTitle: movie.titleWithYear });
    this.#reviewsList?.prepend(this.#views.createReviewCard(review));
    this.#emptyState?.classList.add("hidden");
  }
}

/**
 * Controller managing community movie suggestions and problem report submissions.
 */
export class CommunityController {
  #dom;
  #views;
  #submissionsList = null;
  #emptyState = null;

  /**
   * @param {{ dom?: DomAdapter, views?: CardViewFactory }} [options]
   */
  constructor({ dom = new DomAdapter(), views = new CardViewFactory(dom) } = {}) {
    this.#dom = dom;
    this.#views = views;
  }

  /**
   * Bind both community contribution forms and submission list updates.
   * @returns {this}
   */
  mount() {
    this.#submissionsList = this.#dom.byId("community-submissions-list");
    this.#emptyState = this.#dom.byId("community-empty-state");

    new ValidatedFormController({
      dom: this.#dom,
      formId: "community-suggestion-form",
      errorId: "suggestion-error",
      successId: "suggestion-feedback",
      fieldIds: {
        title: "suggest-title",
        year: "suggest-year",
        description: "suggest-description",
        reason: "suggest-reason",
      },
      validate: validateSuggestion,
      successMessage: "Movie suggestion submitted! Our community moderators will review it shortly.",
      onSuccess: (payload) => this.#prependSubmission(new MovieSuggestion(payload)),
    }).mount();

    new ValidatedFormController({
      dom: this.#dom,
      formId: "problem-report-form",
      errorId: "report-error",
      successId: "report-feedback",
      fieldIds: {
        movieTitle: "report-movie-title",
        problemType: "report-problem-type",
        description: "report-description",
      },
      validate: validateReport,
      successMessage: "Problem report logged! Thank you for helping keep our catalog accurate.",
      onSuccess: (payload) => this.#prependSubmission(new ProblemReport(payload)),
    }).mount();

    return this;
  }

  #prependSubmission(submission) {
    this.#submissionsList?.prepend(this.#views.createSubmissionCard(submission));
    this.#emptyState?.classList.add("hidden");
  }
}

/**
 * Controller managing local demo sign-in, registration forms, and timed section hiding.
 */
export class AuthController {
  #dom;
  #hideTimer = new CancellableTimer();

  /**
   * @param {{ dom?: DomAdapter }} [options]
   */
  constructor({ dom = new DomAdapter() } = {}) {
    this.#dom = dom;
  }

  /**
   * Bind auth reveal links and validated sign-in/registration forms.
   * @returns {this}
   */
  mount() {
    for (const id of AUTH_REVEAL_LINK_IDS) {
      this.#dom.byId(id)?.addEventListener("click", () => this.showAuthSection());
    }

    new ValidatedFormController({
      dom: this.#dom,
      formId: "signin-form",
      errorId: "signin-error",
      successId: "signin-success",
      fieldIds: { email: "signin-email", password: "signin-password" },
      validate: validateSignIn,
      successMessage:
        "Demo sign-in validated locally (no data was sent). Welcome back to Movie Explorer Community.",
      onSuccess: () => this.#scheduleHide(),
      onInvalid: () => this.#hideTimer.cancel(),
    }).mount();

    new ValidatedFormController({
      dom: this.#dom,
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
      successMessage:
        "Demo account validated locally (no account was created or sent). Welcome to Movie Explorer Community.",
      onSuccess: () => this.#scheduleHide(),
      onInvalid: () => this.#hideTimer.cancel(),
    }).mount();

    return this;
  }

  /**
   * Cancel any pending hide timer and reveal the authentication section.
   * @returns {void}
   */
  showAuthSection() {
    this.#hideTimer.cancel();
    this.#dom.byId("auth-section")?.classList.remove("hidden");
  }

  #scheduleHide() {
    const authSection = this.#dom.byId("auth-section");
    if (!authSection) return;
    this.#hideTimer.schedule(() => authSection.classList.add("hidden"), AUTH_HIDE_DELAY_MS);
  }
}
