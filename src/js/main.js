"use strict";

const signinForm = document.getElementById("signin-form");
const signinEmail = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const signinError = document.getElementById("signin-error");
const signinSuccess = document.getElementById("signin-success");

const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerConfirmPassword = document.getElementById(
  "register-confirm-password",
);
const registerError = document.getElementById("register-error");
const registerSuccess = document.getElementById("register-success");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function showBanner(bannerElement, message) {
  bannerElement.textContent = message;
  bannerElement.classList.remove("hidden");
}

function hideBanners(...bannerElements) {
  bannerElements.forEach((banner) => banner.classList.add("hidden"));
}

function hasEmptyField(values) {
  return values.some((value) => !value.trim());
}

signinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hideBanners(signinError, signinSuccess);

  const email = signinEmail.value.trim();
  const password = signinPassword.value;

  if (hasEmptyField([email, password])) {
    return showBanner(signinError, "Complete all the fields please !");
  }

  if (!EMAIL_PATTERN.test(email)) {
    return showBanner(signinError, "Please enter a valid email address !");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return showBanner(
      signinError,
      "Make sure the password is at least 8 characters !",
    );
  }

  showBanner(
    signinSuccess,
    "Signed in successfully! Welcome back to Movie Explorer Community.",
  );
  signinForm.reset();
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hideBanners(registerError, registerSuccess);

  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;

  if (hasEmptyField([username, email, password, confirmPassword])) {
    return showBanner(registerError, "Complete all the fields please !");
  }

  if (!EMAIL_PATTERN.test(email)) {
    return showBanner(registerError, "Please enter a valid email address !");
  }

  if (password.length < MIN_PASSWORD_LENGTH || confirmPassword !== password) {
    return showBanner(
      registerError,
      "Make sure the password is 8 charachter or Make sure you enter the same password to confirm it",
    );
  }

  showBanner(registerSuccess, "Thank U to trust us ! have a nice day");
  registerForm.reset();
});
