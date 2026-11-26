/**
 * Movie Explorer Community — client entry point and public ES module facade.
 * Re-exports OOP domain models, validators, DOM adapters, views, controllers, and app root,
 * alongside backward-compatible init* helpers used by existing unit tests.
 */

import { MovieExplorerApp } from "./app.js";
import {
  AuthController,
  CatalogController,
  CommunityController,
  FavoritesController,
  MovieDetailsController,
  NavigationController,
  ReviewsController,
} from "./controllers.js";
import { DomAdapter } from "./dom.js";
import { createAppState } from "./models.js";

export { MovieExplorerApp } from "./app.js";
export {
  AuthController,
  CatalogController,
  CommunityController,
  FavoritesController,
  MovieDetailsController,
  NavigationController,
  ReviewsController,
  ValidatedFormController,
} from "./controllers.js";
export {
  CancellableTimer,
  DomAdapter,
  clearFieldErrors,
  escapeSelectorValue,
  markFieldInvalid,
  movieSelector,
  readMovieId,
  replayAnimation,
  showBanner,
} from "./dom.js";
export {
  AppState,
  CommunitySubmission,
  MOVIE_CATALOG,
  Movie,
  MovieSuggestion,
  ProblemReport,
  Review,
  createAppState,
  createArchivalPosterUri,
} from "./models.js";
export {
  EMAIL_PATTERN,
  FormValidator,
  MAX_DESCRIPTION_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_PROSE_LENGTH,
  MAX_RATING,
  MAX_RELEASE_YEAR,
  MAX_REVIEW_NAME_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_PROSE_LENGTH,
  MIN_RATING,
  MIN_RELEASE_YEAR,
  MIN_USERNAME_LENGTH,
  REGISTER_VALIDATOR,
  REPORT_VALIDATOR,
  REVIEW_VALIDATOR,
  SIGN_IN_VALIDATOR,
  SUGGESTION_VALIDATOR,
  ValidationRule,
  parseIntegerInRange,
  validateRegister,
  validateReport,
  validateReview,
  validateSignIn,
  validateSuggestion,
} from "./validation.js";
export { CardViewFactory } from "./views.js";

/**
 * Initialize header navigation highlighting and scroll-spy behavior.
 * @returns {NavigationController}
 */
export function initNavigation() {
  return new NavigationController({ dom: new DomAdapter() }).mount();
}

/**
 * Initialize live catalog search and genre filtering.
 * @param {import("./models.js").AppState} state
 * @returns {CatalogController}
 */
export function initCatalog(state) {
  return new CatalogController({ state, dom: new DomAdapter() }).mount();
}

/**
 * Initialize spotlight switching, live 1-10 ratings, and quick-comment handoff.
 * @param {import("./models.js").AppState} state
 * @param {{ syncFavoriteButton?: () => void }} [hooks]
 * @returns {{ selectMovie: (movieId: string) => import("./models.js").Movie | null }}
 */
export function initMovieDetails(state, hooks = {}) {
  const controller = new MovieDetailsController({
    state,
    dom: new DomAdapter(),
    hooks,
  }).mount();
  return { selectMovie: (movieId) => controller.selectMovie(movieId) };
}

/**
 * Initialize favorites watchlist toggling, cards, empty state, and nav badge sync.
 * @param {import("./models.js").AppState} state
 * @param {{ onSelectMovie?: (movieId: string) => void }} [hooks]
 * @returns {{ syncFavoriteButton: () => void }}
 */
export function initFavorites(state, hooks = {}) {
  const controller = new FavoritesController({
    state,
    dom: new DomAdapter(),
    hooks,
  }).mount();
  return { syncFavoriteButton: () => controller.syncFavoriteButton() };
}

/**
 * Initialize audience review submission and dynamic review list updates.
 * @param {import("./models.js").AppState} [state]
 * @returns {ReviewsController}
 */
export function initReviews(state = createAppState()) {
  return new ReviewsController({ state, dom: new DomAdapter() }).mount();
}

/**
 * Initialize community movie suggestion and problem report forms.
 * @returns {CommunityController}
 */
export function initCommunity() {
  return new CommunityController({ dom: new DomAdapter() }).mount();
}

/**
 * Initialize local demo sign-in and account registration validation.
 * @returns {AuthController}
 */
export function initAuth() {
  return new AuthController({ dom: new DomAdapter() }).mount();
}

// Bootstrap automatically in browser environments while keeping Node test imports side-effect free.
if (typeof document !== "undefined") {
  new MovieExplorerApp().mount();
}
