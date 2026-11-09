/* Optional enhancements: the complete portfolio remains readable without JavaScript. */
(() => {
  "use strict";

  function initPortfolio() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("primary-nav");

    if (menuToggle && navigation) {
      const setMenuOpen = (open) => {
        menuToggle.setAttribute("aria-expanded", String(open));
        navigation.classList.toggle("is-open", open);
      };

      menuToggle.addEventListener("click", () => {
        setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
      });

      navigation.addEventListener("click", (event) => {
        if (event.target.closest('a[href^="#"]')) setMenuOpen(false);
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
          setMenuOpen(false);
          menuToggle.focus();
        }
      });

      document.addEventListener("click", (event) => {
        if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
          setMenuOpen(false);
        }
      });

      const desktop = window.matchMedia("(min-width: 761px)");
      const resetDesktopMenu = (event) => {
        if (event.matches) setMenuOpen(false);
      };
      if (desktop.addEventListener) desktop.addEventListener("change", resetDesktopMenu);
      else desktop.addListener(resetDesktopMenu);
      resetDesktopMenu(desktop);
    }

    const filterControls = document.getElementById("project-filters");
    const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
    const projects = Array.from(document.querySelectorAll("[data-project]"));
    const filterStatus = document.getElementById("filter-status");
    const projectGrid = document.querySelector(".project-grid");

    if (filterControls && filterButtons.length && projects.length) {
      filterButtons.forEach((button) => {
        const count = projects.filter((project) => (
          button.dataset.filter === "all" || project.dataset.category === button.dataset.filter
        )).length;
        const countLabel = button.querySelector("span");
        if (countLabel) countLabel.textContent = String(count).padStart(2, "0");

        button.addEventListener("click", () => {
          const filter = button.dataset.filter;
          if (!["all", "ios", "android"].includes(filter)) return;

          let visibleCount = 0;
          projects.forEach((project) => {
            const visible = filter === "all" || project.dataset.category === filter;
            project.hidden = !visible;
            if (visible) visibleCount += 1;
          });

          filterButtons.forEach((item) => {
            item.setAttribute("aria-pressed", String(item === button));
          });
          if (projectGrid) projectGrid.dataset.activeFilter = filter;
          if (filterStatus) {
            const category = filter === "ios" ? "iOS " : filter === "android" ? "Android " : "";
            filterStatus.textContent = `Showing ${visibleCount} ${category}project${visibleCount === 1 ? "" : "s"}.`;
          }
        });
      });
      filterControls.hidden = false;
    }

    const year = document.getElementById("current-year");
    if (year) year.textContent = String(new Date().getFullYear());

    const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
    const sections = navLinks.map((link) => {
      const href = link.getAttribute("href");
      return href && href.startsWith("#") ? document.getElementById(href.slice(1)) : null;
    }).filter(Boolean);

    if (sections.length) {
      const header = document.querySelector(".site-header");
      let framePending = false;
      let activeId;

      const updateActiveSection = () => {
        framePending = false;
        const readingLine = (header?.getBoundingClientRect().height || 0) + 80;
        let active;
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= readingLine) active = section;
        });

        // The final section may be too short to reach the reading line.
        const pageHeight = document.scrollingElement?.scrollHeight || document.documentElement.scrollHeight;
        if (window.scrollY > 0 && window.scrollY + window.innerHeight >= pageHeight - 2) {
          active = sections[sections.length - 1];
        }

        const nextId = active?.id || null;
        if (nextId === activeId) return;
        activeId = nextId;
        navLinks.forEach((link) => {
          if (activeId && link.getAttribute("href") === `#${activeId}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      };

      const scheduleSectionUpdate = () => {
        if (!framePending) {
          framePending = true;
          window.requestAnimationFrame(updateActiveSection);
        }
      };
      window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
      window.addEventListener("resize", scheduleSectionUpdate);
      window.addEventListener("load", scheduleSectionUpdate, { once: true });
      document.fonts?.ready.then(scheduleSectionUpdate);
      updateActiveSection();
    }

    const copyButton = document.getElementById("copy-email");
    const copyStatus = document.getElementById("copy-status");

    if (copyButton && copyButton.dataset.email && window.isSecureContext && navigator.clipboard?.writeText) {
      const defaultLabel = Array.from(copyButton.childNodes, (node) => node.cloneNode(true));
      const restoreLabel = () => copyButton.replaceChildren(...defaultLabel.map((node) => node.cloneNode(true)));
      let resetLabel;
      copyButton.addEventListener("click", async () => {
        window.clearTimeout(resetLabel);
        copyButton.disabled = true;
        try {
          await navigator.clipboard.writeText(copyButton.dataset.email);
          copyButton.textContent = "Copied!";
          if (copyStatus) copyStatus.textContent = "Email address copied to clipboard.";
        } catch {
          restoreLabel();
          if (copyStatus) copyStatus.textContent = "Couldn't copy the address. Please use the email link.";
        } finally {
          copyButton.disabled = false;
          resetLabel = window.setTimeout(() => {
            restoreLabel();
          }, 2000);
        }
      });
      copyButton.hidden = false;
    }

    document.documentElement.classList.add("js");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolio, { once: true });
  } else {
    initPortfolio();
  }
})();
