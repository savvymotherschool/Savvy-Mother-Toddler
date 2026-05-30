// Scripts extracted from gallery.html

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

  function showOfferPopup() {
    offerPopup.classList.add("show");
  }

  function hideOfferPopup() {
    offerPopup.classList.remove("show");
    setTimeout(() => {
      showOfferPopup();
    }, 600000);
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      showOfferPopup();
    }, 25000);
  });

  offerClose.addEventListener("click", () => {
    hideOfferPopup();
  });

  offerPopup.addEventListener("click", (e) => {
    if(e.target === offerPopup){
      hideOfferPopup();
    }
  });

  setInterval(() => {
    offerSlides.forEach(slide => {
      slide.classList.remove("active");
    });
    offerIndex = (offerIndex + 1) % offerSlides.length;
    offerSlides[offerIndex].classList.add("active");
  }, 8000);

  // ========= GALLERY IMAGE LIGHTBOX =========
  const galleryImages = document.querySelectorAll(".gallery-item img");
  const imgLightbox = document.getElementById("imgLightbox");
  const imgLightboxImg = document.getElementById("imgLightboxImg");
  const imgLightboxCaption = document.getElementById("imgLightboxCaption");
  const imgLightboxClose = document.getElementById("imgLightboxClose");
  const imgLightboxBackdrop = document.getElementById("imgLightboxBackdrop");

  function openImageLightbox(img, overlay) {
    imgLightboxImg.src = img.src;
    imgLightboxImg.alt = img.alt || "";
    if (overlay) {
      const parts = Array.from(overlay.querySelectorAll("span")).map(s => s.textContent.trim());
      imgLightboxCaption.textContent = parts.join(" - ");
    } else {
      imgLightboxCaption.textContent = img.alt || "";
    }
    imgLightbox.classList.add("show");
    document.body.classList.add("lightbox-open");
  }

  function closeImageLightbox() {
    imgLightbox.classList.remove("show");
    document.body.classList.remove("lightbox-open");
  }

  galleryImages.forEach(img => {
    img.addEventListener("click", () => {
      const overlay = img.parentElement.querySelector(".gallery-overlay");
      openImageLightbox(img, overlay);
    });
  });

  imgLightboxClose.addEventListener("click", closeImageLightbox);

  imgLightbox.addEventListener("click", (e) => {
    if (e.target === imgLightbox || e.target === imgLightboxBackdrop) {
      closeImageLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && imgLightbox.classList.contains("show")) {
      closeImageLightbox();
    }
  });
