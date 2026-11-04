"use strict";

// ============================================================================
// 1. HEADER & NAVIGATION
// ============================================================================
const mainHeader = document.getElementById("main-header");
const brandLogo = document.getElementById("brand-logo");
const navSearch = document.getElementById("nav-search");
const navDetails = document.getElementById("nav-details");
const navCommunity = document.getElementById("nav-community");
const navFavorites = document.getElementById("nav-favorites");
const navFavoritesCount = document.getElementById("nav-favorites-count");
const navSigninBtn = document.getElementById("nav-signin-btn");
const navRegisterBtn = document.getElementById("nav-register-btn");

// ============================================================================
// 2. SEARCH & DISCOVERY
// ============================================================================
const searchSection = document.getElementById("search-section");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchGenre = document.getElementById("search-genre");
const searchSubmitBtn = document.getElementById("search-submit-btn");

const searchResultsSection = document.getElementById("search-results-section");
const searchResultsSummary = document.getElementById("search-results-summary");
const searchLoading = document.getElementById("search-loading");
const searchError = document.getElementById("search-error");
const searchErrorMessage = document.getElementById("search-error-message");
const searchNoResults = document.getElementById("search-no-results");
const searchResults = document.getElementById("search-results");
const movieCards = document.querySelectorAll(".movie-card");
const viewDetailsBtns = document.querySelectorAll(".view-details-btn");

// ============================================================================
// 3. MOVIE DETAILS & RATING
// ============================================================================
const movieDetailsSection = document.getElementById("movie-details-section");
const detailsLoading = document.getElementById("details-loading");
const detailsError = document.getElementById("details-error");
const movieDetails = document.getElementById("movie-details");

const detailsPoster = document.getElementById("details-poster");
const detailsTitle = document.getElementById("details-title");
const detailsYear = document.getElementById("details-year");
const detailsGenre = document.getElementById("details-genre");
const detailsRuntime = document.getElementById("details-runtime");
const detailsDirector = document.getElementById("details-director");
const detailsPlot = document.getElementById("details-plot");
const detailsRating = document.getElementById("details-rating");
const detailsVoteCount = document.getElementById("details-vote-count");
const detailsFavoriteBtn = document.getElementById("details-favorite-btn");

const ratingForm = document.getElementById("rating-form");
const userRatingInputs = document.querySelectorAll('input[name="user-rating"]');
const ratingSubmitBtn = document.getElementById("rating-submit-btn");
const ratingFeedback = document.getElementById("rating-feedback");
const detailsQuickComment = document.getElementById("details-quick-comment");

// ============================================================================
// 4. AUDIENCE REVIEWS & COMMENTS
// ============================================================================
const reviewsSection = document.getElementById("reviews-section");
const reviewForm = document.getElementById("review-form");
const reviewTargetMovie = document.getElementById("review-target-movie");
const reviewUsername = document.getElementById("review-username");
const reviewRating = document.getElementById("review-rating");
const reviewText = document.getElementById("review-text");
const reviewError = document.getElementById("review-error");
const reviewSuccess = document.getElementById("review-success");
const reviewSubmitBtn = document.getElementById("review-submit-btn");

const reviewsEmptyState = document.getElementById("reviews-empty-state");
const reviewsList = document.getElementById("reviews-list");
const reviewItems = document.querySelectorAll(".review-item");

// ============================================================================
// 5. COMMUNITY CURATION (SUGGESTIONS & PROBLEM REPORTS)
// ============================================================================
const communitySection = document.getElementById("community-section");

const communitySuggestionForm = document.getElementById(
  "community-suggestion-form",
);
const suggestTitle = document.getElementById("suggest-title");
const suggestYear = document.getElementById("suggest-year");
const suggestDescription = document.getElementById("suggest-description");
const suggestReason = document.getElementById("suggest-reason");
const suggestionFeedback = document.getElementById("suggestion-feedback");
const suggestSubmitBtn = document.getElementById("suggest-submit-btn");

const problemReportForm = document.getElementById("problem-report-form");
const reportMovieTitle = document.getElementById("report-movie-title");
const reportProblemType = document.getElementById("report-problem-type");
const reportDescription = document.getElementById("report-description");
const reportFeedback = document.getElementById("report-feedback");
const reportSubmitBtn = document.getElementById("report-submit-btn");

const communityEmptyState = document.getElementById("community-empty-state");
const communitySubmissionsList = document.getElementById(
  "community-submissions-list",
);
const submissionCards = document.querySelectorAll(".submission-card");

// ============================================================================
// 6. FAVORITES (PERSONAL WATCHLIST)
// ============================================================================
const favoritesSection = document.getElementById("favorites-section");
const favoritesEmptyState = document.getElementById("favorites-empty-state");
const favoritesList = document.getElementById("favorites-list");
const favoriteCards = document.querySelectorAll(".favorite-card");
const removeFavoriteBtns = document.querySelectorAll(".remove-favorite-btn");

// ============================================================================
// 7. MEMBER AUTHENTICATION (SIGN IN & REGISTRATION)
// ============================================================================
const authSection = document.getElementById("auth-section");

const signinCard = document.getElementById("signin-card");
const signinForm = document.getElementById("signin-form");
const signinEmail = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");
const signinError = document.getElementById("signin-error");
const signinSuccess = document.getElementById("signin-success");
const signinSubmitBtn = document.getElementById("signin-submit-btn");
const goToRegisterLink = document.getElementById("go-to-register-link");

const registerCard = document.getElementById("register-card");
const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerConfirmPassword = document.getElementById(
  "register-confirm-password",
);
const registerError = document.getElementById("register-error");
const registerSuccess = document.getElementById("register-success");
const registerSubmitBtn = document.getElementById("register-submit-btn");
const goToSigninLink = document.getElementById("go-to-signin-link");
