import assert from "node:assert/strict";
import fs from "node:fs";
import { afterEach, describe, it } from "node:test";
import {
  AppState,
  Movie,
  createAppState,
  initAuth,
  initCatalog,
  initCommunity,
  initFavorites,
  initMovieDetails,
  initNavigation,
  initReviews,
  validateRegister,
  validateReport,
  validateReview,
  validateSignIn,
  validateSuggestion,
} from "../src/js/main.js";

function matchesSelector(el, selector) {
  if (!el || !selector) return false;
  if (selector.startsWith(".")) {
    const className = selector.slice(1).split("[")[0];
    if (!el.classList?.contains(className)) return false;
    const attr = selector.match(/\[([^\]=]+)="([^"]+)"\]/);
    return !attr || el.getAttribute(attr[1]) === attr[2];
  }
  const radio = selector.match(/input\[name="([^"]+)"\]:checked/);
  return radio
    ? el.getAttribute("name") === radio[1] && Boolean(el.checked)
    : false;
}

function createMockElement(
  id,
  { classes = [], value = "", attrs = {}, children = [] } = {},
) {
  const classSet = new Set(classes);
  const attributes = new Map(Object.entries(attrs));
  const listeners = new Map();
  const childNodes = [...children];
  const el = {
    id,
    value,
    src: attrs.src ?? "",
    alt: attrs.alt ?? "",
    placeholder: "",
    checked: false,
    textContent: "",
    focused: false,
    resetCount: 0,
    offsetWidth: 0,
    parentNode: null,
    get className() {
      return [...classSet].join(" ");
    },
    set className(val) {
      classSet.clear();
      String(val)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((t) => classSet.add(t));
    },
    classList: {
      add: (...tokens) => tokens.forEach((t) => classSet.add(t)),
      remove: (...tokens) => tokens.forEach((t) => classSet.delete(t)),
      contains: (token) => classSet.has(token),
      toggle: (token, force) => {
        const on = force !== undefined ? Boolean(force) : !classSet.has(token);
        if (on) classSet.add(token);
        else classSet.delete(token);
        return on;
      },
    },
    setAttribute: (name, val) => attributes.set(name, String(val)),
    getAttribute: (name) =>
      attributes.has(name) ? attributes.get(name) : null,
    removeAttribute: (name) => attributes.delete(name),
    focus: () => {
      el.focused = true;
    },
    reset: () => {
      el.resetCount += 1;
      el.value = "";
    },
    appendChild: (node) => {
      node.parentNode = el;
      childNodes.push(node);
      return node;
    },
    append: (...nodes) => nodes.forEach((n) => el.appendChild(n)),
    prepend: (...nodes) =>
      nodes.reverse().forEach((n) => {
        n.parentNode = el;
        childNodes.unshift(n);
      }),
    remove: () => {
      const idx = el.parentNode?.children.indexOf(el) ?? -1;
      if (idx >= 0) el.parentNode.children.splice(idx, 1);
      el.parentNode = null;
    },
    get children() {
      return childNodes;
    },
    querySelector: (sel) => {
      for (const child of childNodes) {
        const hit = matchesSelector(child, sel)
          ? child
          : child.querySelector?.(sel);
        if (hit) return hit;
      }
      return null;
    },
    querySelectorAll: (sel) =>
      childNodes.flatMap((c) => [
        ...(matchesSelector(c, sel) ? [c] : []),
        ...(c.querySelectorAll ? c.querySelectorAll(sel) : []),
      ]),
    closest: (sel) => (matchesSelector(el, sel) ? el : null),
    addEventListener: (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    dispatchEvent: (type, target = el) => {
      let defaultPrevented = false;
      const event = {
        target,
        preventDefault: () => {
          defaultPrevented = true;
        },
      };
      for (const fn of listeners.get(type) ?? []) fn(event);
      return { defaultPrevented };
    },
  };
  childNodes.forEach((c) => {
    c.parentNode = el;
  });
  return el;
}

function createMockDocument(elementsById, navLinks = [], recordedIds = null) {
  return {
    createElement: (tag) => createMockElement(tag),
    getElementById(id) {
      recordedIds?.add(id);
      return elementsById[id] ?? null;
    },
    querySelector: (sel) =>
      sel.startsWith("#search-results ")
        ? (elementsById["search-results"]?.querySelector(
            sel.slice("#search-results ".length),
          ) ?? null)
        : null,
    querySelectorAll(sel) {
      if (sel === ".cinema-nav-link") return navLinks;
      if (sel === "#search-results .movie-card")
        return (
          elementsById["search-results"]?.querySelectorAll(".movie-card") ?? []
        );
      return [];
    },
  };
}

const el = (id, opts) => createMockElement(id, opts);
const mockFields = (entries) =>
  Object.fromEntries(
    Object.entries(entries).map(([id, value]) => [
      id,
      el(id, typeof value === "string" ? { value } : value),
    ]),
  );

function createAuthDom(overrides = {}) {
  return {
    ...mockFields({
      "auth-section": {},
      "signin-form": {},
      "signin-error": { classes: ["hidden"] },
      "signin-success": { classes: ["hidden"] },
      "signin-email": "invalid",
      "signin-password": "123",
      "register-form": {},
      "register-error": { classes: ["hidden"] },
      "register-success": { classes: ["hidden"] },
      "register-username": "alex",
      "register-email": "alex@example.com",
      "register-password": "password123",
      "register-confirm-password": "password123",
    }),
    ...overrides,
  };
}

afterEach(() => {
  delete globalThis.document;
  delete globalThis.IntersectionObserver;
});

describe("validateSignIn", () => {
  it("accepts valid email and non-empty password", () => {
    assert.deepEqual(
      validateSignIn({ email: "user@example.com", password: "secret" }),
      { isValid: true, message: "", field: null },
    );
  });

  it("accepts passwords shorter than registration minimum at sign-in", () => {
    assert.equal(
      validateSignIn({ email: "user@example.com", password: "123" }).isValid,
      true,
    );
  });

  it("trims surrounding whitespace on email", () => {
    assert.equal(
      validateSignIn({ email: "  user@example.com  ", password: "ok" }).isValid,
      true,
    );
  });

  it("handles null or undefined payloads safely without throwing", () => {
    for (const payload of [null, undefined]) {
      const result = validateSignIn(payload);
      assert.equal(result.isValid, false);
      assert.equal(result.field, "email");
    }
  });

  it("rejects whitespace-only email and malformed emails with field 'email'", () => {
    for (const email of ["   ", "invalid", "a@b", "a@b.c<script>"]) {
      const result = validateSignIn({ email, password: "password123" });
      assert.equal(result.isValid, false);
      assert.equal(result.field, "email");
    }
  });

  it("rejects 8-space password with field 'password'", () => {
    const result = validateSignIn({
      email: "user@example.com",
      password: "        ",
    });
    assert.equal(result.isValid, false);
    assert.equal(result.field, "password");
  });
});

describe("validateRegister", () => {
  const validPayload = {
    username: "cinephile",
    email: "alex@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts a valid registration payload", () => {
    assert.deepEqual(validateRegister(validPayload), {
      isValid: true,
      message: "",
      field: null,
    });
  });

  it("handles null/undefined and missing required fields with matching field keys", () => {
    assert.equal(validateRegister(null).field, "username");
    assert.equal(
      validateRegister({ ...validPayload, username: "  " }).field,
      "username",
    );
    assert.equal(
      validateRegister({ ...validPayload, email: "" }).field,
      "email",
    );
    assert.equal(
      validateRegister({ ...validPayload, password: "   " }).field,
      "password",
    );
    assert.equal(
      validateRegister({ ...validPayload, confirmPassword: "" }).field,
      "confirmPassword",
    );
  });

  it("rejects short username, invalid email, short password, and mismatched confirmation", () => {
    assert.equal(
      validateRegister({ ...validPayload, username: "ab " }).field,
      "username",
    );
    assert.equal(
      validateRegister({ ...validPayload, email: "bad@" }).field,
      "email",
    );
    assert.equal(
      validateRegister({ ...validPayload, password: "short" }).field,
      "password",
    );
    assert.equal(
      validateRegister({ ...validPayload, confirmPassword: "other" }).field,
      "confirmPassword",
    );
  });
});

describe("initAuth", () => {
  it("links field errors, resets on success, and hides #auth-section after 1000ms", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const elements = createAuthDom();
    globalThis.document = createMockDocument(elements);

    initAuth();

    const invalid = elements["signin-form"].dispatchEvent("submit");
    assert.equal(invalid.defaultPrevented, true);
    assert.equal(elements["signin-error"].classList.contains("hidden"), false);
    assert.equal(elements["signin-email"].getAttribute("aria-invalid"), "true");
    assert.equal(
      elements["signin-email"].getAttribute("aria-describedby"),
      "signin-error",
    );
    assert.equal(elements["signin-email"].focused, true);

    elements["signin-email"].value = "alex@example.com";
    const valid = elements["signin-form"].dispatchEvent("submit");
    assert.equal(valid.defaultPrevented, true);
    assert.equal(elements["signin-email"].getAttribute("aria-invalid"), null);
    assert.equal(
      elements["signin-email"].getAttribute("aria-describedby"),
      null,
    );
    assert.equal(
      elements["signin-success"].classList.contains("hidden"),
      false,
    );
    assert.match(
      elements["signin-success"].textContent,
      /Demo sign-in validated locally/,
    );
    assert.equal(elements["signin-form"].resetCount, 1);

    assert.equal(elements["auth-section"].classList.contains("hidden"), false);
    t.mock.timers.tick(1000);
    assert.equal(elements["auth-section"].classList.contains("hidden"), true);
  });

  it("cancels pending hide timer if sibling auth form fails validation before delay elapses", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const elements = createAuthDom();
    elements["signin-email"].value = "alex@example.com";
    globalThis.document = createMockDocument(elements);

    initAuth();
    elements["signin-form"].dispatchEvent("submit");

    t.mock.timers.tick(500);
    elements["register-confirm-password"].value = "mismatch";
    elements["register-form"].dispatchEvent("submit");
    assert.equal(
      elements["register-error"].classList.contains("hidden"),
      false,
    );

    t.mock.timers.tick(1000);
    assert.equal(elements["auth-section"].classList.contains("hidden"), false);
  });

  it("skips binding a form when any required field element is missing", () => {
    const elements = createAuthDom({ "signin-password": null });
    globalThis.document = createMockDocument(elements);

    initAuth();
    assert.equal(
      elements["signin-form"].dispatchEvent("submit").defaultPrevented,
      false,
    );
    assert.equal(
      elements["register-form"].dispatchEvent("submit").defaultPrevented,
      true,
    );
  });
});

