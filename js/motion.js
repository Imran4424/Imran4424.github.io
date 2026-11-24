(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");
  const heroVisual = hero?.querySelector(".hero-visual");
  const replay = heroVisual?.querySelector(".hero-replay");
  const projectGrid = document.querySelector(".project-grid");
  const landingSection = document.querySelector(":target")?.closest("main section");

  function playHero() {
    if (!heroVisual || reducedMotion.matches) return;

    // Restart the artwork when replay is pressed during an entrance.
    heroVisual.classList.remove("is-playing");
    void heroVisual.offsetWidth;
    heroVisual.classList.add("is-playing");
  }

  function syncMotionPreference() {
    if (replay) replay.hidden = reducedMotion.matches;
    if (reducedMotion.matches) {
      heroVisual?.classList.remove("is-playing");
      document.querySelectorAll(".is-revealing, .is-filtering").forEach((element) => {
        element.classList.remove("is-revealing", "is-filtering");
      });
    }
  }

  syncMotionPreference();
  reducedMotion.addEventListener("change", syncMotionPreference);

  if (hero && (!landingSection || landingSection === hero) && window.scrollY < innerHeight / 2 && !reducedMotion.matches) {
    hero.querySelector(".hero-copy")?.classList.add("is-revealing");
  }

  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries, source) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      source.unobserve(target);
      if (target === heroVisual) playHero();
      else if (!reducedMotion.matches) target.classList.add("is-revealing");
    });
  }, { threshold: .26 }) : null;

  if (observer) {
    document.querySelectorAll(
      ".hero-visual, .section-heading, .project-card, .experience-intro, .timeline-item, " +
      ".about-portrait, .about-copy, .tutorial-card, .article-row, .contact-copy, .contact-mail-card, .contact-method"
    ).forEach((element) => {
      if (!landingSection?.contains(element) || landingSection === hero) observer.observe(element);
    });
  } else if (!landingSection || landingSection === hero) {
    playHero();
  }

  replay?.addEventListener("click", () => {
    observer?.unobserve(heroVisual);
    playHero();
  });

  projectGrid?.addEventListener("portfolio:filter", () => {
    if (reducedMotion.matches) return;

    const cards = projectGrid.querySelectorAll("[data-project]");
    cards.forEach((card) => card.classList.remove("is-filtering"));
    let index = 0;
    cards.forEach((card) => {
      if (card.hidden) return;
      const bounds = card.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;

      observer?.unobserve(card);
      card.style.setProperty("--filter-delay", `${Math.min(index * 48, 144)}ms`);
      card.classList.add("is-filtering");
      index += 1;
    });
  });
})();
