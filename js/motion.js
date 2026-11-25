(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const hero = document.querySelector(".hero");
  const heroVisual = hero?.querySelector(".hero-visual");
  const replay = heroVisual?.querySelector(".hero-replay");
  const gestureHint = document.getElementById("lif-gesture-hint");
  const projectGrid = document.querySelector(".project-grid");
  const cards = projectGrid?.querySelectorAll("[data-project]");
  const landingSection = document.querySelector(":target")?.closest("main section");
  const previousCardPositions = new Map();
  let driftFrame = 0;
  let pointerX;
  let pointerY;
  const dragLimit = 60;
  let gesture;
  let springFrame = 0;
  let swipeOffset = 0;

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

  function renderSwipe(offset) {
    swipeOffset = Math.max(-dragLimit + 1, Math.min(dragLimit - 1, offset));
    heroVisual.style.setProperty("--hero-swipe", `${swipeOffset}px`);
    heroVisual.style.setProperty("--hero-swipe-tilt", `${swipeOffset * .12}deg`);
  }

  function resetSwipe() {
    cancelAnimationFrame(springFrame);
    springFrame = 0;
    const pointerId = gesture?.pointerId;
    gesture = undefined;
    swipeOffset = 0;
    if (pointerId !== undefined && heroVisual?.hasPointerCapture(pointerId)) {
      heroVisual.releasePointerCapture(pointerId);
    }
    heroVisual?.classList.remove("is-swiping");
    heroVisual?.style.removeProperty("--hero-swipe");
    heroVisual?.style.removeProperty("--hero-swipe-tilt");
  }

  function settleSwipe(velocity) {
    const from = swipeOffset;
    const start = performance.now();
    const damping = 12;
    const frequency = 17;
    const momentum = (velocity + damping * from) / frequency;

    // A damped spring starts at the actual drag position and release velocity.
    const step = (now) => {
      const time = (now - start) / 1000;
      if (time >= .55) {
        springFrame = 0;
        swipeOffset = 0;
        heroVisual.style.removeProperty("--hero-swipe");
        heroVisual.style.removeProperty("--hero-swipe-tilt");
        heroVisual.classList.remove("is-swiping");
        return;
      }

      const phase = frequency * time;
      renderSwipe(Math.exp(-damping * time) * (from * Math.cos(phase) + momentum * Math.sin(phase)));
      springFrame = requestAnimationFrame(step);
    };
    springFrame = requestAnimationFrame(step);
  }

  function followSwipe(event) {
    const dx = event.clientX - gesture.startX;
    if (!gesture.active) {
      const dy = event.clientY - gesture.startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        gesture = undefined;
        return;
      }

      observer?.unobserve(heroVisual);
      resetDrift();
      cancelAnimationFrame(springFrame);
      springFrame = 0;
      gesture.active = true;
      // Invert the resistance curve so grabbing a moving artwork stays continuous.
      gesture.origin = swipeOffset / (1 - Math.abs(swipeOffset) / dragLimit);
      heroVisual.classList.remove("is-playing");
      heroVisual.classList.add("is-swiping");
      heroVisual.setPointerCapture(event.pointerId);
    }

    const distance = gesture.origin + dx;
    const next = distance / (1 + Math.abs(distance) / dragLimit);
    const dt = Math.max(8, event.timeStamp - gesture.lastMove) / 1000;
    gesture.velocity = gesture.velocity * .42 + (next - swipeOffset) / dt * .58;
    gesture.lastMove = event.timeStamp;
    renderSwipe(next);
  }

  function endSwipe(event) {
    if (event.pointerId !== gesture?.pointerId) return;
    const { active, lastMove, velocity } = gesture;
    gesture = undefined;
    if (!active) return;
    const recentRelease = event.type === "pointerup" && event.timeStamp - lastMove < 85;
    const momentum = recentRelease ? Math.max(-320, Math.min(320, velocity)) : 0;
    settleSwipe(momentum);
  }

  function playHero() {
    if (!heroVisual || reducedMotion.matches) return;

    resetDrift();
    resetSwipe();
    // Restart the artwork when replay is pressed during an entrance.
    heroVisual.classList.remove("is-playing");
    void heroVisual.offsetWidth;
    heroVisual.classList.add("is-playing");
  }

  function syncMotionPreference() {
    if (replay) replay.hidden = reducedMotion.matches;
    const gestureEnabled = "PointerEvent" in window && !reducedMotion.matches;
    heroVisual?.classList.toggle("has-artwork-gesture", gestureEnabled);
    if (gestureHint) gestureHint.hidden = !gestureEnabled;
    if (reducedMotion.matches) {
      resetDrift();
      resetSwipe();
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

  heroVisual?.addEventListener("pointerdown", (event) => {
    if (reducedMotion.matches || !event.isPrimary || event.button !== 0 || gesture || event.target.closest("button, a")) return;
    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastMove: event.timeStamp,
      velocity: 0
    };
  });

  heroVisual?.addEventListener("pointermove", (event) => {
    if (event.pointerId === gesture?.pointerId) {
      followSwipe(event);
      return;
    }
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== "mouse"
      || heroVisual.classList.contains("is-playing") || heroVisual.classList.contains("is-swiping")) return;

    if (replay?.contains(event.target)) {
      resetDrift();
      return;
    }

    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!driftFrame) driftFrame = requestAnimationFrame(updateDrift);
  }, { passive: true });

  heroVisual?.addEventListener("pointerleave", () => {
    if (gesture && !gesture.active) gesture = undefined;
    resetDrift();
  });
  heroVisual?.addEventListener("pointerup", endSwipe);
  heroVisual?.addEventListener("pointercancel", endSwipe);
  heroVisual?.addEventListener("lostpointercapture", (event) => {
    if (event.target === heroVisual) endSwipe(event);
  });
  heroVisual?.addEventListener("dragstart", (event) => {
    if (heroVisual.classList.contains("has-artwork-gesture")) event.preventDefault();
  });
  replay?.addEventListener("focus", resetDrift);
  finePointer.addEventListener("change", resetDrift);
  window.addEventListener("blur", () => {
    resetDrift();
    resetSwipe();
  });

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
