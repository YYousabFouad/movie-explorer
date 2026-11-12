import assert from "node:assert/strict";
import fs from "node:fs";
import { afterEach, describe, it } from "node:test";
import {
  initAuth,
  initNavigation,
  validateRegister,
  validateSignIn,
} from "../src/js/main.js";

const lookedUpIds = new Set();

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

function createMockDocument(elementsById, navLinks = [], { recordIds = false } = {}) {
  return {
    getElementById(id) {
      if (recordIds) lookedUpIds.add(id);
      return elementsById[id] ?? null;
    },
    querySelectorAll(selector) {
      return selector === ".cinema-nav-link" ? navLinks : [];
    },
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

  it("rejects whitespace-only email with field 'email'", () => {
    const result = validateSignIn({ email: "   ", password: "password123" });
    assert.equal(result.isValid, false);
    assert.equal(result.field, "email");
  });

  it("rejects malformed emails with field 'email'", () => {
    for (const email of ["invalid", "a@b", "a@b.c<script>"]) {
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

  it("rejects trimmed username shorter than 3 characters", () => {
    const result = validateRegister({ ...validPayload, username: "ab " });
    assert.equal(result.isValid, false);
    assert.equal(result.field, "username");
  });

  it("rejects invalid email with field 'email'", () => {
    const result = validateRegister({ ...validPayload, email: "bad@" });
    assert.equal(result.isValid, false);
    assert.equal(result.field, "email");
  });

  it("rejects short password with field 'password'", () => {
    const result = validateRegister({ ...validPayload, password: "short" });
    assert.equal(result.isValid, false);
    assert.equal(result.field, "password");
  });

  it("rejects mismatched confirmPassword with field 'confirmPassword'", () => {
    const result = validateRegister({
      ...validPayload,
      confirmPassword: "different123",
    });
    assert.equal(result.isValid, false);
    assert.equal(result.field, "confirmPassword");
  });
});

describe("initAuth", () => {
  it("links field errors, resets on success, and hides #auth-section after 1000ms", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });

    const elements = {
      "auth-section": createMockElement("auth-section"),
      "signin-form": createMockElement("signin-form"),
      "signin-error": createMockElement("signin-error", { classes: ["hidden"] }),
      "signin-success": createMockElement("signin-success", { classes: ["hidden"] }),
      "signin-email": createMockElement("signin-email", { value: "invalid" }),
      "signin-password": createMockElement("signin-password", { value: "123" }),
      "register-form": createMockElement("register-form"),
      "register-error": createMockElement("register-error", { classes: ["hidden"] }),
      "register-success": createMockElement("register-success", { classes: ["hidden"] }),
      "register-username": createMockElement("register-username"),
      "register-email": createMockElement("register-email"),
      "register-password": createMockElement("register-password"),
      "register-confirm-password": createMockElement("register-confirm-password"),
    };
    globalThis.document = createMockDocument(elements, [], { recordIds: true });

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
});

describe("initNavigation", () => {
  it("observes only valid #section targets and moves aria-current='location' on click", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });

    const sectionA = createMockElement("section-a");
    const linkA = createMockElement("nav-a", {
      attrs: { href: "#section-a", "aria-current": "location" },
      classes: ["bg-amber-400/10", "text-amber-400"],
    });
    const linkMissing = createMockElement("nav-missing", {
      attrs: { href: "#missing-section" },
    });
    const linkExternal = createMockElement("nav-ext", {
      attrs: { href: "https://example.com" },
    });

    const observed = [];
    globalThis.IntersectionObserver = class {
      observe(target) {
        observed.push(target);
      }
    };
    globalThis.document = createMockDocument(
      { "section-a": sectionA },
      [linkA, linkMissing, linkExternal],
    );

    initNavigation();
    assert.deepEqual(observed, [sectionA]);

    linkMissing.dispatchEvent("click");
    assert.equal(linkA.getAttribute("aria-current"), null);
    assert.equal(linkMissing.getAttribute("aria-current"), "location");
    assert.equal(linkMissing.classList.contains("text-amber-400"), true);
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

    assert.ok(lookedUpIds.size > 0, "Expected recorded IDs from initAuth");
    for (const id of lookedUpIds) {
      assert.ok(idSet.has(id), `JS looked up missing HTML ID: #${id}`);
    }
  });
});

