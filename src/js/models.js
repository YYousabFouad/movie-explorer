/**
 * Domain entities, catalog fixtures, and observable application state store.
 */

import { MAX_RATING, MIN_RATING, parseIntegerInRange } from "./validation.js";

const SAFE_POSTER_PREFIXES = ["./", "/", "https://", "data:image/svg+xml;charset=utf-8,"];

function isSafePosterUrl(url) {
  return typeof url === "string" && SAFE_POSTER_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function escapeXml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generate a safe inline SVG archival placeholder poster data URI.
 * @param {{ title: string, subtitle: string }} options
 * @returns {string}
 */
export function createArchivalPosterUri({ title, subtitle }) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const svgMarkup =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#0d1322"/><stop offset="100%" stop-color="#070a12"/>' +
    '</linearGradient></defs><rect width="400" height="600" fill="url(#g)"/>' +
    '<rect x="28" y="28" width="344" height="544" fill="none" stroke="#334155" stroke-width="2" rx="12"/>' +
    '<text x="200" y="260" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="3" text-anchor="middle">POSTER PENDING</text>' +
    `<text x="200" y="302" fill="#f1f5f9" font-family="sans-serif" font-size="24" font-weight="700" text-anchor="middle">${safeTitle}</text>` +
    `<text x="200" y="338" fill="#fbbf24" font-family="sans-serif" font-size="14" text-anchor="middle">${safeSubtitle}</text>` +
    "</svg>";
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

const GLASS_LABYRINTH_POSTER = createArchivalPosterUri({
  title: "The Glass Labyrinth",
  subtitle: "Archival Restoration • 2022",
});

/**
 * Domain entity encapsulating metadata, search indexing, and ratings for a movie.
 */
export class Movie {
  #searchIndex;

  /**
   * @param {{
   *   id: string,
   *   title: string,
   *   year: number,
   *   genres?: string[],
   *   genreLabel: string,
   *   runtime: string,
   *   director: string,
   *   rating: number,
   *   votes: number,
   *   poster: string,
   *   plot: string,
   * }} data
   */
  constructor({
    id,
    title,
    year,
    genres = [],
    genreLabel,
    runtime,
    director,
    rating,
    votes,
    poster,
    plot,
  }) {
    this.id = id;
    this.title = title;
    this.year = year;
    this.genres = Object.freeze([...genres]);
    this.genreLabel = genreLabel;
    this.runtime = runtime;
    this.director = director;
    this.rating = Number(rating);
    this.votes = Number(votes);
    this.poster = isSafePosterUrl(poster) ? poster : "";
    this.plot = plot;
    this.#searchIndex = `${this.title} ${this.director} ${this.genreLabel} ${this.year}`.toLowerCase();
  }

  /** @returns {string} */
  get formattedRating() {
    return this.rating.toFixed(1);
  }

  /** @returns {string} */
  get badgeText() {
    return `★ ${this.formattedRating}`;
  }

  /** @returns {string} */
  get voteSummary() {
    return `${this.formattedRating} / 10 from ${this.votes.toLocaleString("en-US")} ratings`;
  }

  /** @returns {string} */
  get titleWithYear() {
    return `${this.title} (${this.year})`;
  }

  /** @returns {string} */
  get posterOrFallback() {
    return (
      this.poster ||
      createArchivalPosterUri({
        title: this.title,
        subtitle: `Archival Edition • ${this.year}`,
      })
    );
  }

  /**
   * Determine whether this movie matches a free-text query and optional genre filter.
   * @param {string} [query]
   * @param {string} [genre]
   * @returns {boolean}
   */
  matchesFilter(query = "", genre = "") {
    const normalizedGenre = String(genre ?? "").trim().toLowerCase();
    if (normalizedGenre && !this.genres.includes(normalizedGenre)) return false;

    const normalizedQuery = String(query ?? "").trim().toLowerCase();
    if (!normalizedQuery) return true;
    return this.#searchIndex.includes(normalizedQuery);
  }

  /**
   * Apply a 1-10 integer user rating to the weighted community average.
   * @param {number | string} score
   * @returns {boolean}
   */
  recordRating(score) {
    const validScore = parseIntegerInRange(score, MIN_RATING, MAX_RATING);
    if (validScore === null) return false;
    this.rating = Number(((this.rating * this.votes + validScore) / (this.votes + 1)).toFixed(1));
    this.votes += 1;
    return true;
  }

  /**
   * Create an independent copy of this Movie instance.
   * @returns {Movie}
   */
  clone() {
    return new Movie(this);
  }
}

export const MOVIE_CATALOG = Object.freeze([
  new Movie({
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
  }),
  new Movie({
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
  }),
  new Movie({
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
  }),
  new Movie({
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
  }),
  new Movie({
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
  }),
]);

/**
 * Domain entity representing a validated audience review for a film.
 */
export class Review {
  /**
   * @param {{
   *   username: string,
   *   rating: number | string,
   *   reviewText: string,
   *   movieTitle: string,
   *   createdAt?: Date | string | number,
   * }} data
   */
  constructor({ username, rating, reviewText, movieTitle, createdAt = new Date() }) {
    this.username = String(username ?? "").trim();
    this.rating = Number(rating);
    this.reviewText = String(reviewText ?? "").trim();
    this.movieTitle = String(movieTitle ?? "");
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  /** @returns {string} */
  get initials() {
    const letters = this.username
      .split(/\s+/)
      .slice(0, 2)
      .map((namePart) => namePart[0]?.toUpperCase() ?? "")
      .join("");
    return letters || "ME";
  }

  /** @returns {string} */
  get ratingBadgeText() {
    return `★ ${this.rating} / 10`;
  }

  /** @returns {string} */
  get isoDate() {
    return this.createdAt.toISOString().slice(0, 10);
  }

  /** @returns {string} */
  get formattedDate() {
    return this.createdAt.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

/**
 * Base domain entity for community catalog contributions.
 */
export class CommunitySubmission {
  /**
   * @param {{
   *   kind: string,
   *   kindLabel: string,
   *   title: string,
   *   detailLabel?: string,
   *   summaryText: string,
   *   statusLabel?: string,
   *   submittedLabel?: string,
   *   commentsLabel?: string,
   * }} data
   */
  constructor({
    kind,
    kindLabel,
    title,
    detailLabel = "",
    summaryText,
    statusLabel = "Status: Pending",
    submittedLabel = "Submitted just now",
    commentsLabel = "0 comments",
  }) {
    this.kind = kind;
    this.kindLabel = kindLabel;
    this.title = title;
    this.detailLabel = detailLabel;
    this.summaryText = summaryText;
    this.statusLabel = statusLabel;
    this.submittedLabel = submittedLabel;
    this.commentsLabel = commentsLabel;
  }
}

/**
 * Community submission proposing a missing film for the catalog.
 */
export class MovieSuggestion extends CommunitySubmission {
  /**
   * @param {{
   *   title: string,
   *   year?: string | number,
   *   description?: string,
   *   reason: string,
   * }} payload
   */
  constructor({ title, year = "", description = "", reason }) {
    const cleanTitle = String(title ?? "").trim();
    const cleanYear = String(year ?? "").trim();
    const cleanDescription = String(description ?? "").trim();
    const cleanReason = String(reason ?? "").trim();

    super({
      kind: "suggestion",
      kindLabel: "Movie Suggestion",
      title: cleanYear ? `${cleanTitle} (${cleanYear})` : cleanTitle,
      detailLabel: cleanDescription ? `Synopsis: ${cleanDescription}` : "",
      summaryText: `Reason: ${cleanReason}`,
    });
  }
}

/**
 * Community submission reporting inaccurate metadata or broken assets.
 */
export class ProblemReport extends CommunitySubmission {
  static PROBLEM_LABELS = Object.freeze({
    "incorrect-metadata": "Incorrect Release Year, Cast, or Genre",
    "missing-poster": "Missing or Low-Resolution Poster",
    "plot-error": "Inaccurate Plot Overview or Spoiler",
    "duplicate-entry": "Duplicate Catalog Entry",
    other: "Other Data Issue",
  });

  /**
   * @param {{
   *   movieTitle: string,
   *   problemType: string,
   *   description: string,
   * }} payload
   */
  constructor({ movieTitle, problemType, description }) {
    super({
      kind: "report",
      kindLabel: "Problem Report",
      title: String(movieTitle ?? "").trim(),
      detailLabel: ProblemReport.PROBLEM_LABELS[problemType] ?? ProblemReport.PROBLEM_LABELS.other,
      summaryText: String(description ?? "").trim(),
    });
  }
}

/**
 * Observable store encapsulating catalog movies, active spotlight selection, and favorites.
 */
export class AppState {
  #movies;
  #activeMovieId;
  #favorites;
  #listeners = new Set();

  /**
   * @param {Movie[]} [catalog]
   * @param {string} [initialActiveId]
   * @param {string[]} [initialFavorites]
   */
  constructor(
    catalog = MOVIE_CATALOG,
    initialActiveId = "dune-horizon",
    initialFavorites = ["dune-horizon", "solaris-echo"],
  ) {
    this.#movies = new Map(
      (catalog ?? []).filter(Boolean).map((entry) => {
        const movie = entry instanceof Movie ? entry.clone() : new Movie(entry);
        return [movie.id, movie];
      }),
    );
    this.#activeMovieId = this.#movies.has(initialActiveId)
      ? initialActiveId
      : (this.#movies.keys().next().value ?? null);
    this.#favorites = new Set((initialFavorites ?? []).filter((id) => this.#movies.has(id)));
  }

  /**
   * Defensive copy of catalog movies keyed by movie ID.
   * @returns {Map<string, Movie>}
   */
  get movies() {
    return new Map(this.#movies);
  }

  /**
   * Defensive copy of saved favorite movie IDs.
   * @returns {Set<string>}
   */
  get favorites() {
    return new Set(this.#favorites);
  }

  /** @returns {string | null} */
  get activeMovieId() {
    return this.#activeMovieId;
  }

  /** @param {string} movieId */
  set activeMovieId(movieId) {
    if (this.#movies.has(movieId)) {
      this.#activeMovieId = movieId;
    }
  }

  /** @returns {Movie | null} */
  get activeMovie() {
    return this.#movies.get(this.#activeMovieId) ?? null;
  }

  /** @returns {number} */
  get favoritesCount() {
    return this.#favorites.size;
  }

  /**
   * Look up a movie by ID.
   * @param {string} movieId
   * @returns {Movie | null}
   */
  getMovie(movieId) {
    return this.#movies.get(movieId) ?? null;
  }

  /**
   * Return catalog movies matching the given query and genre filter.
   * @param {string} [query]
   * @param {string} [genre]
   * @returns {Movie[]}
   */
  filterMovies(query = "", genre = "") {
    return [...this.#movies.values()].filter((movie) => movie.matchesFilter(query, genre));
  }

  /**
   * Select a catalog movie as active and notify subscribers.
   * @param {string} movieId
   * @returns {Movie | null}
   */
  selectMovie(movieId) {
    const movie = this.getMovie(movieId);
    if (!movie) return null;
    this.#activeMovieId = movie.id;
    this.#emit({ type: "movieSelected", movie });
    return movie;
  }

  /**
   * Check whether a movie ID is currently saved in favorites.
   * @param {string | null} [movieId]
   * @returns {boolean}
   */
  isFavorite(movieId = this.#activeMovieId) {
    return this.#favorites.has(movieId);
  }

  /**
   * Add a movie to favorites if present in the catalog and not yet saved.
   * @param {string | null} [movieId]
   * @returns {Movie | null}
   */
  addFavorite(movieId = this.#activeMovieId) {
    const movie = this.getMovie(movieId);
    if (!movie || this.#favorites.has(movie.id)) return null;
    this.#favorites.add(movie.id);
    this.#emit({ type: "favoritesChanged", movieId: movie.id, movie, isFavorite: true });
    return movie;
  }

  /**
   * Remove a movie from favorites and notify subscribers if changed.
   * @param {string} movieId
   * @returns {boolean}
   */
  removeFavorite(movieId) {
    const removed = this.#favorites.delete(movieId);
    if (removed) {
      this.#emit({
        type: "favoritesChanged",
        movieId,
        movie: this.getMovie(movieId),
        isFavorite: false,
      });
    }
    return removed;
  }

  /**
   * Toggle a movie's saved status in favorites.
   * @param {string | null} [movieId]
   * @returns {{ isFavorite: boolean, movie: Movie | null }}
   */
  toggleFavorite(movieId = this.#activeMovieId) {
    if (this.isFavorite(movieId)) {
      const movie = this.getMovie(movieId);
      this.removeFavorite(movieId);
      return { isFavorite: false, movie };
    }
    const addedMovie = this.addFavorite(movieId);
    return { isFavorite: Boolean(addedMovie), movie: addedMovie };
  }

  /**
   * Record a rating against the active spotlight movie and notify subscribers.
   * @param {number | string} score
   * @returns {boolean}
   */
  rateActiveMovie(score) {
    const movie = this.activeMovie;
    if (!movie?.recordRating(score)) return false;
    this.#emit({ type: "movieRated", movie, score: Number(score) });
    return true;
  }

  /**
   * Subscribe to state transition events and receive an unsubscribe callback.
   * @param {(event: { type: string, [key: string]: unknown }) => void} listener
   * @returns {() => void}
   * @throws {TypeError} When listener is not a function.
   */
  subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("State listener must be a function.");
    }
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emit(event) {
    for (const listener of this.#listeners) {
      listener(event);
    }
  }
}

/**
 * Factory helper creating a fresh default AppState instance.
 * @returns {AppState}
 */
export const createAppState = () => new AppState();
