/**
 * Movie Explorer Community — client entry point (ES module).
 * Pure validation functions are exported so tests can import them without a browser.
 */

// ---------------------------------------------------------------------------
// Validation (pure, no DOM)
// ---------------------------------------------------------------------------
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
// Client-side format sanity check only; the server must re-validate.
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;
const isEmail = (value) => typeof value === "string" && EMAIL_PATTERN.test(value.trim());
const hasLength = (min) => (value) => typeof value === "string" && value.length >= min;

// A rule is [field, test(value, payload) => boolean, message]. The first failing rule wins.
const EMAIL_RULES = [
  ["email", isFilled, "Please enter your email address."],
  ["email", isEmail, "Please enter a valid email address."],
];

const SIGN_IN_RULES = [
  ...EMAIL_RULES,
  ["password", isFilled, "Please enter your password."],
];

const REGISTER_RULES = [
  ["username", isFilled, "Please enter a username."],
  ["username", (v) => hasLength(MIN_USERNAME_LENGTH)(v.trim()),
    `Username must be at least ${MIN_USERNAME_LENGTH} characters long.`],
  ...EMAIL_RULES,
  ["password", isFilled, "Please enter a password."],
  ["password", hasLength(MIN_PASSWORD_LENGTH),
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`],
  ["confirmPassword", isFilled, "Please confirm your password."],
  ["confirmPassword", (v, payload) => v === payload.password,
    "Passwords do not match. Please verify both password entries."],
];

function validate(rules, payload) {
  for (const [field, test, message] of rules) {
    if (!test(payload[field], payload)) {
      return { isValid: false, message, field };
    }
  }
  return { isValid: true, message: "", field: null };
}

export const validateSignIn = (payload) => validate(SIGN_IN_RULES, payload);
export const validateRegister = (payload) => validate(REGISTER_RULES, payload);

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
  let isClickScrolling = false;
  let scrollLockTimer = null;

  const sectionObserver = new IntersectionObserver((entries) => {
    if (isClickScrolling) return;
    entries.forEach((entry) => {
      const link = entry.isIntersecting ? sectionToLink.get(entry.target) : null;
      if (link) setActiveNavLink(navLinks, link);
    });
  }, SCROLL_SPY_OPTIONS);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNavLink(navLinks, link);
      isClickScrolling = true;
      if (scrollLockTimer !== null) clearTimeout(scrollLockTimer);
      scrollLockTimer = setTimeout(() => {
        isClickScrolling = false;
        scrollLockTimer = null;
      }, CLICK_SCROLL_LOCK_MS);
    });

    const href = link.getAttribute("href");
    // Resolve #id links via getElementById so invalid CSS selectors cannot throw.
    if (href && href.startsWith("#") && href.length > 1) {
      const section = document.getElementById(href.slice(1));
      if (section) {
        sectionToLink.set(section, link);
        sectionObserver.observe(section);
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Auth forms (demo: validated locally, nothing is sent)
// ---------------------------------------------------------------------------
const AUTH_HIDE_DELAY_MS = 1000;

function markFieldInvalid(field, errorBannerId) {
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", errorBannerId);
  field.focus();
}

function clearFieldErrors(fields) {
  fields.forEach((field) => {
    if (!field) return;
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  });
}

function showBanner(banner, message) {
  banner.textContent = message;
  banner.classList.remove("hidden");
}

/**
 * Wire one auth form. Element ids follow #<prefix>-form, #<prefix>-error, #<prefix>-success.
 * @param {string} prefix
 * @param {{ fieldIds: Record<string, string>, validate: Function, successMessage: string, onSuccess: () => void }} options
 */
function bindAuthForm(prefix, { fieldIds, validate: validatePayload, successMessage, onSuccess }) {
  const errorBannerId = `${prefix}-error`;
  const form = document.getElementById(`${prefix}-form`);
  const errorBanner = document.getElementById(errorBannerId);
  const successBanner = document.getElementById(`${prefix}-success`);
  if (!form || !errorBanner || !successBanner) return;

  const fields = Object.fromEntries(
    Object.entries(fieldIds).map(([key, id]) => [key, document.getElementById(id)]),
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorBanner.classList.add("hidden");
    successBanner.classList.add("hidden");
    clearFieldErrors(Object.values(fields));

    const payload = Object.fromEntries(
      Object.entries(fields).map(([key, input]) => [key, input?.value ?? ""]),
    );
    const result = validatePayload(payload);

    if (!result.isValid) {
      showBanner(errorBanner, result.message);
      if (result.field && fields[result.field]) {
        markFieldInvalid(fields[result.field], errorBannerId);
      }
      return;
    }

    showBanner(successBanner, successMessage);
    form.reset();
    onSuccess();
  });
}

function createAuthSectionHider() {
  let hideTimer = null;

  return () => {
    const authSection = document.getElementById("auth-section");
    if (!authSection) return;
    if (hideTimer !== null) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      authSection.classList.add("hidden");
      hideTimer = null;
    }, AUTH_HIDE_DELAY_MS);
  };
}

export function initAuth() {
  const hideAuthSection = createAuthSectionHider();

  bindAuthForm("signin", {
    fieldIds: { email: "signin-email", password: "signin-password" },
    validate: validateSignIn,
    successMessage: "Demo sign-in validated locally (no data was sent). Welcome back to Movie Explorer Community.",
    onSuccess: hideAuthSection,
  });

  bindAuthForm("register", {
    fieldIds: {
      username: "register-username",
      email: "register-email",
      password: "register-password",
      confirmPassword: "register-confirm-password",
    },
    validate: validateRegister,
    successMessage: "Demo account validated locally (no account was created or sent). Welcome to Movie Explorer Community.",
    onSuccess: hideAuthSection,
  });
}

// ---------------------------------------------------------------------------
// Bootstrap. Module scripts are deferred, so the DOM is already parsed here.
// The guard lets Node import this file for tests without a browser.
// ---------------------------------------------------------------------------
if (typeof document !== "undefined") {
  initNavigation();
  initAuth();
}