describe("initNavigation", () => {
  it("handles scroll-spy intersections and respects the 650ms click-scroll lock", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });

    const sectionA = el("section-a");
    const sectionB = el("section-b");
    const linkA = el("nav-a", {
      attrs: { href: "#section-a", "aria-current": "location" },
      classes: ["bg-amber-400/10", "text-amber-400"],
    });
    const linkB = el("nav-b", { attrs: { href: "#section-b" } });
    const navLinks = [
      linkA,
      linkB,
      el("nav-missing", { attrs: { href: "#missing" } }),
      el("nav-ext", { attrs: { href: "https://example.com" } }),
    ];

    const observed = [];
    let observerCallback = null;
    globalThis.IntersectionObserver = class {
      constructor(cb) {
        observerCallback = cb;
      }
      observe(target) {
        observed.push(target);
      }
    };
    globalThis.document = createMockDocument(
      { "section-a": sectionA, "section-b": sectionB },
      navLinks,
    );

    initNavigation();
    assert.deepEqual(observed, [sectionA, sectionB]);

    linkB.dispatchEvent("click");
    assert.equal(linkA.getAttribute("aria-current"), null);
    assert.equal(linkB.getAttribute("aria-current"), "location");

    // Intermediate intersection during smooth scroll must be ignored until 650ms lock expires.
    observerCallback([{ target: sectionA, isIntersecting: true }]);
    assert.equal(linkB.getAttribute("aria-current"), "location");

    t.mock.timers.tick(650);
    observerCallback([{ target: sectionA, isIntersecting: true }]);
    assert.equal(linkA.getAttribute("aria-current"), "location");
    assert.equal(linkB.getAttribute("aria-current"), null);
  });

  it("still binds click highlighting when IntersectionObserver is unavailable", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const linkA = el("nav-a", {
      attrs: { href: "#a", "aria-current": "location" },
    });
    const linkB = el("nav-b", { attrs: { href: "#b" } });
    globalThis.document = createMockDocument({}, [linkA, linkB]);

    initNavigation();
    linkB.dispatchEvent("click");
    assert.equal(linkB.getAttribute("aria-current"), "location");
    t.mock.timers.tick(650);
  });
});

