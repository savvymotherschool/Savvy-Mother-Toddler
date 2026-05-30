// Scripts extracted from facilities.html

document.getElementById("year").textContent = new Date().getFullYear();

  function searchSite() {
    const value = document.querySelector('.search-box input')?.value || "";
    if (value.trim()) alert('Searching for: ' + value);
  }

  // NAVBAR indicator + mobile toggle
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

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("open");
  });

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
