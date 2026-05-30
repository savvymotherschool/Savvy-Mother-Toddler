// Scripts extracted from faculty.html

document.getElementById("year").textContent = new Date().getFullYear();

  function searchSite() {
    const value = document.querySelector('.search-box input')?.value || "";
    if (value.trim()) alert('Searching for: ' + value);
  }

  // Generic slider with its own state + autoplay
  function initSlider({ trackId, prevId, nextId, intervalMs = 4000 }) {
    const track = document.getElementById(trackId);
    const slides = track ? track.querySelectorAll(".slide") : [];
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);

    if (!track || !slides.length || !prevBtn || !nextBtn) return;

    let index = 0;
    let autoplayId = null;

    function updateSlider() {
      track.style.transform = `translateX(-${slides[index].offsetLeft}px)`;
    }

    function goPrev() {
      index = (index - 1 + slides.length) % slides.length;
      updateSlider();
    }

    function goNext() {
      index = (index + 1) % slides.length;
      updateSlider();
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(goNext, intervalMs);
    }

    function stopAutoplay() {
      if (autoplayId !== null) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    prevBtn.addEventListener("click", () => {
      goPrev();
      startAutoplay();
    });

    nextBtn.addEventListener("click", () => {
      goNext();
      startAutoplay();
    });

    track.addEventListener("mouseenter", stopAutoplay);
    track.addEventListener("mouseleave", startAutoplay);
    window.addEventListener("resize", updateSlider);

    updateSlider();
    startAutoplay();
  }

  // Init both sliders
  initSlider({
    trackId: "detailTrack",
    prevId: "detailPrev",
    nextId: "detailNext",
    intervalMs: 5000
  });

  initSlider({
    trackId: "imageTrack",
    prevId: "imagePrev",
    nextId: "imageNext",
    intervalMs: 3500
  });

  // ===== NAVBAR FLOATING INDICATOR + MOBILE TOGGLE =====
  const navMenu = document.getElementById("navMenu");
  const navIndicator = document.getElementById("navIndicator");
  const navLinks = navMenu.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menuToggle");

  function moveIndicator(targetLink) {
    const rect = targetLink.getBoundingClientRect();
    const containerRect = navMenu.getBoundingClientRect();
    const width = rect.width;
    const offsetX = rect.left - containerRect.left;
    navIndicator.style.width = width + "px";
    navIndicator.style.transform = `translateX(${offsetX}px)`;
    navIndicator.style.opacity = 1;
  }

  // Initial indicator on active link (desktop)
  const activeLink = navMenu.querySelector(".nav-link.active");
  if (activeLink && window.innerWidth > 768) {
    setTimeout(() => moveIndicator(activeLink), 200);
  }

  navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 768) return;
      moveIndicator(link);
    });
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      if (window.innerWidth <= 768) {
        navMenu.classList.remove("open");
        menuToggle.classList.remove("active");
      }
    });
  });

  // Mobile toggle
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("open");
  });

  // Recalc indicator on resize (desktop)
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      navIndicator.style.opacity = 0;
    } else {
      const currentActive = navMenu.querySelector(".nav-link.active");
      if (currentActive) moveIndicator(currentActive);
    }
  });

    /* ================= OFFER POPUP ================= */

const offerPopup = document.getElementById("offerPopup");
const offerClose = document.getElementById("offerClose");
const offerSlides = document.querySelectorAll(".offer-slide");

let offerIndex = 0;

/* ===== OPEN POPUP FUNCTION ===== */

function showOfferPopup() {
  offerPopup.classList.add("show");
}

/* ===== CLOSE POPUP FUNCTION ===== */

function hideOfferPopup() {
  offerPopup.classList.remove("show");

  /* SHOW AGAIN AFTER 10 MINUTES */
  setTimeout(() => {
    showOfferPopup();
  }, 600000);
}

/* ===== FIRST POPUP AFTER PAGE LOAD ===== */

window.addEventListener("load", () => {

  setTimeout(() => {
    showOfferPopup();
  }, 25000);

});

/* ===== CLOSE BUTTON ===== */

offerClose.addEventListener("click", () => {
  hideOfferPopup();
});

/* ===== CLOSE WHEN CLICK OUTSIDE ===== */

offerPopup.addEventListener("click", (e) => {

  if(e.target === offerPopup){
    hideOfferPopup();
  }

});

/* ===== AUTO IMAGE SLIDER ===== */

setInterval(() => {

  offerSlides.forEach(slide => {
    slide.classList.remove("active");
  });

  offerIndex = (offerIndex + 1) % offerSlides.length;

  offerSlides[offerIndex].classList.add("active");

}, 8000);