describe("index.html contract", () => {
  it("has unique IDs, valid internal anchors, and every JS-referenced ID", () => {
    const html = fs.readFileSync(
      new URL("../index.html", import.meta.url),
      "utf8",
    );
    const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map((m) => m[1]);
    const idSet = new Set(ids);

    assert.equal(ids.length, idSet.size, "Duplicate IDs found in index.html");
    assert.deepEqual(
      [...html.matchAll(/\bhref="#([^"]+)"/g)]
        .map((m) => m[1])
        .filter((id) => !idSet.has(id)),
      [],
    );

    const lookedUpIds = new Set();
    const elements = createAuthDom();
    elements["signin-email"].value = "alex@example.com";
    globalThis.document = createMockDocument(elements, [], lookedUpIds);

    initAuth();
    elements["signin-form"].dispatchEvent("submit");

    assert.ok(lookedUpIds.size > 0, "Expected recorded IDs from initAuth");
    for (const id of lookedUpIds)
      assert.ok(idSet.has(id), `JS looked up missing HTML ID: #${id}`);

    for (const id of [
      "dune-horizon",
      "midnight-sonata",
      "neon-odyssey",
      "glass-labyrinth",
    ]) {
      assert.ok(
        html.includes(`data-movie-id="${id}"`),
        `Missing catalog data-movie-id="${id}" in index.html`,
      );
    }
  });
});

