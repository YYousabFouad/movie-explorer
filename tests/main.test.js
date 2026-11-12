import assert from "node:assert/strict";
import fs from "node:fs";
import { afterEach, describe, it } from "node:test";
import {
  initAuth,
  initNavigation,
  validateRegister,
  validateSignIn,
} from "../src/js/main.js";

function createMockElement(id, { classes = [], value = "", attrs = {} } = {}) {
  const classSet = new Set(classes);
  const attributes = new Map(Object.entries(attrs));
  const listeners = new Map();
  const el = {
    id,
    value,
    textContent: "",
    focused: false,
    resetCount: 0,
    classList: {
      add: (...tokens) => tokens.forEach((t) => classSet.add(t)),
      remove: (...tokens) => tokens.forEach((t) => classSet.delete(t)),
      contains: (token) => classSet.has(token),
    },
    setAttribute: (name, val) => attributes.set(name, String(val)),
    getAttribute: (name) => (attributes.has(name) ? attributes.get(name) : null),
    removeAttribute: (name) => attributes.delete(name),
    focus: () => {
      el.focused = true;
    },
    reset: () => {
      el.resetCount += 1;
      el.value = "";
    },
    addEventListener: (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    dispatchEvent: (type) => {
      let defaultPrevented = false;
      const event = { preventDefault: () => { defaultPrevented = true; } };
      for (const fn of listeners.get(type) ?? []) fn(event);
      return { defaultPrevented };
    },
  };
  return el;
}

function createMockDocument(elementsById, navLinks = [], recordedIds = null) {
  return {
    getElementById(id) {
      recordedIds?.add(id);
      return elementsById[id] ?? null;
    },
    querySelectorAll(selector) {
      return selector === ".cinema-nav-link" ? navLinks : [];
    },
  };
}

function createAuthDom(overrides = {}) {
  return {
    "auth-section": createMockElement("auth-section"),
    "signin-form": createMockElement("signin-form"),
    "signin-error": createMockElement("signin-error", { classes: ["hidden"] }),
    "signin-success": createMockElement("signin-success", { classes: ["hidden"] }),
    "signin-email": createMockElement("signin-email", { value: "invalid" }),
    "signin-password": createMockElement("signin-password", { value: "123" }),
    "register-form": createMockElement("register-form"),
    "register-error": createMockElement("register-error", { classes: ["hidden"] }),
    "register-success": createMockElement("register-success", { classes: ["hidden"] }),
    "register-username": createMockElement("register-username", { value: "alex" }),
    "register-email": createMockElement("register-email", { value: "alex@example.com" }),
    "register-password": createMockElement("register-password", { value: "password123" }),
    "register-confirm-password": createMockElement("register-confirm-password", { value: "password123" }),
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
    assert.equal(validateSignIn({ email: "user@example.com", password: "123" }).isValid, true);
  });

  it("trims surrounding whitespace on email", () => {
    assert.equal(validateSignIn({ email: "  user@example.com  ", password: "ok" }).isValid, true);
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
    const result = validateSignIn({ email: "user@example.com", password: "        " });
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
    assert.equal(validateRegister({ ...validPayload, username: "  " }).field, "username");
    assert.equal(validateRegister({ ...validPayload, email: "" }).field, "email");
    assert.equal(validateRegister({ ...validPayload, password: "   " }).field, "password");
    assert.equal(validateRegister({ ...validPayload, confirmPassword: "" }).field, "confirmPassword");
  });

  it("rejects short username, invalid email, short password, and mismatched confirmation", () => {
    assert.equal(validateRegister({ ...validPayload, username: "ab " }).field, "username");
    assert.equal(validateRegister({ ...validPayload, email: "bad@" }).field, "email");
    assert.equal(validateRegister({ ...validPayload, password: "short" }).field, "password");
    assert.equal(validateRegister({ ...validPayload, confirmPassword: "other" }).field, "confirmPassword");
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
    assert.equal(elements["signin-email"].getAttribute("aria-describedby"), "signin-error");
    assert.equal(elements["signin-email"].focused, true);

    elements["signin-email"].value = "alex@example.com";
    const valid = elements["signin-form"].dispatchEvent("submit");
    assert.equal(valid.defaultPrevented, true);
    assert.equal(elements["signin-email"].getAttribute("aria-invalid"), null);
    assert.equal(elements["signin-email"].getAttribute("aria-describedby"), null);
    assert.equal(elements["signin-success"].classList.contains("hidden"), false);
    assert.match(elements["signin-success"].textContent, /Demo sign-in validated locally/);
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
    assert.equal(elements["register-error"].classList.contains("hidden"), false);

    t.mock.timers.tick(1000);
    assert.equal(elements["auth-section"].classList.contains("hidden"), false);
  });

  it("skips binding a form when any required field element is missing", () => {
    const elements = createAuthDom({ "signin-password": null });
    globalThis.document = createMockDocument(elements);

    initAuth();
    assert.equal(elements["signin-form"].dispatchEvent("submit").defaultPrevented, false);
    assert.equal(elements["register-form"].dispatchEvent("submit").defaultPrevented, true);
  });
});

describe("initNavigation", () => {
  it("handles scroll-spy intersections and respects the 650ms click-scroll lock", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });

    const sectionA = createMockElement("section-a");
    const sectionB = createMockElement("section-b");
    const linkA = createMockElement("nav-a", {
      attrs: { href: "#section-a", "aria-current": "location" },
      classes: ["bg-amber-400/10", "text-amber-400"],
    });
    const linkB = createMockElement("nav-b", { attrs: { href: "#section-b" } });
    const linkMissing = createMockElement("nav-missing", { attrs: { href: "#missing" } });
    const linkExternal = createMockElement("nav-ext", { attrs: { href: "https://example.com" } });

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
      [linkA, linkB, linkMissing, linkExternal],
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
    const linkA = createMockElement("nav-a", { attrs: { href: "#a", "aria-current": "location" } });
    const linkB = createMockElement("nav-b", { attrs: { href: "#b" } });
    globalThis.document = createMockDocument({}, [linkA, linkB]);

    initNavigation();
    linkB.dispatchEvent("click");
    assert.equal(linkB.getAttribute("aria-current"), "location");
    t.mock.timers.tick(650);
  });
});

describe("index.html contract", () => {
  it("has unique IDs, valid internal anchors, and every JS-referenced ID", () => {
    const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const idSet = new Set(ids);

    assert.equal(ids.length, idSet.size, "Duplicate IDs found in index.html");

    const missingAnchors = [...html.matchAll(/\bhref="#([^"]+)"/g)]
      .map((m) => m[1])
      .filter((target) => !idSet.has(target));
    assert.deepEqual(missingAnchors, []);

    const lookedUpIds = new Set();
    const elements = createAuthDom();
    elements["signin-email"].value = "alex@example.com";
    globalThis.document = createMockDocument(elements, [], lookedUpIds);

    initAuth();
    elements["signin-form"].dispatchEvent("submit");

    assert.ok(lookedUpIds.size > 0, "Expected recorded IDs from initAuth");
    for (const id of lookedUpIds) {
      assert.ok(idSet.has(id), `JS looked up missing HTML ID: #${id}`);
    }
  });
});
