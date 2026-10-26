/* ============================================================
   THE ANCIENT SIGNAL — gallery.js
   ------------------------------------------------------------
   Handles:
     - Opening and closing the project detail modal
     - Displaying a project's screenshots in the modal gallery
     - Thumbnail selection
     - Previous / next image controls
     - Keyboard navigation (ArrowLeft / ArrowRight / Escape)
     - Focus management and focus restoration on close
     - Background scroll lock while the modal is open
     - Safe fallback when a project has no additional gallery images

   Depends on:
     - index.html structure from Step 1
       (#projectModal, #modalClose, #galleryMain, #galleryPrev,
        #galleryNext, #galleryThumbs, .modal__backdrop, etc.)
     - window.PROJECTS from js/projects.js (loaded before this file)

   Exposes (for js/main.js):
     - window.SignalGallery.open(project)
     - window.SignalGallery.close()
     - window.SignalGallery.isOpen()
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     DOM references
     ------------------------------------------------------------ */
  const modal = document.getElementById("projectModal");
  if (!modal) {
    // Nothing to do if the modal is not on the page.
    return;
  }

  const modalPanel = modal.querySelector(".modal__panel");
  const modalClose = document.getElementById("modalClose");

  const galleryMain = document.getElementById("galleryMain");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const galleryThumbs = document.getElementById("galleryThumbs");

  const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  /* ------------------------------------------------------------
     State
     ------------------------------------------------------------ */
  const state = {
    isOpen: false,
    images: [],          // string[] of image URLs (cover first, then gallery)
    index: 0,
    lastFocused: null,   // element to restore focus to on close
    previousOverflow: "" // body overflow before modal opened
  };

  /* ------------------------------------------------------------
     Utilities
     ------------------------------------------------------------ */

  /**
   * Build the list of images for a project: cover first, then any
   * additional gallery images. Duplicates are removed, and empty
   * strings are ignored.
   * @param {Object} project
   * @returns {string[]}
   */
  function buildImageList(project) {
    const images = [];
    if (project && typeof project.cover === "string" && project.cover) {
      images.push(project.cover);
    }
    if (project && Array.isArray(project.gallery)) {
      project.gallery.forEach(function (src) {
        if (typeof src === "string" && src && images.indexOf(src) === -1) {
          images.push(src);
        }
      });
    }
    return images;
  }

  /**
   * Return a human-readable alt text for an image at a given index.
   * @param {Object} project
   * @param {number} index
   * @param {number} total
   * @returns {string}
   */
  function altFor(project, index, total) {
    const title = (project && project.title) || "Project screenshot";
    if (total <= 1) return title;
    return title + " — screenshot " + (index + 1) + " of " + total;
  }

  /* ------------------------------------------------------------
     Scroll lock
     ------------------------------------------------------------ */
  function lockScroll() {
    state.previousOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("modal-open");
  }

  function unlockScroll() {
    document.body.style.overflow = state.previousOverflow || "";
    document.documentElement.classList.remove("modal-open");
  }

  /* ------------------------------------------------------------
     Rendering
     ------------------------------------------------------------ */

  /**
   * Update the main stage image to the current index.
   * @param {Object} project
   */
  function renderMainImage(project) {
    if (!galleryMain) return;

    const images = state.images;
    const total = images.length;

    if (total === 0) {
      // No images at all — show an empty, labelled stage.
      galleryMain.removeAttribute("src");
      galleryMain.alt = "No screenshots available for this project";
      galleryMain.classList.add("is-empty");
      return;
    }

    galleryMain.classList.remove("is-empty");
    const src = images[state.index];
    galleryMain.src = src;
    galleryMain.alt = altFor(project, state.index, total);
  }

  /**
   * Rebuild thumbnail buttons for the current project.
   * @param {Object} project
   */
  function renderThumbs(project) {
    if (!galleryThumbs) return;

    galleryThumbs.innerHTML = "";

    const images = state.images;
    const total = images.length;

    // With a single image, thumbnails are not useful; keep the
    // container empty so the layout collapses naturally.
    if (total <= 1) {
      galleryThumbs.hidden = true;
      return;
    }

    galleryThumbs.hidden = false;

    images.forEach(function (src, i) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__thumb" + (i === state.index ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === state.index ? "true" : "false");
      btn.setAttribute("aria-label", "Show screenshot " + (i + 1) + " of " + total);
      btn.dataset.index = String(i);

      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";

      btn.appendChild(img);
      galleryThumbs.appendChild(btn);
    });
  }

  /**
   * Sync active state on the thumbnails and the prev/next buttons.
   */
  function syncControls() {
    if (galleryThumbs) {
      const thumbs = galleryThumbs.querySelectorAll(".gallery__thumb");
      thumbs.forEach(function (btn) {
        const idx = parseInt(btn.dataset.index, 10);
        const active = idx === state.index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    const total = state.images.length;
    const disableNav = total <= 1;

    if (galleryPrev) {
      galleryPrev.disabled = disableNav;
      galleryPrev.setAttribute("aria-disabled", disableNav ? "true" : "false");
    }
    if (galleryNext) {
      galleryNext.disabled = disableNav;
      galleryNext.setAttribute("aria-disabled", disableNav ? "true" : "false");
    }
  }

  /* ------------------------------------------------------------
     Navigation
     ------------------------------------------------------------ */
  function goToIndex(nextIndex) {
    const total = state.images.length;
    if (total === 0) return;

    // Wrap around so users can loop through screenshots.
    if (nextIndex < 0) nextIndex = total - 1;
    if (nextIndex >= total) nextIndex = 0;

    state.index = nextIndex;

    const project = state.project;
    renderMainImage(project);
    syncControls();
  }

  function goPrev() {
    goToIndex(state.index - 1);
  }

  function goNext() {
    goToIndex(state.index + 1);
  }

  /* ------------------------------------------------------------
     Focus management
     ------------------------------------------------------------ */
  function getFocusableElements() {
    if (!modalPanel) return [];
    return Array.from(modalPanel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      function (el) {
        return !el.hasAttribute("disabled") && el.offsetParent !== null;
      }
    );
  }

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const focusables = getFocusableElements();
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !modalPanel.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !modalPanel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /* ------------------------------------------------------------
     Keyboard handling
     ------------------------------------------------------------ */
  function onKeydown(event) {
    if (!state.isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
      return;
    }

    trapFocus(event);
  }

  /* ------------------------------------------------------------
     Open / close
     ------------------------------------------------------------ */

  /**
   * Open the modal for a given project.
   * The project object is expected to be a record from window.PROJECTS.
   * @param {Object} project
   */
  function open(project) {
    if (!project || !modal) return;

    state.project = project;
    state.images = buildImageList(project);
    state.index = 0;

    state.lastFocused = document.activeElement;

    renderMainImage(project);
    renderThumbs(project);
    syncControls();

    // Reset the internal scroll position of the modal panel.
    const scroller = modal.querySelector(".modal__scroll");
    if (scroller) scroller.scrollTop = 0;

    lockScroll();

    modal.hidden = false;
    state.isOpen = true;

    // Attach listeners
    document.addEventListener("keydown", onKeydown);

    // Move focus into the modal.
    if (modalClose) {
      // If the modal close button is the first focusable, great.
      // Otherwise focus the panel itself for screen-reader context.
      window.requestAnimationFrame(function () {
        modalClose.focus();
      });
    }
  }

  /**
   * Close the modal and restore focus to the previously focused element.
   */
  function close() {
    if (!modal || !state.isOpen) return;

    state.isOpen = false;
    modal.hidden = true;

    document.removeEventListener("keydown", onKeydown);

    unlockScroll();

    // Clean the main image src to stop any in-flight network work.
    if (galleryMain) {
      galleryMain.removeAttribute("src");
    }

    // Restore focus.
    const last = state.lastFocused;
    state.lastFocused = null;
    if (last && typeof last.focus === "function") {
      // Defer to next frame so the browser has hidden the modal first.
      window.requestAnimationFrame(function () {
        try {
          last.focus();
        } catch (e) {
          /* Element may have been removed from the DOM. */
        }
      });
    }
  }

  function isOpen() {
    return state.isOpen === true;
  }

  /* ------------------------------------------------------------
     Wiring
     ------------------------------------------------------------ */
  function init() {
    if (modalClose) {
      modalClose.addEventListener("click", function () {
        close();
      });
    }

    // Clicking the backdrop closes the modal.
    const backdrop = modal.querySelector("[data-modal-close]");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        close();
      });
    }

    // Clicking the empty space of the panel (outside its content)
    // should not close the modal; only the backdrop and the close
    // button close it. This avoids accidental closes.

    if (galleryPrev) galleryPrev.addEventListener("click", goPrev);
    if (galleryNext) galleryNext.addEventListener("click", goNext);

    if (galleryThumbs) {
      galleryThumbs.addEventListener("click", function (event) {
        const btn = event.target.closest(".gallery__thumb");
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        if (!isNaN(idx)) goToIndex(idx);
      });

      // Keyboard navigation between thumbnails (Left / Right / Home / End)
      galleryThumbs.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" &&
            event.key !== "ArrowRight" &&
            event.key !== "Home" &&
            event.key !== "End") {
          return;
        }
        event.preventDefault();

        const thumbs = Array.from(
          galleryThumbs.querySelectorAll(".gallery__thumb")
        );
        if (thumbs.length === 0) return;

        const activeIdx = thumbs.findIndex(function (el) {
          return el === document.activeElement;
        });

        let targetIdx = activeIdx === -1 ? 0 : activeIdx;

        if (event.key === "ArrowLeft") {
          targetIdx = (targetIdx - 1 + thumbs.length) % thumbs.length;
        } else if (event.key === "ArrowRight") {
          targetIdx = (targetIdx + 1) % thumbs.length;
        } else if (event.key === "Home") {
          targetIdx = 0;
        } else if (event.key === "End") {
          targetIdx = thumbs.length - 1;
        }

        thumbs[targetIdx].focus();
        const idx = parseInt(thumbs[targetIdx].dataset.index, 10);
        if (!isNaN(idx)) goToIndex(idx);
      });
    }

    // If the browser restores scroll position on page load, we do
    // not need any extra handling; the modal is hidden by default.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  /* ------------------------------------------------------------
     Public API
     ------------------------------------------------------------ */
  window.SignalGallery = {
    open: open,
    close: close,
    isOpen: isOpen
  };
})();