describe("validateReview, validateSuggestion, and validateReport", () => {
  it("validates audience review payloads cleanly", () => {
    assert.equal(
      validateReview({
        username: "",
        rating: "9",
        reviewText: "Great sound design.",
      }).field,
      "username",
    );
    assert.equal(
      validateReview({
        username: "Maya",
        rating: "0",
        reviewText: "Great sound design.",
      }).field,
      "rating",
    );
    assert.equal(
      validateReview({ username: "Maya", rating: "9", reviewText: "Too short" })
        .field,
      "reviewText",
    );
    assert.equal(
      validateReview({
        username: "Maya",
        rating: "9",
        reviewText: "Wide desert frames and stellar pacing.",
      }).isValid,
      true,
    );
  });

  it("validates community movie suggestions including optional release year bounds", () => {
    assert.equal(
      validateSuggestion({ title: "", year: "", reason: "A seminal classic." })
        .field,
      "title",
    );
    assert.equal(
      validateSuggestion({
        title: "Arrival",
        year: "1800",
        reason: "A seminal classic.",
      }).field,
      "year",
    );
    assert.equal(
      validateSuggestion({ title: "Arrival", year: "2016", reason: "short" })
        .field,
      "reason",
    );
    assert.equal(
      validateSuggestion({
        title: "Arrival",
        year: "",
        reason: "Thoughtful linguistic sci-fi film.",
      }).isValid,
      true,
    );
  });

  it("validates problem reports", () => {
    assert.equal(
      validateReport({
        movieTitle: "",
        problemType: "other",
        description: "Detailed issue report.",
      }).field,
      "movieTitle",
    );
    assert.equal(
      validateReport({
        movieTitle: "Dune",
        problemType: "",
        description: "Detailed issue report.",
      }).field,
      "problemType",
    );
    assert.equal(
      validateReport({
        movieTitle: "Dune",
        problemType: "other",
        description: "short",
      }).field,
      "description",
    );
    assert.equal(
      validateReport({
        movieTitle: "Dune",
        problemType: "missing-poster",
        description: "Poster SVG fails to load on card.",
      }).isValid,
      true,
    );
  });
});

