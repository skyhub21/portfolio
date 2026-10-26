/* ============================================================
   THE ANCIENT SIGNAL — navigation.js
   ------------------------------------------------------------
   Handles:
     - Desktop sidebar navigation (active state + smooth scroll)
     - Mobile bottom navigation (active state + smooth scroll)
     - Scroll-spy active-section highlighting
     - Optional System panel toggle (secondary, non-intrusive)
     - Respects prefers-reduced-motion for smooth scrolling

   Depends on:
     - index.html structure from Step 1
       (#sidebar, .nav-link, .mobile-nav__link, .section[data-section],
        #systemToggle, #systemPanel, #systemClose)
   No dependency on projects.js, gallery.js or main.js.
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Section order — MUST match index.html section order.
     Used to decide which link is active as a fallback.
     ------------------------------------------------------------ */
  const SECTION_ORDER = ["signal", "origin", "codex", "archive", "transmission"];

  /* ------------------------------------------------------------
     Environment checks
     ------------------------------------------------------------ */
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     Element lookup
     ------------------------------------------------------------ */
  const sections = Array.from(
    document.querySelectorAll(".section[data-section]")
  );

  const desktopLinks = Array.from(
    document.querySelectorAll(".sidebar .nav-link[data-section]")
  );

  const mobileLinks = Array.from(
    document.querySelectorAll(".mobile-nav__link[data-section]")
  );

  const allLinks = desktopLinks.concat(mobileLinks);

  /* ------------------------------------------------------------
     Utilities
     ------------------------------------------------------------ */

  /**
   * Convert a hash like "#signal" into a plain section key.
   * @param {string} hash
   * @returns {string}
   */
  function hashToKey(hash) {
    return (hash || "").replace(/^#/, "");
  }

  /**
   * Return the id of the section currently closest to the top of
   * the viewport, within a small threshold.
   * @returns {string}
   */
  function getActiveSectionId() {
    if (!sections.length) return "";

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const viewportH = window.innerHeight || 0;

    // Threshold: a section becomes "active" once its top edge is
    // within the top 35% of the viewport. This keeps the active
    // state stable when a section header is near the top of screen.
    const threshold = viewportH * 0.35;

    let activeId = sections[0].id;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const top = section.getBoundingClientRect().top + scrollY;

      if (top - threshold <= scrollY) {
        activeId = section.id;
      } else {
        break;
      }
    }

    // If the user has scrolled to the very bottom, force the last
    // section active — otherwise the final short section may never
    // reach the threshold.
    const docHeight = document.documentElement.scrollHeight || 0;
    const atBottom = scrollY + viewportH >= docHeight - 4;
    if (atBottom) {
      activeId = sections[sections.length - 1].id;
    }

    return activeId;
  }

  /**
   * Update is-active state on all nav links.
   * @param {string} activeId
   */
  function setActiveLink(activeId) {
    allLinks.forEach(function (link) {
      const key = link.getAttribute("data-section");
      const isActive = key === activeId;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /**
   * Scroll to a section by id, honouring reduced-motion.
   * @param {string} id
   */
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    // Let the CSS handle the offset via scroll-margin-top.
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  /* ------------------------------------------------------------
     Smooth scroll for in-page links (nav + hero buttons + others)
     ------------------------------------------------------------ */
  function handleAnchorClick(event) {
    const link = event.currentTarget;
    const href = link.getAttribute("href") || "";

    if (!href.startsWith("#")) return;

    const id = hashToKey(href);
    if (!id || !document.getElementById(id)) return;

    event.preventDefault();

    // Update the URL without an abrupt jump, for shareability.
    if (history.replaceState) {
      history.replaceState(null, "", "#" + id);
    } else {
      window.location.hash = id;
    }

    scrollToSection(id);

    // If focus is inside a link, move it to the target section for
    // keyboard and screen-reader users.
    const target = document.getElementById(id);
    if (target) {
      const hadTabIndex = target.hasAttribute("tabindex");
      if (!hadTabIndex) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (!hadTabIndex) {
        target.addEventListener(
          "blur",
          function () {
            target.removeAttribute("tabindex");
          },
          { once: true }
        );
      }
    }
  }

  /* ------------------------------------------------------------
     Scroll spy — throttled with requestAnimationFrame
     ------------------------------------------------------------ */
  let rafPending = false;

  function onScroll() {
    if (rafPending) return;
    rafPending = true;

    window.requestAnimationFrame(function () {
      rafPending = false;
      const activeId = getActiveSectionId();
      if (activeId) setActiveLink(activeId);
    });
  }

  /* ------------------------------------------------------------
     System panel (optional secondary control)
     ------------------------------------------------------------ */
  const systemToggle = document.getElementById("systemToggle");
  const systemPanel = document.getElementById("systemPanel");
  const systemClose = document.getElementById("systemClose");

  function openSystemPanel() {
    if (!systemPanel || !systemToggle) return;
    systemPanel.hidden = false;
    systemToggle.setAttribute("aria-expanded", "true");
    // Move focus into the panel for keyboard users.
    if (systemClose) systemClose.focus();
  }

  function closeSystemPanel(returnFocus) {
    if (!systemPanel || !systemToggle) return;
    systemPanel.hidden = true;
    systemToggle.setAttribute("aria-expanded", "false");
    if (returnFocus && systemToggle) systemToggle.focus();
  }

  function toggleSystemPanel() {
    if (!systemPanel) return;
    const isOpen = !systemPanel.hidden;
    if (isOpen) {
      closeSystemPanel(true);
    } else {
      openSystemPanel();
    }
  }

  function handleSystemKeydown(event) {
    if (event.key === "Escape" && systemPanel && !systemPanel.hidden) {
      event.preventDefault();
      closeSystemPanel(true);
    }
  }

  /* ------------------------------------------------------------
     Initialise
     ------------------------------------------------------------ */
  function init() {
    // Wire smooth scrolling for every in-page nav link and any
    // other same-document anchor (e.g. hero buttons).
    const anchorLinks = Array.from(
      document.querySelectorAll('a[href^="#"]')
    );
    anchorLinks.forEach(function (link) {
      link.addEventListener("click", handleAnchorClick);
    });

    // Reflect the current hash on load, if present and valid.
    const initialHash = hashToKey(window.location.hash);
    if (initialHash && document.getElementById(initialHash)) {
      // Delay slightly so the browser has completed initial layout.
      window.setTimeout(function () {
        scrollToSection(initialHash);
      }, 0);
    } else {
      // Otherwise compute the initial active section.
      const initial = getActiveSectionId();
      if (initial) setActiveLink(initial);
    }

    // Scroll spy
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // System panel wiring (optional)
    if (systemToggle) {
      systemToggle.addEventListener("click", toggleSystemPanel);
    }
    if (systemClose) {
      systemClose.addEventListener("click", function () {
        closeSystemPanel(true);
      });
    }
    document.addEventListener("keydown", handleSystemKeydown);

    // Close the system panel when clicking outside of it.
    document.addEventListener("click", function (event) {
      if (!systemPanel || systemPanel.hidden) return;
      const target = event.target;
      if (
        systemPanel.contains(target) ||
        (systemToggle && systemToggle.contains(target))
      ) {
        return;
      }
      closeSystemPanel(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();