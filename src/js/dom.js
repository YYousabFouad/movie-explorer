/**
 * DOM adapter, timer utility, and accessible DOM manipulation helpers.
 */

/**
 * Manages a single active timeout handle with deterministic cancellation.
 */
export class CancellableTimer {
  #timerId = null;

  /**
   * Whether a scheduled callback is currently pending execution.
   * @returns {boolean}
   */
  get isPending() {
    return this.#timerId !== null;
  }

  /**
   * Cancel any pending scheduled callback.
   * @returns {void}
   */
  cancel() {
    if (this.#timerId === null) return;
    clearTimeout(this.#timerId);
    this.#timerId = null;
  }

  /**
   * Schedule a callback after delayMs, cancelling any prior pending timer.
   * @param {() => void} callback
   * @param {number} delayMs
   * @returns {void}
   */
  schedule(callback, delayMs) {
    this.cancel();
    this.#timerId = setTimeout(() => {
      this.#timerId = null;
      callback();
    }, delayMs);
  }
}

/**
 * Read a movie identifier from an element's data-movie-id attribute or dataset.
 * @param {Element | null | undefined} node
 * @returns {string | null}
 */
export function readMovieId(node) {
  return node?.getAttribute?.("data-movie-id") ?? node?.dataset?.movieId ?? null;
}

/**
 * Escape a value for safe interpolation into a CSS attribute selector.
 * @param {string | number} value
 * @returns {string}
 */
export function escapeSelectorValue(value) {
  return typeof globalThis.CSS?.escape === "function"
    ? globalThis.CSS.escape(String(value))
    : String(value).replace(/["\\]/g, "\\$&");
}

/**
 * Build a CSS selector targeting a movie card or control by movie ID.
 * @param {string} prefix
 * @param {string} movieId
 * @param {string} [suffix]
 * @returns {string}
 */
export function movieSelector(prefix, movieId, suffix = "") {
  return `${prefix}[data-movie-id="${escapeSelectorValue(movieId)}"]${suffix}`;
}

/**
 * Restart a CSS animation class on a target element.
 * @param {Element | null | undefined} targetElement
 * @param {string} animationClass
 * @returns {void}
 */
export function replayAnimation(targetElement, animationClass) {
  if (!targetElement?.classList) return;
  targetElement.classList.remove(animationClass);
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => targetElement.classList.add(animationClass));
    return;
  }
  targetElement.classList.add(animationClass);
}

/**
 * Reveal a status or alert banner and optionally update its text content.
 * @param {Element | null | undefined} bannerElement
 * @param {string} [message]
 * @returns {void}
 */
export function showBanner(bannerElement, message = "") {
  if (!bannerElement) return;
  if (message) bannerElement.textContent = message;
  bannerElement.classList.remove("hidden");
}

/**
 * Clear accessible error attributes across an iterable of form controls.
 * @param {Iterable<Element>} fieldElements
 * @returns {void}
 */
export function clearFieldErrors(fieldElements) {
  for (const fieldElement of fieldElements) {
    fieldElement.removeAttribute("aria-invalid");
    fieldElement.removeAttribute("aria-describedby");
  }
}

/**
 * Mark a form control as invalid, link it to its error banner, and move focus.
 * @param {HTMLElement | null | undefined} fieldElement
 * @param {string} errorBannerId
 * @returns {void}
 */
export function markFieldInvalid(fieldElement, errorBannerId) {
  if (!fieldElement) return;
  fieldElement.setAttribute("aria-invalid", "true");
  fieldElement.setAttribute("aria-describedby", errorBannerId);
  fieldElement.focus();
}

/**
 * Injectable abstraction over the browser Document API for testability and DIP.
 */
export class DomAdapter {
  #doc;

  /**
   * @param {Document | null | undefined} [doc]
   */
  constructor(doc = globalThis.document) {
    this.#doc = doc ?? null;
  }

  /**
   * Underlying document reference, if present.
   * @returns {Document | null}
   */
  get document() {
    return this.#doc;
  }

  /**
   * Whether a backing document object is available.
   * @returns {boolean}
   */
  get isAvailable() {
    return Boolean(this.#doc);
  }

  /**
   * Resolve a single element by ID.
   * @param {string} id
   * @returns {HTMLElement | null}
   */
  byId(id) {
    return this.#doc?.getElementById?.(id) ?? null;
  }

  /**
   * Resolve the first element matching a CSS selector.
   * @param {string} selector
   * @returns {Element | null}
   */
  query(selector) {
    return this.#doc?.querySelector?.(selector) ?? null;
  }

  /**
   * Resolve all elements matching a CSS selector as an Array.
   * @param {string} selector
   * @returns {Element[]}
   */
  queryAll(selector) {
    return [...(this.#doc?.querySelectorAll?.(selector) ?? [])];
  }

  /**
   * Create a DOM element safely using textContent and attribute setters.
   * @param {string} tagName
   * @param {string} [className]
   * @param {string | Array<Node | null | undefined>} [content]
   * @param {Record<string, string | number>} [attributes]
   * @returns {HTMLElement}
   * @throws {Error} When no document instance is available.
   */
  createElement(tagName, className = "", content = "", attributes = {}) {
    if (!this.#doc) {
      throw new Error("Document is required to create DOM elements.");
    }
    const element = this.#doc.createElement(tagName);
    if (className) element.className = className;

    if (Array.isArray(content)) {
      element.append(...content.filter(Boolean));
    } else if (content !== "" && content !== null && content !== undefined) {
      element.textContent = String(content);
    }

    for (const [attrName, attrValue] of Object.entries(attributes)) {
      element.setAttribute(attrName, String(attrValue));
    }
    return element;
  }
}