describe("review and community submissions", () => {
  it("labels a new review with the currently selected movie", () => {
    const state = createAppState();
    state.activeMovieId = "midnight-sonata";
    const elements = mockFields({
      "review-form": {},
      "review-error": { classes: ["hidden"] },
      "review-success": { classes: ["hidden"] },
      "review-username": "Maya",
      "review-rating": "8",
      "review-text": "Beautifully staged mystery.",
      "reviews-list": {},
      "reviews-empty-state": {},
    });
    globalThis.document = createMockDocument(elements);

    initReviews(state);
    elements["review-form"].dispatchEvent("submit");

    const list = elements["reviews-list"];
    assert.equal(list.children.length, 1);
    assert.equal(
      list.children[0].children[1].textContent,
      "Midnight Sonata in Vienna (2024)",
    );
    assert.equal(
      list.children[0].children[2].textContent,
      "Beautifully staged mystery.",
    );
  });

  it("retains suggestion synopsis and report category in submission cards", () => {
    const elements = mockFields({
      "community-suggestion-form": {},
      "suggestion-error": { classes: ["hidden"] },
      "suggestion-feedback": { classes: ["hidden"] },
      "suggest-title": "Arrival",
      "suggest-year": "2016",
      "suggest-description": "A linguist deciphers an alien language.",
      "suggest-reason":
        "Its thoughtful take on communication deserves a place.",
      "problem-report-form": {},
      "report-error": { classes: ["hidden"] },
      "report-feedback": { classes: ["hidden"] },
      "report-movie-title": "Dune",
      "report-problem-type": "missing-poster",
      "report-description":
        "The poster image is missing from the details panel.",
      "community-submissions-list": {},
      "community-empty-state": {},
    });
    globalThis.document = createMockDocument(elements);

    initCommunity();
    elements["community-suggestion-form"].dispatchEvent("submit");
    elements["problem-report-form"].dispatchEvent("submit");

    const list = elements["community-submissions-list"];
    assert.equal(
      list.children[1].children[0].children[2].textContent,
      "Synopsis: A linguist deciphers an alien language.",
    );
    assert.equal(
      list.children[1].children[0].children[3].textContent,
      "Reason: Its thoughtful take on communication deserves a place.",
    );
    assert.equal(
      list.children[0].children[0].children[2].textContent,
      "Missing or Low-Resolution Poster",
    );
  });
});

describe("initCatalog", () => {
  it("filters movie cards by query and genre and toggles empty state", () => {
    const cardDune = el("card-dune", {
      classes: ["movie-card"],
      attrs: { "data-movie-id": "dune-horizon" },
    });
    const cardVienna = el("card-vienna", {
      classes: ["movie-card"],
      attrs: { "data-movie-id": "midnight-sonata" },
    });
    const elements = mockFields({
      "search-form": {},
      "search-input": {},
      "search-genre": {},
      "search-results": { children: [cardDune, cardVienna] },
      "search-results-summary": {},
      "search-no-results": { classes: ["hidden"] },
    });
    globalThis.document = createMockDocument(elements);

    initCatalog(createAppState());

    elements["search-genre"].value = "mystery";
    elements["search-genre"].dispatchEvent("change");
    assert.equal(cardDune.classList.contains("hidden"), true);
    assert.equal(cardVienna.classList.contains("hidden"), false);
    assert.equal(
      elements["search-no-results"].classList.contains("hidden"),
      true,
    );
    assert.equal(
      elements["search-results-summary"].textContent,
      "Showing 1 of 2 curated films.",
    );

    elements["search-input"].value = "nonexistent";
    elements["search-form"].dispatchEvent("submit");
    assert.equal(elements["search-results"].classList.contains("hidden"), true);
    assert.equal(
      elements["search-no-results"].classList.contains("hidden"),
      false,
    );
    assert.equal(
      elements["search-results-summary"].textContent,
      "Showing 0 of 2 curated films.",
    );
  });
});

