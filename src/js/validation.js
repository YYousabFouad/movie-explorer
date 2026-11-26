/**
 * Declarative, pure form validation rules and composable FormValidator engine.
 */

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 40;
export const MAX_REVIEW_NAME_LENGTH = 60;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_PROSE_LENGTH = 10;
export const MAX_PROSE_LENGTH = 1000;
export const MIN_RELEASE_YEAR = 1888;
export const MAX_RELEASE_YEAR = 2035;
export const MIN_RATING = 1;
export const MAX_RATING = 10;

// Client-side format sanity check only; the server must re-validate.
export const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/**
 * Parse an integer within [min, max] from a number or trimmed numeric string.
 * Rejects booleans, objects, non-integers, and whitespace-only strings.
 * @param {unknown} value
 * @param {number} min
 * @param {number} max
 * @returns {number | null}
 */
export function parseIntegerInRange(value, min, max) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const numericValue = typeof value === "number" ? value : Number(value.trim());
  return Number.isInteger(numericValue) && numericValue >= min && numericValue <= max
    ? numericValue
    : null;
}

const isFilled = (value) => typeof value === "string" && value.trim().length > 0;
const isValidEmail = (value) =>
  typeof value === "string" &&
  value.trim().length <= MAX_EMAIL_LENGTH &&
  EMAIL_PATTERN.test(value.trim());
const hasMinTrimmedLength = (minLength) => (value) =>
  typeof value === "string" && value.trim().length >= minLength;
const hasMaxTrimmedLength = (maxLength) => (value) =>
  typeof value === "string" && value.trim().length <= maxLength;

function isValidOptionalReleaseYear(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return parseIntegerInRange(value, MIN_RELEASE_YEAR, MAX_RELEASE_YEAR) !== null;
}

/**
 * Immutable validation rule evaluating a single field against a predicate.
 */
export class ValidationRule {
  #predicate;

  /**
   * @param {string} field
   * @param {(value: unknown, payload: Record<string, unknown>) => boolean} predicate
   * @param {string} message
   */
  constructor(field, predicate, message) {
    this.field = field;
    this.message = message;
    this.#predicate = predicate;
  }

  /**
   * Evaluate the rule against a normalized payload object.
   * @param {Record<string, unknown>} payload
   * @returns {boolean}
   */
  matches(payload) {
    return Boolean(this.#predicate(payload[this.field], payload));
  }
}

/**
 * Ordered rule evaluator returning the first validation failure or a valid result.
 */
export class FormValidator {
  #rules;

  /**
   * @param {ValidationRule[]} [rules]
   */
  constructor(rules = []) {
    this.#rules = Object.freeze([...rules]);
  }

  /**
   * Validate a form payload against all configured rules.
   * @param {Record<string, unknown> | null | undefined} payload
   * @returns {{ isValid: boolean, message: string, field: string | null }}
   */
  validate(payload) {
    const normalizedPayload = payload && typeof payload === "object" ? payload : {};
    for (const rule of this.#rules) {
      if (!rule.matches(normalizedPayload)) {
        return { isValid: false, message: rule.message, field: rule.field };
      }
    }
    return { isValid: true, message: "", field: null };
  }
}

function requiredTextRules(
  field,
  label,
  { min = 0, max = 0, emptyMessage = `Please enter your ${label}.` } = {},
) {
  const rules = [new ValidationRule(field, isFilled, emptyMessage)];
  if (min > 0) {
    rules.push(
      new ValidationRule(
        field,
        hasMinTrimmedLength(min),
        `${label} must be at least ${min} characters long.`,
      ),
    );
  }
  if (max > 0) {
    rules.push(
      new ValidationRule(
        field,
        hasMaxTrimmedLength(max),
        `${label} must be ${max} characters or fewer.`,
      ),
    );
  }
  return rules;
}

function optionalTextMaxRule(field, label, maxLength) {
  return new ValidationRule(
    field,
    (value) =>
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim().length <= maxLength),
    `${label} must be ${maxLength} characters or fewer.`,
  );
}

function emailRules() {
  return [
    new ValidationRule("email", isFilled, "Please enter your email address."),
    new ValidationRule("email", isValidEmail, "Please enter a valid email address."),
  ];
}

