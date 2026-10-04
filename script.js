(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var config = window.SITE_CONFIG || {};
  var calendlyUrl = config.calendlyUrl || "#book";
  var stripeUrl = config.stripeUrl || "#book";
  var contactEmail = config.contactEmail || "";
  var videoPlatform = config.videoPlatform || "Google Meet or Zoom";

  document.querySelectorAll("[data-calendly]").forEach(function (el) {
    el.setAttribute("href", calendlyUrl);
  });

  document.querySelectorAll("[data-stripe]").forEach(function (el) {
    el.setAttribute("href", stripeUrl);
  });

  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (!contactEmail) return;
    el.setAttribute("href", "mailto:" + contactEmail);
    if (el.dataset.emailText === "true") el.textContent = contactEmail;
  });

  document.querySelectorAll("[data-video-platform]").forEach(function (el) {
    el.textContent = videoPlatform;
  });

  var menuToggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
