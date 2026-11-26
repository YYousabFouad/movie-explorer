/**
 * Pure presentation card factory converting domain models into DOM elements.
 */

import { DomAdapter } from "./dom.js";
import { Review } from "./models.js";

const SUBMISSION_KIND_CLASSES = Object.freeze({
  suggestion: "font-semibold text-amber-300",
  report: "font-semibold text-rose-300",
});

/**
 * Builds reusable cinema card elements using safe text assignment.
 */
export class CardViewFactory {
  #dom;

  /**
   * @param {DomAdapter} [dom]
   */
  constructor(dom = new DomAdapter()) {
    this.#dom = dom;
  }

  /**
   * Build a watchlist favorite movie card element.
   * @param {import("./models.js").Movie} movie
   * @returns {HTMLElement}
   */
  createFavoriteCard(movie) {
    const media = this.#dom.createElement(
      "div",
      "relative aspect-[2/3] w-full overflow-hidden bg-cinema-950",
      [
        this.#dom.createElement(
          "img",
          "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
          "",
          {
            src: movie.posterOrFallback,
            alt: `Poster for ${movie.title}`,
            width: 400,
            height: 600,
            decoding: "async",
            loading: "lazy",
          },
        ),
        this.#dom.createElement("span", "cinema-badge absolute top-3 left-3 text-amber-300", "Saved"),
      ],
    );

    const metadata = this.#dom.createElement("div", "", [
      this.#dom.createElement(
        "p",
        "cinema-tabular text-xs text-slate-400",
        `${movie.year} • ${movie.genreLabel}`,
      ),
      this.#dom.createElement("h3", "mt-1 text-base font-bold text-white", movie.title),
    ]);

    const actions = this.#dom.createElement(
      "div",
      "mt-4 flex flex-col gap-2 border-t border-slate-800 pt-3",
      [
        this.#dom.createElement(
          "a",
          "view-details-btn cinema-btn-secondary w-full text-slate-200",
          "View Details",
          {
            href: "#movie-details-section",
            "data-movie-id": movie.id,
          },
        ),
        this.#dom.createElement(
          "button",
          "remove-favorite-btn cinema-btn-danger",
          "Remove from Favorites",
          {
            type: "button",
            "data-movie-id": movie.id,
            "aria-label": `Remove ${movie.title} from favorites`,
          },
        ),
      ],
    );

    const body = this.#dom.createElement("div", "flex flex-1 flex-col justify-between p-4", [
      metadata,
      actions,
    ]);

    return this.#dom.createElement(
      "article",
      "favorite-card cinema-card cinema-animate-in group flex flex-col overflow-hidden",
      [media, body],
      { "data-movie-id": movie.id },
    );
  }

  /**
   * Build an audience review card element.
   * @param {Review | { username: string, rating: number | string, reviewText: string, movieTitle: string }} reviewInput
   * @returns {HTMLElement}
   */
  createReviewCard(reviewInput) {
    const review = reviewInput instanceof Review ? reviewInput : new Review(reviewInput);
    const avatar = this.#dom.createElement(
      "div",
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-300 ring-1 ring-amber-400/40",
      review.initials,
      { "aria-hidden": "true" },
    );
    const authorDetails = this.#dom.createElement("div", "min-w-0", [
      this.#dom.createElement("h4", "truncate text-sm font-bold text-white", review.username),
      this.#dom.createElement("time", "text-xs text-slate-400", review.formattedDate, {
        datetime: review.isoDate,
      }),
    ]);
    const header = this.#dom.createElement("div", "flex items-center justify-between gap-4", [
      this.#dom.createElement("div", "flex items-center gap-3", [avatar, authorDetails]),
      this.#dom.createElement(
        "span",
        "cinema-tabular shrink-0 rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30",
        review.ratingBadgeText,
      ),
    ]);

    return this.#dom.createElement(
      "article",
      "review-item cinema-card cinema-animate-in min-w-0 space-y-3 p-5",
      [
        header,
        this.#dom.createElement(
          "p",
          "text-xs font-semibold break-words text-amber-300",
          review.movieTitle,
        ),
        this.#dom.createElement(
          "p",
          "text-sm leading-relaxed break-words text-slate-300",
          review.reviewText,
        ),
      ],
    );
  }

  /**
   * Build a community submission card element from a suggestion or report model.
   * @param {import("./models.js").CommunitySubmission} submission
   * @returns {HTMLElement}
   */
  createSubmissionCard(submission) {
    const kindClass =
      SUBMISSION_KIND_CLASSES[submission.kind] ??
      submission.kindClass ??
      SUBMISSION_KIND_CLASSES.suggestion;
    const statusRow = this.#dom.createElement(
      "div",
      "flex flex-wrap items-center justify-between gap-2 text-xs",
      [
        this.#dom.createElement("span", kindClass, submission.kindLabel),
        this.#dom.createElement(
          "span",
          "font-medium text-amber-200",
          submission.statusLabel ?? "Status: Pending",
        ),
      ],
    );
    const topSection = this.#dom.createElement("div", "min-w-0 space-y-2.5", [
      statusRow,
      this.#dom.createElement("h4", "text-base font-bold break-words text-white", submission.title),
      submission.detailLabel
        ? this.#dom.createElement(
            "p",
            "text-xs font-semibold break-words text-amber-200",
            submission.detailLabel,
          )
        : null,
      this.#dom.createElement(
        "p",
        "text-xs leading-relaxed break-words text-slate-300",
        submission.summaryText,
      ),
    ]);
    const footerRow = this.#dom.createElement(
      "div",
      "cinema-tabular flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400",
      [
        this.#dom.createElement("span", "", submission.submittedLabel ?? "Submitted just now"),
        this.#dom.createElement(
          "span",
          "font-medium text-slate-300",
          submission.commentsLabel ?? "0 comments",
        ),
      ],
    );

    return this.#dom.createElement(
      "article",
      "submission-card cinema-card cinema-animate-in flex min-w-0 flex-col justify-between space-y-4 p-5",
      [topSection, footerRow],
    );
  }
}