function passwordRules({
  minLength = 0,
  emptyMessage = "Please enter your password.",
} = {}) {
  const rules = [new ValidationRule("password", isFilled, emptyMessage)];
  if (minLength > 0) {
    rules.push(
      new ValidationRule(
        "password",
        (value) => value.length >= minLength,
        `Password must be at least ${minLength} characters long.`,
      ),
    );
  }
  rules.push(
    new ValidationRule(
      "password",
      (value) => value.length <= MAX_PASSWORD_LENGTH,
      `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`,
    ),
  );
  return rules;
}

function ratingRule() {
  return new ValidationRule(
    "rating",
    (value) => parseIntegerInRange(value, MIN_RATING, MAX_RATING) !== null,
    "Please select a rating between 1 and 10.",
  );
}

function optionalReleaseYearRule() {
  return new ValidationRule(
    "year",
    isValidOptionalReleaseYear,
    `Release year must be between ${MIN_RELEASE_YEAR} and ${MAX_RELEASE_YEAR}.`,
  );
}

export const SIGN_IN_VALIDATOR = new FormValidator([
  ...emailRules(),
  ...passwordRules(),
]);

export const REGISTER_VALIDATOR = new FormValidator([
  ...requiredTextRules("username", "Username", {
    min: MIN_USERNAME_LENGTH,
    max: MAX_USERNAME_LENGTH,
    emptyMessage: "Please enter a username.",
  }),
  ...emailRules(),
  ...passwordRules({
    minLength: MIN_PASSWORD_LENGTH,
    emptyMessage: "Please enter a password.",
  }),
  new ValidationRule("confirmPassword", isFilled, "Please confirm your password."),
  new ValidationRule(
    "confirmPassword",
    (value, payload) => value === payload.password,
    "Passwords do not match. Please verify both password entries.",
  ),
]);

export const REVIEW_VALIDATOR = new FormValidator([
  ...requiredTextRules("username", "Display name", {
    max: MAX_REVIEW_NAME_LENGTH,
    emptyMessage: "Please enter your display name.",
  }),
  ratingRule(),
  ...requiredTextRules("reviewText", "Review text", {
    min: MIN_PROSE_LENGTH,
    max: MAX_PROSE_LENGTH,
    emptyMessage: "Please enter your review text.",
  }),
]);

export const SUGGESTION_VALIDATOR = new FormValidator([
  ...requiredTextRules("title", "Movie title", {
    max: MAX_TITLE_LENGTH,
    emptyMessage: "Please enter a movie title.",
  }),
  optionalReleaseYearRule(),
  ...requiredTextRules("reason", "Suggestion reason", {
    min: MIN_PROSE_LENGTH,
    max: MAX_PROSE_LENGTH,
    emptyMessage: "Please explain why this movie should be added.",
  }),
  optionalTextMaxRule("description", "Movie description", MAX_DESCRIPTION_LENGTH),
]);

export const REPORT_VALIDATOR = new FormValidator([
  ...requiredTextRules("movieTitle", "Movie reference", {
    max: MAX_TITLE_LENGTH,
    emptyMessage: "Please enter a movie title or reference ID.",
  }),
  ...requiredTextRules("problemType", "problem type", {
    emptyMessage: "Please select a problem type.",
  }),
  ...requiredTextRules("description", "Issue description", {
    min: MIN_PROSE_LENGTH,
    max: MAX_PROSE_LENGTH,
    emptyMessage: "Please describe what needs to be corrected.",
  }),
]);

/** @param {{ email?: string, password?: string } | null | undefined} payload */
export const validateSignIn = (payload) => SIGN_IN_VALIDATOR.validate(payload);

/** @param {{ username?: string, email?: string, password?: string, confirmPassword?: string } | null | undefined} payload */
export const validateRegister = (payload) => REGISTER_VALIDATOR.validate(payload);

/** @param {{ username?: string, rating?: string | number, reviewText?: string } | null | undefined} payload */
export const validateReview = (payload) => REVIEW_VALIDATOR.validate(payload);

/** @param {{ title?: string, year?: string | number, description?: string, reason?: string } | null | undefined} payload */
export const validateSuggestion = (payload) => SUGGESTION_VALIDATOR.validate(payload);

/** @param {{ movieTitle?: string, problemType?: string, description?: string } | null | undefined} payload */
export const validateReport = (payload) => REPORT_VALIDATOR.validate(payload);
