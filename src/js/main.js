"use strict";

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

function showRegisterError(message) {
  registerError.textContent = message;
  registerError.classList.remove("hidden");
}

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  registerSuccess.classList.add("hidden");
  registerError.classList.add("hidden");

  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;

  if (!username || !email || !password.trim() || !confirmPassword.trim()) {
    return showRegisterError("Complete all the fields please !");
  }

  if (!EMAIL_PATTERN.test(email)) {
    return showRegisterError("Please enter a valid email address !");
  }

  if (password.length < 8 || confirmPassword !== password) {
    return showRegisterError(
      "Make sure the password is 8 charachter or Make sure you enter the same password to confirm it",
    );
  }

  registerSuccess.textContent = "Thank U to trust us ! have a nice day";
  registerSuccess.classList.remove("hidden");
  registerForm.reset();
});
