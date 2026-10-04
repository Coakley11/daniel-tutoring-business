(function () {
  "use strict";

  var MAX_REVIEW_LENGTH = 600;
  var MIN_REVIEW_LENGTH = 10;
  var MIN_NAME_LENGTH = 2;
  var formOpenedAt = Date.now();
  var config = window.SITE_CONFIG || {};
  var apiUrl = String(config.supabaseUrl || "").replace(/\/$/, "");
  var apiKey = String(config.supabaseAnonKey || "");

  var list = document.getElementById("reviews-list");
  var status = document.getElementById("reviews-status");
  var summary = document.getElementById("reviews-summary");
  var averageEl = document.getElementById("average-rating");
  var countEl = document.getElementById("review-count");
  var summaryStars = document.getElementById("summary-stars");
  var panel = document.getElementById("review-form-panel");
  var form = document.getElementById("review-form");
  var message = document.getElementById("review-form-message");
  var reviewText = document.getElementById("review-text");
  var characterCount = document.getElementById("review-character-count");

  function isConfigured() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(apiUrl) && apiKey.length > 20;
  }

  function apiHeaders(includeJson) {
    var headers = { apikey: apiKey };
    // New sb_publishable_* keys are API keys, not JWTs, and must not be sent as
    // Bearer tokens. Retain Bearer support for legacy JWT-style anon keys.
    if (/^eyJ/.test(apiKey)) headers.Authorization = "Bearer " + apiKey;
    if (includeJson) headers["Content-Type"] = "application/json";
    return headers;
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function validateReview(data) {
    var errors = {};
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      errors.rating = "Choose a rating from 1 to 5 stars.";
    }
    if (data.displayName.length < MIN_NAME_LENGTH) {
      errors.displayName = "Enter a display name with at least 2 characters.";
    } else if (data.displayName.length > 80) {
      errors.displayName = "Display name must be 80 characters or fewer.";
    }
    if (data.reviewText.length < MIN_REVIEW_LENGTH) {
      errors.reviewText = "Write at least 10 characters about your experience.";
    } else if (data.reviewText.length > MAX_REVIEW_LENGTH) {
      errors.reviewText = "Review must be 600 characters or fewer.";
    }
    if (data.reviewerType && ["student", "parent"].indexOf(data.reviewerType) === -1) {
      errors.reviewerType = "Choose a valid reviewer type.";
    }
    return errors;
  }

  function calculateSummary(reviews) {
    if (!reviews.length) return { average: 0, count: 0 };
    var total = reviews.reduce(function (sum, review) { return sum + Number(review.rating); }, 0);
    return { average: total / reviews.length, count: reviews.length };
  }

  function starsText(rating) {
    var rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  }

  function formatDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(date);
  }

  function renderReviews(reviews) {
    list.replaceChildren();
    if (!reviews.length) {
      summary.hidden = true;
      status.textContent = "No published reviews yet. Be the first to share your experience.";
      return;
    }

    var totals = calculateSummary(reviews);
    averageEl.textContent = totals.average.toFixed(1);
    countEl.textContent = totals.count + (totals.count === 1 ? " published review" : " published reviews");
    summaryStars.textContent = starsText(totals.average);
    summary.hidden = false;
    status.textContent = "";

    reviews.forEach(function (review) {
      var card = document.createElement("article");
      card.className = "review-card";

      var stars = document.createElement("div");
      stars.className = "review-stars";
      stars.setAttribute("aria-label", review.rating + " out of 5 stars");
      stars.textContent = starsText(review.rating);

      var quote = document.createElement("blockquote");
      quote.textContent = review.review_text;

      var meta = document.createElement("div");
      meta.className = "review-meta";
      var identity = document.createElement("div");
      var name = document.createElement("strong");
      name.className = "reviewer-name";
      name.textContent = review.display_name;
      identity.appendChild(name);
      if (review.reviewer_type) {
        var label = document.createElement("span");
        label.className = "reviewer-label";
        label.textContent = review.reviewer_type === "parent" ? "Parent" : "Student";
        identity.appendChild(label);
      }
      var date = document.createElement("time");
      date.className = "review-date";
      date.dateTime = review.created_at || "";
      date.textContent = formatDate(review.created_at);
      meta.append(identity, date);
      card.append(stars, quote, meta);
      list.appendChild(card);
    });
  }

  function loadReviews() {
    if (!isConfigured()) {
      status.textContent = "Reviews will appear here once the review service is connected.";
      return Promise.resolve([]);
    }
    var query = "/rest/v1/reviews?select=id,display_name,reviewer_type,rating,review_text,created_at&status=eq.approved&order=approved_at.desc.nullslast,created_at.desc";
    return fetch(apiUrl + query, { headers: apiHeaders(false) })
      .then(function (response) {
        if (!response.ok) throw new Error("Unable to load reviews");
        return response.json();
      })
      .then(function (reviews) { renderReviews(reviews); return reviews; })
      .catch(function () {
        status.textContent = "Reviews are temporarily unavailable. Please try again later.";
        return [];
      });
  }

  function setFieldError(fieldId, errorId, text) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (field) field.setAttribute("aria-invalid", text ? "true" : "false");
    if (error) error.textContent = text || "";
  }

  function updateStars() {
    var checked = form ? form.querySelector('input[name="rating"]:checked') : null;
    var value = checked ? Number(checked.value) : 0;
    document.querySelectorAll(".star-options label").forEach(function (label, index) {
      label.classList.toggle("is-active", index < value);
    });
  }

  function openForm() {
    panel.hidden = false;
    formOpenedAt = Date.now();
    document.querySelector("[data-review-form-toggle]").setAttribute("aria-expanded", "true");
    document.getElementById("rating-1").focus();
  }

  function closeForm() {
    panel.hidden = true;
    document.querySelector("[data-review-form-toggle]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-review-form-toggle]").focus();
  }

  document.querySelectorAll("[data-review-form-toggle]").forEach(function (button) {
    button.addEventListener("click", openForm);
  });
  document.querySelectorAll("[data-review-form-close]").forEach(function (button) {
    button.addEventListener("click", closeForm);
  });
  document.querySelectorAll('.star-options input[name="rating"]').forEach(function (input) {
    input.addEventListener("change", updateStars);
  });
  if (reviewText) {
    reviewText.addEventListener("input", function () {
      characterCount.textContent = reviewText.value.length + " / " + MAX_REVIEW_LENGTH;
    });
  }

  if (form) form.addEventListener("submit", function (event) {
    event.preventDefault();
    message.className = "form-message";
    message.textContent = "";

    var formData = new FormData(form);
    var payload = {
      rating: Number(formData.get("rating")),
      displayName: normalizeText(formData.get("displayName")),
      reviewerType: String(formData.get("reviewerType") || ""),
      reviewText: normalizeText(formData.get("reviewText"))
    };
    var errors = validateReview(payload);
    setFieldError("rating-1", "rating-error", errors.rating);
    setFieldError("reviewer-name", "name-error", errors.displayName);
    setFieldError("review-text", "review-error", errors.reviewText);

    if (Object.keys(errors).length) {
      message.classList.add("is-error");
      message.textContent = "Please fix the highlighted fields.";
      return;
    }
    if (formData.get("website") || Date.now() - formOpenedAt < 2000) {
      message.classList.add("is-success");
      message.textContent = "Thanks! Your review has been submitted for approval.";
      form.reset();
      updateStars();
      return;
    }
    if (!isConfigured()) {
      message.classList.add("is-error");
      message.textContent = "Review submissions are not configured yet. Please try again later.";
      return;
    }

    var submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";
    fetch(apiUrl + "/rest/v1/reviews", {
      method: "POST",
      headers: Object.assign(apiHeaders(true), { Prefer: "return=minimal" }),
      body: JSON.stringify({
        display_name: payload.displayName,
        reviewer_type: payload.reviewerType || null,
        rating: payload.rating,
        review_text: payload.reviewText
      })
    }).then(function (response) {
      if (!response.ok) throw new Error("Unable to submit review");
      form.reset();
      updateStars();
      characterCount.textContent = "0 / " + MAX_REVIEW_LENGTH;
      message.classList.add("is-success");
      message.textContent = "Thanks! Your review has been submitted for approval.";
      formOpenedAt = Date.now();
    }).catch(function () {
      message.classList.add("is-error");
      message.textContent = "We couldn't submit your review. Please try again in a moment.";
    }).finally(function () {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Review";
    });
  });

  window.ReviewsSystem = {
    calculateSummary: calculateSummary,
    normalizeText: normalizeText,
    starsText: starsText,
    validateReview: validateReview
  };

  loadReviews();
})();
