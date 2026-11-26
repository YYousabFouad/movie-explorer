/**
 * Application composition root wiring domain state, DOM adapter, views, and feature controllers.
 */

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
import { AppState } from "./models.js";
import { CardViewFactory } from "./views.js";

/**
 * Top-level orchestrator composing and mounting all Movie Explorer feature controllers.
 */
export class MovieExplorerApp {
  #state;
  #dom;
  #views;
  #controllers;

  /**
   * @param {{ state?: AppState, doc?: Document | null }} [options]
   */
  constructor({ state = new AppState(), doc = globalThis.document } = {}) {
    this.#state = state;
    this.#dom = new DomAdapter(doc);
    this.#views = new CardViewFactory(this.#dom);
    this.#controllers = Object.freeze({
      navigation: new NavigationController({ dom: this.#dom }),
      catalog: new CatalogController({ state: this.#state, dom: this.#dom }),
      details: new MovieDetailsController({ state: this.#state, dom: this.#dom }),
      favorites: new FavoritesController({
        state: this.#state,
        dom: this.#dom,
        views: this.#views,
      }),
      reviews: new ReviewsController({
        state: this.#state,
        dom: this.#dom,
        views: this.#views,
      }),
      community: new CommunityController({ dom: this.#dom, views: this.#views }),
      auth: new AuthController({ dom: this.#dom }),
    });
  }

  /** @returns {AppState} */
  get state() {
    return this.#state;
  }

  /** @returns {Readonly<Record<string, object>>} */
  get controllers() {
    return this.#controllers;
  }

  /**
   * Mount every feature controller against the configured document.
   * @returns {this}
   */
  mount() {
    if (!this.#dom.isAvailable) return this;
    for (const controller of Object.values(this.#controllers)) {
      controller.mount();
    }
    return this;
  }
}
