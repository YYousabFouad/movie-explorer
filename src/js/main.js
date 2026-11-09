"use strict";

/**
 * Movie Explorer Community
 * Modular Client-Side Architecture
 *
 * Implements:
 * - Single Responsibility Principle (SRP): Decoupled validation, DOM manipulation, and controllers.
 * - Open/Closed Principle (OCP): Extensible validation rules and navigation handlers.
 * - Dependency Inversion Principle (DIP): Guarded, defensive DOM queries within initializers.
 * - DRY & KISS: Parameterized form handler lifecycle and clear, single-purpose error messages.
 * - Defensive Security: Validated CSS selector extraction avoiding unhandled DOMExceptions.
 */

// ============================================================================
// 1. CONFIGURATION & CONSTANTS (Single Source of Truth)
// ============================================================================
const CONFIG = Object.freeze({
  activeNavClasses: Object.freeze(["bg-amber-400/10", "text-amber-400"]),
  sectionObserverOptions: Object.freeze({
    root: null,
    rootMargin: "-25% 0px -65% 0px",
    threshold: 0,
  }),
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  minPasswordLength: 8,
  minUsernameLength: 3,
});

// ============================================================================
// 2. DOM UTILITIES (Defensive, Pure UI Operations)
// ============================================================================
const DOM = {
  showBanner(bannerElement, message) {
    if (!bannerElement) return;
    bannerElement.textContent = message;
    bannerElement.classList.remove("hidden");
  },

  hideBanners(...bannerElements) {
    bannerElements.forEach((banner) => {
      if (banner) {
        banner.classList.add("hidden");
      }
    });
  },
};

// ============================================================================
// 3. VALIDATION MODULE (SRP / OCP: Pure Validation Rules, Zero DOM Coupling)
// ============================================================================
const Validator = {
  isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  },

  isValidEmail(email) {
    return typeof email === "string" && CONFIG.emailPattern.test(email.trim());
  },

  hasMinLength(value, minLength) {
    return typeof value === "string" && value.length >= minLength;
  },

  validateSignIn({ email, password }) {
    if (!this.isNonEmptyString(email) || !this.isNonEmptyString(password)) {
      return { isValid: false, message: "Please complete all required fields." };
    }

    if (!this.isValidEmail(email)) {
      return { isValid: false, message: "Please enter a valid email address." };
    }

    if (!this.hasMinLength(password, CONFIG.minPasswordLength)) {
      return {
        isValid: false,
        message: `Password must be at least ${CONFIG.minPasswordLength} characters long.`,
      };
    }

    return { isValid: true, message: "" };
  },

  validateRegister({ username, email, password, confirmPassword }) {
    if (
      !this.isNonEmptyString(username) ||
      !this.isNonEmptyString(email) ||
      !this.isNonEmptyString(password) ||
      !this.isNonEmptyString(confirmPassword)
    ) {
      return { isValid: false, message: "Please complete all required fields." };
    }

    if (!this.hasMinLength(username.trim(), CONFIG.minUsernameLength)) {
      return {
        isValid: false,
        message: `Username must be at least ${CONFIG.minUsernameLength} characters long.`,
      };
    }

    if (!this.isValidEmail(email)) {
      return { isValid: false, message: "Please enter a valid email address." };
    }

    if (!this.hasMinLength(password, CONFIG.minPasswordLength)) {
      return {
        isValid: false,
        message: `Password must be at least ${CONFIG.minPasswordLength} characters long.`,
      };
    }

    if (password !== confirmPassword) {
      return {
        isValid: false,
        message: "Passwords do not match. Please verify both password entries.",
      };
    }

    return { isValid: true, message: "" };
  },
};

// ============================================================================
// 4. NAVIGATION CONTROLLER (Defensive Selector Parsing & Scroll-Spy)
// ============================================================================
function initNavigation() {
  const navLinks = document.querySelectorAll(".cinema-nav-link");
  if (!navLinks.length) return;

  const sectionToNavLinkMap = new Map();

  function setActiveNavLink(selectedLink) {
    navLinks.forEach((link) => {
      link.classList.remove(...CONFIG.activeNavClasses);
      link.removeAttribute("aria-current");
    });

    selectedLink.classList.add(...CONFIG.activeNavClasses);
    selectedLink.setAttribute("aria-current", "page");
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const matchingLink = sectionToNavLinkMap.get(entry.target);
      if (matchingLink) {
        setActiveNavLink(matchingLink);
      }
    });
  }, CONFIG.sectionObserverOptions);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveNavLink(link));

    const href = link.getAttribute("href");
    // Defensive check: Only resolve valid ID hash references to avoid DOMException
    if (href && href.startsWith("#") && href.length > 1) {
      const targetSection = document.getElementById(href.slice(1));
      if (targetSection) {
        sectionToNavLinkMap.set(targetSection, link);
        sectionObserver.observe(targetSection);
      }
    }
  });
}

// ============================================================================
// 5. AUTHENTICATION CONTROLLER (DRY / SRP / DIP: Parameterized Form Binder)
// ============================================================================
function bindAuthForm({
  formId,
  errorBannerId,
  successBannerId,
  extractPayload,
  validator,
  successMessage,
}) {
  const form = document.getElementById(formId);
  const errorBanner = document.getElementById(errorBannerId);
  const successBanner = document.getElementById(successBannerId);

  if (!form || !errorBanner || !successBanner) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    DOM.hideBanners(errorBanner, successBanner);

    const payload = extractPayload();
    const result = validator(payload);

    if (!result.isValid) {
      DOM.showBanner(errorBanner, result.message);
      return;
    }

    DOM.showBanner(successBanner, successMessage);
    form.reset();
  });
}

function initAuth() {
  bindAuthForm({
    formId: "signin-form",
    errorBannerId: "signin-error",
    successBannerId: "signin-success",
    extractPayload: () => ({
      email: document.getElementById("signin-email")?.value ?? "",
      password: document.getElementById("signin-password")?.value ?? "",
    }),
    validator: (payload) => Validator.validateSignIn(payload),
    successMessage:
      "Signed in successfully! Welcome back to Movie Explorer Community.",
  });

  bindAuthForm({
    formId: "register-form",
    errorBannerId: "register-error",
    successBannerId: "register-success",
    extractPayload: () => ({
      username: document.getElementById("register-username")?.value ?? "",
      email: document.getElementById("register-email")?.value ?? "",
      password: document.getElementById("register-password")?.value ?? "",
      confirmPassword:
        document.getElementById("register-confirm-password")?.value ?? "",
    }),
    validator: (payload) => Validator.validateRegister(payload),
    successMessage:
      "Account created successfully! Welcome to Movie Explorer Community.",
  });
}

// ============================================================================
// 6. APPLICATION BOOTSTRAP
// ============================================================================
function initApp() {
  initNavigation();
  initAuth();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
