(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const hero = document.querySelector(".hero");
  const heroVisual = hero?.querySelector(".hero-visual");
  const replay = heroVisual?.querySelector(".hero-replay");
  const projectGrid = document.querySelector(".project-grid");
  const cards = projectGrid?.querySelectorAll("[data-project]");
  const landingSection = document.querySelector(":target")?.closest("main section");
  const previousCardPositions = new Map();
  let driftFrame = 0;
  let pointerX;
  let pointerY;

  function resetDrift() {
    cancelAnimationFrame(driftFrame);
    driftFrame = 0;
    heroVisual?.classList.remove("is-tracking");
    heroVisual?.style.removeProperty("--hero-drift-x");
    heroVisual?.style.removeProperty("--hero-drift-y");
  }

  function updateDrift() {
    driftFrame = 0;
    const { left, top, width, height } = heroVisual.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, 2 * (pointerX - left) / width - 1));
    const y = Math.max(-1, Math.min(1, 2 * (pointerY - top) / height - 1));
    heroVisual.classList.add("is-tracking");
    heroVisual.style.setProperty("--hero-drift-x", `${(x * 13).toFixed(2)}px`);
    heroVisual.style.setProperty("--hero-drift-y", `${(y * 10).toFixed(2)}px`);
  }

  function playHero() {
    if (!heroVisual || reducedMotion.matches) return;

    resetDrift();
    // Restart the artwork when replay is pressed during an entrance.
    heroVisual.classList.remove("is-playing");
    void heroVisual.offsetWidth;
    heroVisual.classList.add("is-playing");
  }

  function syncMotionPreference() {
    if (replay) replay.hidden = reducedMotion.matches;
    if (reducedMotion.matches) {
      resetDrift();
      heroVisual?.classList.remove("is-playing");
      previousCardPositions.clear();
      document.querySelectorAll(".is-revealing, .is-filtering, .is-reflowing").forEach((element) => {
        element.classList.remove("is-revealing", "is-filtering", "is-reflowing");
      });
    }
  }

  syncMotionPreference();
  reducedMotion.addEventListener("change", syncMotionPreference);

  if (hero && (!landingSection || landingSection === hero) && window.scrollY < innerHeight / 2 && !reducedMotion.matches) {
    hero.querySelector(".hero-copy")?.classList.add("is-revealing");
  }

  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries, source) => {
    entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      const threshold = target === heroVisual ? .3 : .16;
      if (!isIntersecting || intersectionRatio < threshold) return;
      source.unobserve(target);
      if (target === heroVisual) playHero();
      else if (!reducedMotion.matches) target.classList.add("is-revealing");
    });
  }, { threshold: [.16, .3] }) : null;

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

  heroVisual?.addEventListener("animationend", (event) => {
    if (event.animationName === "portfolio-badge-spring" && event.target.classList.contains("code-note")) {
      heroVisual.classList.remove("is-playing");
    }
  });

  heroVisual?.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== "mouse"
      || heroVisual.classList.contains("is-playing")) return;

    if (replay?.contains(event.target)) {
      resetDrift();
      return;
    }

    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!driftFrame) driftFrame = requestAnimationFrame(updateDrift);
  }, { passive: true });

  heroVisual?.addEventListener("pointerleave", resetDrift);
  heroVisual?.addEventListener("pointercancel", resetDrift);
  replay?.addEventListener("focus", resetDrift);
  finePointer.addEventListener("change", resetDrift);
  window.addEventListener("blur", resetDrift);

  projectGrid?.addEventListener("portfolio:before-filter", () => {
    previousCardPositions.clear();
    if (reducedMotion.matches) return;

    const gridBounds = projectGrid.getBoundingClientRect();
    cards.forEach((card) => {
      if (card.hidden) return;
      const bounds = card.getBoundingClientRect();
      previousCardPositions.set(card, {
        x: bounds.left - gridBounds.left,
        y: bounds.top - gridBounds.top
      });
    });
  });

  projectGrid?.addEventListener("portfolio:filter", () => {
    if (reducedMotion.matches) return;

    cards.forEach((card) => card.classList.remove("is-filtering", "is-reflowing", "is-revealing"));
    const gridBounds = projectGrid.getBoundingClientRect();
    const visibleCards = [];
    cards.forEach((card) => {
      if (card.hidden) return;
      const bounds = card.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < innerHeight) visibleCards.push({ card, bounds });
    });

    let index = 0;
    visibleCards.forEach(({ card, bounds }) => {
      observer?.unobserve(card);
      const previous = previousCardPositions.get(card);
      if (previous) {
        const x = previous.x - (bounds.left - gridBounds.left);
        const y = previous.y - (bounds.top - gridBounds.top);
        if (Math.abs(x) < 1 && Math.abs(y) < 1) return;

        // Keep cards moving within the visible grid even when a filter removes several rows.
        card.style.setProperty("--filter-start-x", `${Math.max(-36, Math.min(36, x))}px`);
        card.style.setProperty("--filter-start-y", `${Math.max(-72, Math.min(72, y))}px`);
        card.classList.add("is-reflowing");
      } else {
        card.style.setProperty("--filter-delay", `${Math.min(index * 62, 186)}ms`);
        card.classList.add("is-filtering");
      }
      index += 1;
    });
    previousCardPositions.clear();
  });

  projectGrid?.addEventListener("animationend", ({ animationName, target }) => {
    if (animationName === "portfolio-filter-in" || animationName === "portfolio-filter-move") {
      target.classList.remove("is-filtering", "is-reflowing");
    }
  });
})();
