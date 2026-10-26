/* ============================================================
   THE ANCIENT SIGNAL — main.js
   ------------------------------------------------------------
   Handles:
     - Rendering project cards dynamically from window.PROJECTS
     - Rendering project detail content into the modal
     - Building technology filter chips from project data
     - Search + technology filtering (combined)
     - Project count and empty-state handling
     - Conditional GitHub / Live demo buttons in the modal
     - Scroll-triggered reveals via IntersectionObserver
       (with graceful fallback and prefers-reduced-motion respect)

   Depends on:
     - index.html structure from Step 1
     - window.PROJECTS from js/projects.js
     - window.SignalGallery from js/gallery.js
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Guard: bail early if prerequisites are missing
     ------------------------------------------------------------ */
  if (!window.PROJECTS || !Array.isArray(window.PROJECTS)) {
    // eslint-disable-next-line no-console
    console.warn(
      "[THE ANCIENT SIGNAL] projects.js was not loaded before main.js. " +
        "Project cards cannot be rendered."
    );
    return;
  }

  /* ------------------------------------------------------------
     DOM references
     ------------------------------------------------------------ */
  const grid = document.getElementById("projectGrid");
  const emptyState = document.getElementById("archiveEmpty");
  const countEl = document.getElementById("projectCount");
  const searchInput = document.getElementById("projectSearch");
  const filtersContainer = document.getElementById("archiveControls");
  const clearFiltersBtn = document.getElementById("clearFilters");

  // Modal field references (populated by gallery.js's open/close)
  const modal = document.getElementById("projectModal");
  const modalCategory = document.getElementById("modalCategory");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalSummary = document.getElementById("modalSummary");
  const modalTags = document.getElementById("modalTags");
  const modalPurpose = document.getElementById("modalPurpose");
  const modalDescription = document.getElementById("modalDescription");
  const modalFeatures = document.getElementById("modalFeatures");
  const modalChallenges = document.getElementById("modalChallenges");
  const modalLessons = document.getElementById("modalLessons");
  const modalStatus = document.getElementById("modalStatus");
  const modalGithub = document.getElementById("modalGithub");
  const modalLive = document.getElementById("modalLive");

  /* ------------------------------------------------------------
     State
     ------------------------------------------------------------ */
  const state = {
    activeTech: "all",   // "all" or a technology string
    query: ""            // trimmed, lowercased search string
  };

  /* ------------------------------------------------------------
     Small utilities
     ------------------------------------------------------------ */

  /**
   * Safe text setter — treats null / undefined as empty string.
   * @param {HTMLElement|null} el
   * @param {string} text
   */
  function setText(el, text) {
    if (!el) return;
    el.textContent = text == null ? "" : String(text);
  }

  /**
   * Slugify a technology name for use as a class suffix.
   * Only used as an aid; behaviour keys off data-* attributes.
   * @param {string} value
   * @returns {string}
   */
  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Return a stable, sorted, deduplicated list of technologies
   * across all projects.
   * @returns {string[]}
   */
  function collectTechnologies() {
    const seen = Object.create(null);
    const out = [];
    window.PROJECTS.forEach(function (project) {
      const techs = Array.isArray(project.technologies)
        ? project.technologies
        : [];
      techs.forEach(function (tech) {
        if (typeof tech === "string" && tech.trim() && !seen[tech]) {
          seen[tech] = true;
          out.push(tech);
        }
      });
    });
    out.sort(function (a, b) {
      return a.localeCompare(b);
    });
    return out;
  }

  /**
   * Build a single haystack string for a project used by search.
   * @param {Object} project
   * @returns {string}
   */
  function projectHaystack(project) {
    const parts = [
      project.title,
      project.subtitle,
      project.category,
      project.summary,
      project.description,
      project.purpose,
      project.status
    ];
    if (Array.isArray(project.technologies)) {
      parts.push(project.technologies.join(" "));
    }
    return parts
      .filter(function (v) {
        return typeof v === "string" && v;
      })
      .join(" ")
      .toLowerCase();
  }

  /* ------------------------------------------------------------
     Filter chips
     ------------------------------------------------------------ */

  /**
   * Rebuild the filter chip row from the union of technologies.
   * Preserves the current active tech if still available.
   */
  function renderFilterChips() {
    if (!filtersContainer) return;

    const existingRow = filtersContainer.querySelector(".archive__filters");
    if (!existingRow) return;

    const techs = collectTechnologies();
    const fragment = document.createDocumentFragment();

    const makeChip = function (label, value) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip";
      btn.dataset.filter = value;
      btn.textContent = label;
      if (state.activeTech === value) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.setAttribute("aria-pressed", "false");
      }
      return btn;
    };

    fragment.appendChild(makeChip("All", "all"));
    techs.forEach(function (tech) {
      fragment.appendChild(makeChip(tech, tech));
    });

    // Replace the row entirely (avoids stale chips from Step 1 HTML).
    const newRow = existingRow.cloneNode(false);
    newRow.appendChild(fragment);
    existingRow.replaceWith(newRow);

    // Delegated click handling for chips
    newRow.addEventListener("click", function (event) {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      const value = chip.dataset.filter || "all";
      if (value === state.activeTech) return;
      state.activeTech = value;
      newRow.querySelectorAll(".filter-chip").forEach(function (el) {
        const active = el.dataset.filter === value;
        el.classList.toggle("is-active", active);
        el.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilters();
    });
  }

  /* ------------------------------------------------------------
     Project card rendering
     ------------------------------------------------------------ */

  /**
   * Build a project card element.
   * @param {Object} project
   * @returns {HTMLElement}
   */
  function buildCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";
    card.dataset.projectId = project.id;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      "Open details for project: " + (project.title || "Untitled")
    );

    // Cover
    const media = document.createElement("div");
    media.className = "project-card__media";

    const img = document.createElement("img");
    img.className = "project-card__cover";
    img.alt = project.title ? project.title + " — cover" : "";
    img.loading = "lazy";
    img.decoding = "async";
    if (project.cover) {
      img.src = project.cover;
    } else {
      img.classList.add("is-empty");
    }
    media.appendChild(img);

    // Status badge
    if (project.status) {
      const status = document.createElement("span");
      status.className = "status-badge status-badge--card";
      status.textContent = project.status;
      media.appendChild(status);
    }

    // Body
    const body = document.createElement("div");
    body.className = "project-card__body";

    if (project.category) {
      const category = document.createElement("p");
      category.className = "project-card__category";
      category.textContent = project.category;
      body.appendChild(category);
    }

    const title = document.createElement("h3");
    title.className = "project-card__title";
    title.textContent = project.title || "Untitled project";
    body.appendChild(title);

    if (project.subtitle) {
      const subtitle = document.createElement("p");
      subtitle.className = "project-card__subtitle";
      subtitle.textContent = project.subtitle;
      body.appendChild(subtitle);
    }

    if (project.summary) {
      const summary = document.createElement("p");
      summary.className = "project-card__summary";
      summary.textContent = project.summary;
      body.appendChild(summary);
    }

    // Tags
    if (Array.isArray(project.technologies) && project.technologies.length) {
      const tagList = document.createElement("ul");
      tagList.className = "tag-list tag-list--card";
      // Show at most 4 chips on the card for tidy layout.
      const maxTags = 4;
      project.technologies.slice(0, maxTags).forEach(function (tech) {
        const li = document.createElement("li");
        li.className = "tag";
        li.textContent = tech;
        tagList.appendChild(li);
      });
      if (project.technologies.length > maxTags) {
        const more = document.createElement("li");
        more.className = "tag tag--more";
        more.textContent = "+" + (project.technologies.length - maxTags);
        tagList.appendChild(more);
      }
      body.appendChild(tagList);
    }

    // Footer actions
    const footer = document.createElement("div");
    footer.className = "project-card__footer";

    const openHint = document.createElement("span");
    openHint.className = "project-card__open-hint";
    openHint.textContent = "Open record →";
    footer.appendChild(openHint);

    body.appendChild(footer);

    card.appendChild(media);
    card.appendChild(body);

    // Card activation: click + keyboard
    function activate() {
      openProject(project);
    }
    card.addEventListener("click", activate);
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });

    return card;
  }

  /**
   * Render the filtered project list.
   */
  function renderCards(projects) {
    if (!grid) return;

    grid.innerHTML = "";

    if (projects.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    const fragment = document.createDocumentFragment();
    projects.forEach(function (project) {
      fragment.appendChild(buildCard(project));
    });
    grid.appendChild(fragment);
  }

  /* ------------------------------------------------------------
     Filtering
     ------------------------------------------------------------ */
  function applyFilters() {
    const query = state.query;
    const tech = state.activeTech;

    const filtered = window.PROJECTS.filter(function (project) {
      // Technology filter
      if (tech !== "all") {
        const techs = Array.isArray(project.technologies)
          ? project.technologies
          : [];
        if (techs.indexOf(tech) === -1) return false;
      }

      // Search filter
      if (query) {
        const hay = projectHaystack(project);
        if (hay.indexOf(query) === -1) return false;
      }

      return true;
    });

    renderCards(filtered);
    updateCount(filtered.length);
  }

  function updateCount(n) {
    if (!countEl) return;
    const total = window.PROJECTS.length;
    if (n === total) {
      countEl.textContent = total + " record" + (total === 1 ? "" : "s");
    } else {
      countEl.textContent =
        n + " of " + total + " record" + (total === 1 ? "" : "s");
    }
  }

  /* ------------------------------------------------------------
     Search input
     ------------------------------------------------------------ */
  let searchDebounce = null;
  function onSearchInput(event) {
    const value = (event.target.value || "").trim().toLowerCase();
    if (searchDebounce) window.clearTimeout(searchDebounce);
    searchDebounce = window.setTimeout(function () {
      state.query = value;
      applyFilters();
    }, 120);
  }

  /* ------------------------------------------------------------
     Modal content rendering (called right before gallery opens)
     ------------------------------------------------------------ */

  /**
   * Populate the modal with the given project's data, then ask
   * gallery.js to open the modal.
   * @param {Object} project
   */
  function openProject(project) {
    if (!project) return;

    // Header
    setText(modalCategory, project.category || "Project");
    setText(modalTitle, project.title || "Untitled project");
    setText(modalSubtitle, project.subtitle || "");
    setText(modalSummary, project.summary || "");

    // Tags
    if (modalTags) {
      modalTags.innerHTML = "";
      if (Array.isArray(project.technologies)) {
        project.technologies.forEach(function (tech) {
          const li = document.createElement("li");
          li.className = "tag";
          li.textContent = tech;
          modalTags.appendChild(li);
        });
      }
    }

    // Long-form sections
    setText(modalPurpose, project.purpose || "—");
    setText(modalDescription, project.description || "—");

    renderList(modalFeatures, project.features);
    renderList(modalChallenges, project.challenges);
    renderList(modalLessons, project.lessons);

    // Status
    setText(modalStatus, project.status || "Unknown");

    // Conditional action buttons
    if (modalGithub) {
      if (project.github) {
        modalGithub.href = project.github;
        modalGithub.hidden = false;
      } else {
        modalGithub.href = "#";
        modalGithub.hidden = true;
      }
    }
    if (modalLive) {
      if (project.live) {
        modalLive.href = project.live;
        modalLive.hidden = false;
      } else {
        modalLive.href = "#";
        modalLive.hidden = true;
      }
    }

    // Delegate opening to gallery.js
    if (window.SignalGallery && typeof window.SignalGallery.open === "function") {
      window.SignalGallery.open(project);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        "[THE ANCIENT SIGNAL] gallery.js is not available; cannot open the modal."
      );
    }
  }

  /**
   * Render a list into a target UL, or a single muted dash if empty.
   * @param {HTMLElement|null} target
   * @param {string[]|undefined} items
   */
  function renderList(target, items) {
    if (!target) return;
    target.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      const li = document.createElement("li");
      li.className = "modal__list-empty";
      li.textContent = "—";
      target.appendChild(li);
      return;
    }

    items.forEach(function (text) {
      if (typeof text !== "string" || !text) return;
      const li = document.createElement("li");
      li.textContent = text;
      target.appendChild(li);
    });
  }

  /* ------------------------------------------------------------
     Scroll-triggered reveals
     ------------------------------------------------------------ */
  function initReveals() {
    const revealTargets = document.querySelectorAll(
      ".section__header, .project-card, .origin__block, .codex__group, .contact-link"
    );

    if (!revealTargets.length) return;

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------
     Init
     ------------------------------------------------------------ */
  function init() {
    // Filter chips must exist before filtering starts.
    renderFilterChips();

    // Search
    if (searchInput) {
      searchInput.addEventListener("input", onSearchInput);
    }

    // Reset filters button in the empty state
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", function () {
        state.activeTech = "all";
        state.query = "";
        if (searchInput) searchInput.value = "";
        const chips = filtersContainer
          ? filtersContainer.querySelectorAll(".filter-chip")
          : [];
        chips.forEach(function (el) {
          const active = el.dataset.filter === "all";
          el.classList.toggle("is-active", active);
          el.setAttribute("aria-pressed", active ? "true" : "false");
        });
        applyFilters();
      });
    }

    // Initial render
    applyFilters();

    // Reveals — re-run after the grid is populated so cards participate.
    initReveals();

    // Delegated modal-close cleanup: if the user closes the modal by
    // any means, nothing in main.js needs cleanup because gallery.js
    // owns modal state. We simply do not duplicate that logic here.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();