describe("initMovieDetails and initFavorites", () => {
  it("switches spotlight movie, updates rating count, and toggles favorites cleanly", () => {
    const state = createAppState();
    assert.equal(state instanceof AppState, true);
    assert.equal(state.activeMovie instanceof Movie, true);
    const viewViennaBtn = el("vienna-btn", {
      classes: ["view-details-btn"],
      attrs: { "data-movie-id": "midnight-sonata" },
    });
    const cardDune = el("card-dune", {
      classes: ["movie-card"],
      attrs: { "data-movie-id": "dune-horizon", "data-selected": "true" },
    });
    const cardVienna = el("card-vienna", {
      classes: ["movie-card"],
      attrs: { "data-movie-id": "midnight-sonata", "data-selected": "false" },
      children: [
        el("vienna-badge", { classes: ["cinema-badge"] }),
        viewViennaBtn,
      ],
    });
    const radio10 = el("r10", { value: "10", attrs: { name: "user-rating" } });
    radio10.checked = true;

    const removeDuneBtn = el("rm-dune", {
      classes: ["remove-favorite-btn"],
      attrs: { "data-movie-id": "dune-horizon" },
    });
    const removeSolarisBtn = el("rm-solaris", {
      classes: ["remove-favorite-btn"],
      attrs: { "data-movie-id": "solaris-echo" },
    });
    const favDune = el("fav-dune", {
      classes: ["favorite-card"],
      attrs: { "data-movie-id": "dune-horizon" },
      children: [removeDuneBtn],
    });
    const favSolaris = el("fav-solaris", {
      classes: ["favorite-card"],
      attrs: { "data-movie-id": "solaris-echo" },
      children: [removeSolarisBtn],
    });

    const elements = mockFields({
      "search-results": { children: [cardDune, cardVienna] },
      "movie-details": {},
      "details-poster": {},
      "details-title": {},
      "details-year": {},
      "details-genre": {},
      "details-runtime": {},
      "details-director": {},
      "details-plot": {},
      "details-score-badge": {},
      "details-vote-count": {},
      "rating-form": { children: [radio10] },
      "rating-feedback": { classes: ["hidden"] },
      "details-quick-comment": "Masterful violin motif.",
      "quick-comment-link": {},
      "review-target-movie": {},
      "review-username": {},
      "review-text": {},
      "details-favorite-btn": {},
      "favorites-list": { children: [favDune, favSolaris] },
      "favorites-empty-state": { classes: ["hidden"] },
      "nav-favorites-count": {},
    });
    globalThis.document = createMockDocument(elements);

    let favoritesApi = null;
    const detailsApi = initMovieDetails(state, {
      syncFavoriteButton: () => favoritesApi.syncFavoriteButton(),
    });
    favoritesApi = initFavorites(state, {
      onSelectMovie: (id) => detailsApi.selectMovie(id),
    });

    assert.equal(
      elements["details-favorite-btn"].getAttribute("aria-pressed"),
      "true",
    );

    elements["search-results"].dispatchEvent("click", viewViennaBtn);
    assert.equal(state.activeMovieId, "midnight-sonata");
    assert.equal(
      elements["details-title"].textContent,
      "Midnight Sonata in Vienna",
    );
    assert.equal(cardVienna.getAttribute("data-selected"), "true");
    assert.equal(
      elements["details-favorite-btn"].getAttribute("aria-pressed"),
      "false",
    );

    elements["rating-form"].dispatchEvent("submit");
    assert.equal(state.movies.get("midnight-sonata").votes, 961);
    assert.equal(
      elements["rating-feedback"].classList.contains("hidden"),
      false,
    );

    elements["quick-comment-link"].dispatchEvent("click");
    assert.equal(elements["review-text"].value, "Masterful violin motif.");
    assert.equal(elements["review-username"].focused, true);

    elements["details-favorite-btn"].dispatchEvent("click");
    assert.equal(state.favorites.size, 3);
    assert.equal(elements["nav-favorites-count"].textContent, "3");

    elements["favorites-list"].dispatchEvent("click", removeDuneBtn);
    elements["favorites-list"].dispatchEvent("click", removeSolarisBtn);
    assert.equal(state.favorites.size, 1);

    const viennaFavRemoveBtn = elements["favorites-list"].querySelector(
      ".remove-favorite-btn",
    );
    elements["favorites-list"].dispatchEvent("click", viennaFavRemoveBtn);
    assert.equal(state.favorites.size, 0);
    assert.equal(elements["nav-favorites-count"].textContent, "0");
    assert.equal(
      elements["favorites-empty-state"].classList.contains("hidden"),
      false,
    );
  });
});
