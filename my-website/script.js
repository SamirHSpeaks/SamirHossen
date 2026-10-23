(function () {
  "use strict";

  const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxtZdqYDDcCBUPFkoJwjcoiwckcRIqTDXDrS_IXsuwX5YQwsk4aSROQRQzInUBB1ivw/exec";

  // 1. Current Year
  document.getElementById("current-year").textContent = new Date().getFullYear();

  // 2. Setup Frames Configuration
  const TOTAL_FRAMES = 240;
  const useStaticMobileBackground = window.matchMedia(
    "(max-width: 768px), (pointer: coarse), (prefers-reduced-motion: reduce)"
  ).matches;
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let isInitialReady = false;

  // Helper to generate filename: ezgif-frame-001.jpg ... ezgif-frame-240.jpg
  function getFramePath(index) {
    const frameNum = String(index + 1).padStart(3, "0");
    return `images/ezgif-frame-${frameNum}.jpg`;
  }

  // 3. Canvas Elements and Resizing
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let dpr = window.devicePixelRatio || 1;

  // Initial frame for REVERSE animation: Start with the LAST frame (frame 239)
  const START_FRAME_INDEX = TOTAL_FRAMES - 1;
  let lastRenderedIndex = START_FRAME_INDEX;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, useStaticMobileBackground ? 1.5 : 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    renderFrame(lastRenderedIndex);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });

  // 4. Draw frame covering canvas (object-fit: cover)
  function renderFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    lastRenderedIndex = index;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;

    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = cw;
      renderH = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * imgRatio;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  // 5. Preloading Prioritizing Reverse Start (Frame 239 loaded first!)
  const preloaderBar = document.getElementById("preloader-bar");
  const preloaderStatus = document.getElementById("preloader-status");
  const preloader = document.getElementById("preloader");

  function updateLoader(pct) {
    if (preloaderBar) preloaderBar.style.width = pct + "%";
    if (preloaderStatus) preloaderStatus.textContent = `Loading Experience • ${pct}%`;
  }

  function dismissPreloader() {
    if (preloader && !preloader.classList.contains("loaded")) {
      preloader.classList.add("loaded");
    }
  }

  // Load initial reverse starting frame (frame 239 / ezgif-frame-240.jpg) first
  const firstImg = new Image();
  firstImg.src = getFramePath(START_FRAME_INDEX);
  images[START_FRAME_INDEX] = firstImg;
  firstImg.onload = function () {
    loadedCount++;
    resizeCanvas();
    renderFrame(START_FRAME_INDEX);
    updateLoader(useStaticMobileBackground ? 100 : 20);

    if (useStaticMobileBackground) {
      isInitialReady = true;
      setTimeout(dismissPreloader, 250);
    }
  };
  firstImg.onerror = function () {
    loadedCount++;
    if (useStaticMobileBackground) {
      updateLoader(100);
      isInitialReady = true;
      dismissPreloader();
    }
  };

  // Progressively load all other frames from 238 down to 0 (top-of-page to bottom)
  if (!useStaticMobileBackground) {
    for (let i = TOTAL_FRAMES - 2; i >= 0; i--) {
      const img = new Image();
      img.src = getFramePath(i);
      images[i] = img;
      img.onload = function () {
        loadedCount++;
        const currentPct = Math.min(100, Math.round((loadedCount / TOTAL_FRAMES) * 100));
        updateLoader(currentPct);

        // Once first 25 priority frames are loaded, page is interactive immediately
        if (loadedCount >= 25 && !isInitialReady) {
          isInitialReady = true;
          setTimeout(dismissPreloader, 250);
        }

        if (loadedCount === TOTAL_FRAMES) {
          dismissPreloader();
        }
      };
      img.onerror = function () {
        loadedCount++;
        if (loadedCount >= 25 && !isInitialReady) {
          isInitialReady = true;
          setTimeout(dismissPreloader, 250);
        }
      };
    }
  }

  // Fallback: dismiss loader after 2.5s maximum
  setTimeout(dismissPreloader, 2500);

  // 6. Smooth Scroll Interpolation (Lerp) with REVERSE Mapping
  let currentProgress = 0;
  let targetProgress = 0;
  let animationFrameId = null;

  function calculateTargetProgress() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    targetProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

    // Update top progress bar
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      progressBar.style.width = (targetProgress * 100) + "%";
    }
  }

  window.addEventListener("scroll", calculateTargetProgress, { passive: true });

  function animationLoop() {
    // Smooth linear interpolation
    currentProgress += (targetProgress - currentProgress) * 0.12;

    // *** REVERSE ANIMATION FORMULA ***
    // When currentProgress is 0 (top of page) -> reverseProgress is 1 -> targetFrame is 239 (ezgif-frame-240.jpg)
    // When currentProgress is 1 (bottom of page) -> reverseProgress is 0 -> targetFrame is 0 (ezgif-frame-001.jpg)
    const reverseProgress = 1 - currentProgress;
    const targetFrameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(reverseProgress * (TOTAL_FRAMES - 1)))
    );

    if (targetFrameIndex !== lastRenderedIndex) {
      if (images[targetFrameIndex] && images[targetFrameIndex].complete) {
        renderFrame(targetFrameIndex);
      } else {
        // Find nearest available loaded neighbor
        for (let offset = 1; offset < 35; offset++) {
          const upper = targetFrameIndex + offset;
          const lower = targetFrameIndex - offset;
          if (upper < TOTAL_FRAMES && images[upper] && images[upper].complete) {
            renderFrame(upper);
            break;
          }
          if (lower >= 0 && images[lower] && images[lower].complete) {
            renderFrame(lower);
            break;
          }
        }
      }
    }

    animationFrameId = requestAnimationFrame(animationLoop);
  }

  // Start loop
  resizeCanvas();
  calculateTargetProgress();
  if (!useStaticMobileBackground) {
    animationLoop();
  }

  // 7. Scroll Reveal Observer for Text & Cards
  const revealElements = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // 8. Active Section Detection for Right Rail & Top Nav
  const sections = document.querySelectorAll("section[id]");
  const railItems = document.querySelectorAll(".rail-item");
  const topNavLinks = document.querySelectorAll(".nav-links a");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute("id");

          // Update Right Rail
          railItems.forEach(function (item) {
            if (item.getAttribute("href") === "#" + currentId) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });

          // Update Top Nav
          topNavLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + currentId) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });

          // Update Drawer Links
          drawerLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + currentId) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // 9. Mobile Drawer Toggle
  const openDrawerBtn = document.getElementById("open-drawer");
  const closeDrawerBtn = document.getElementById("close-drawer");
  const mobileDrawer = document.getElementById("mobile-drawer");

  if (openDrawerBtn && closeDrawerBtn && mobileDrawer) {
    openDrawerBtn.addEventListener("click", function () {
      mobileDrawer.classList.add("open");
    });

    closeDrawerBtn.addEventListener("click", function () {
      mobileDrawer.classList.remove("open");
    });

    drawerLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        mobileDrawer.classList.remove("open");
      });
    });
  }

  // 10. Scroll Down Indicator Action
  const scrollPrompt = document.getElementById("scroll-prompt");
  if (scrollPrompt) {
    scrollPrompt.addEventListener("click", function () {
      const nextSec = document.getElementById("work") || document.getElementById("about");
      if (nextSec) {
        nextSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 11. Back to Top Action
  const backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 12. YouTube Video Embeds
  const YOUTUBE_THUMBNAIL_VERSION = "20261023-2";

  function getYoutubeVideoId(videoUrl) {
    try {
      const url = new URL(videoUrl);
      const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
      let videoId = "";

      if (host === "youtu.be") {
        videoId = url.pathname.split("/").filter(Boolean)[0] || "";
      } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
        if (url.pathname === "/watch") {
          videoId = url.searchParams.get("v") || "";
        } else {
          const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
          videoId = match ? match[1] : "";
        }
      }

      return /^[\w-]{11}$/.test(videoId) ? videoId : "";
    } catch (error) {
      return "";
    }
  }

  document.querySelectorAll("[data-video-url]").forEach(function (videoCard) {
    const videoId = getYoutubeVideoId(videoCard.dataset.videoUrl);
    const title = videoCard.querySelector("h3")?.textContent.trim() || "YouTube video";

    if (!videoId) {
      const errorMessage = document.createElement("p");
      errorMessage.className = "video-card-error";
      errorMessage.textContent = "This YouTube link could not be displayed. Please check the video URL.";
      videoCard.prepend(errorMessage);
      return;
    }

    const preview = document.createElement("div");
    preview.className = "video-preview";

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "video-preview-button";
    playButton.setAttribute("aria-label", `Play ${title}`);

    const thumbnail = document.createElement("img");
    thumbnail.className = "video-preview-image";
    thumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?v=${YOUTUBE_THUMBNAIL_VERSION}`;
    thumbnail.alt = "";
    thumbnail.loading = "eager";
    thumbnail.referrerPolicy = "no-referrer";
    thumbnail.addEventListener("error", function () {
      if (!thumbnail.dataset.fallback) {
        thumbnail.dataset.fallback = "true";
        thumbnail.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg?v=${YOUTUBE_THUMBNAIL_VERSION}`;
      }
    });

    const playIcon = document.createElement("span");
    playIcon.className = "video-play-icon";
    playIcon.setAttribute("aria-hidden", "true");
    playButton.append(thumbnail, playIcon);
    preview.append(playButton);
    videoCard.prepend(preview);

    const watchLink = document.createElement("a");
    watchLink.className = "video-watch-link";
    watchLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    watchLink.target = "_blank";
    watchLink.rel = "noopener noreferrer";
    watchLink.textContent = "Watch on YouTube";
    videoCard.append(watchLink);

    playButton.addEventListener("click", function () {
      if (window.location.protocol === "file:") {
        window.open(watchLink.href, "_blank", "noopener,noreferrer");
        return;
      }

      const frame = document.createElement("iframe");
      frame.className = "video-frame";
      frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      frame.src += `&origin=${encodeURIComponent(window.location.origin)}`;
      frame.title = title;
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.referrerPolicy = "origin";
      frame.allowFullscreen = true;
      preview.replaceWith(frame);
    });
  });

  // 13. Google Sheets Contact Form
  const contactForm = document.getElementById("contact-form");
  const formFeedback = document.getElementById("form-feedback");
  const contactSubmit = document.getElementById("contact-submit");
  const contactFormFrame = document.getElementById("contact-form-frame");
  const submissionTokenField = document.getElementById("submission-token");
  let submissionTimeout;
  let submissionPending = false;
  let submissionResponseReceived = false;

  if (contactForm && formFeedback && contactSubmit && contactFormFrame && submissionTokenField) {
    function finishSubmission(success) {
      if (!submissionPending) return;

      submissionPending = false;
      window.clearTimeout(submissionTimeout);
      contactSubmit.disabled = false;

      if (success) {
        formFeedback.textContent = "Thank you! Your message was added to the contact sheet.";
        formFeedback.className = "form-status-msg success";
        contactForm.reset();
      } else {
        formFeedback.textContent = "Your message could not be saved. Please try again or contact Samir directly.";
        formFeedback.className = "form-status-msg error";
      }
    }

    window.addEventListener("message", function (event) {
      const result = event.data;
      if (
        !submissionPending ||
        event.source !== contactFormFrame.contentWindow ||
        !result ||
        result.type !== "contact-form-result" ||
        result.submissionToken !== submissionTokenField.value
      ) {
        return;
      }

      submissionResponseReceived = true;
      finishSubmission(result.success);
    });

    contactFormFrame.addEventListener("load", function () {
      if (!submissionPending) return;

      window.setTimeout(function () {
        if (submissionPending && !submissionResponseReceived) {
          finishSubmission(true);
        }
      }, 500);
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(GOOGLE_SHEETS_WEB_APP_URL)) {
        formFeedback.textContent = "The contact form is not connected yet. Please email Samir at pcsamirhossain123@gmail.com.";
        formFeedback.className = "form-status-msg error";
        return;
      }

      const token = window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      submissionTokenField.value = token;
      submissionPending = true;
      submissionResponseReceived = false;
      contactForm.action = GOOGLE_SHEETS_WEB_APP_URL;
      contactSubmit.disabled = true;
      formFeedback.textContent = "Sending your message securely to Google Sheets...";
      formFeedback.className = "form-status-msg pending";

      submissionTimeout = window.setTimeout(function () {
        submissionPending = false;
        contactSubmit.disabled = false;
        formFeedback.textContent = "We could not confirm the submission. Check the Google Sheet before trying again to avoid a duplicate message.";
        formFeedback.className = "form-status-msg error";
      }, 60000);

      contactForm.submit();
    });
  }

})();
