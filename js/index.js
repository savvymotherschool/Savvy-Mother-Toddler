// Scripts extracted from index.html

// search
  function searchSite() {
    const value = document.querySelector('.search-box input')?.value || "";
    if (value.trim()) alert('Searching for: ' + value);
  }

  function subscribe(e) {
    e.preventDefault();
    alert('Thank you for subscribing!');
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  /* HERO PUNCHLINES */
  const punchlines=[
    "Brainywood Lab & Library",
    "Expert Faculty Guiding Every Step",
    "Open-Space Classrooms for Free Learning",
    "24x7 CCTV-Secured Campus",
    "Joyful Extracurricular Activities",
    "Healthy R.O. Drinking Water",
    "Khatta Meetha Canteen for Kids",
    "Creative Activity Corners",
    "Fully Green Playground"
  ];
  let p=0, pl=document.getElementById("heroPunchline");
  pl.textContent = punchlines[0];
  setInterval(()=>{
    pl.style.opacity = 0;
    setTimeout(()=>{
      p=(p+1)%punchlines.length;
      pl.textContent=punchlines[p];
      pl.style.opacity = 1;
    },800);
  },3000);

  /* HERO SLIDER IMAGES */
  const heroSlides=document.querySelectorAll(".hero-slider .hero-slide");
  let heroIndex=0;
  setInterval(()=>{
    heroSlides.forEach(s=>s.classList.remove("active"));
    heroIndex=(heroIndex+1)%heroSlides.length;
    heroSlides[heroIndex].classList.add("active");
  },4000);

  // Scroll reveal
  function activateReveals() {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        el.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', activateReveals);
  activateReveals();

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

  function scrollToSection() {
    document.getElementById("play-learn").scrollIntoView({
      behavior: "smooth"
    });
  }

  (() => {
    const dotsBoard = document.getElementById("homeDotsBoard");
    const options = document.getElementById("homeCountOptions");
    const nextButton = document.getElementById("homeCountNext");
    const scoreText = document.getElementById("homeCountScore");
    const feedback = document.getElementById("homeCountFeedback");
    const admissionPopup = document.getElementById("homeAdmissionPopup");
    const admissionContinue = document.getElementById("homeAdmissionContinue");
    if (!dotsBoard || !options || !nextButton) return;

    let answer = 1;
    let score = 0;
    let solved = false;
    let admissionPopupShown = false;
    const scoreTarget = 5;

    function showAdmissionPopup() {
      if (!admissionPopup || admissionPopupShown) return;
      admissionPopupShown = true;
      admissionPopup.classList.add("show");
      admissionPopup.setAttribute("aria-hidden", "false");
    }

    function hideAdmissionPopup() {
      if (!admissionPopup) return;
      admissionPopup.classList.remove("show");
      admissionPopup.setAttribute("aria-hidden", "true");
    }

    admissionContinue?.addEventListener("click", hideAdmissionPopup);
    admissionPopup?.addEventListener("click", event => {
      if (event.target === admissionPopup) hideAdmissionPopup();
    });

    function shuffle(items) {
      return [...items].sort(() => Math.random() - 0.5);
    }

    function setFeedback(text, state) {
      feedback.textContent = text;
      feedback.classList.toggle("good", state === "good");
      feedback.classList.toggle("bad", state === "bad");
    }

    function renderHomeCountGame() {
      answer = Math.floor(Math.random() * 6) + 1;
      solved = false;
      dotsBoard.innerHTML = "";
      options.innerHTML = "";

      for (let index = 0; index < answer; index += 1) {
        const dot = document.createElement("span");
        dot.className = "quick-dot";
        dotsBoard.appendChild(dot);
      }

      const choices = new Set([answer]);
      while (choices.size < 3) {
        choices.add(Math.floor(Math.random() * 6) + 1);
      }

      shuffle([...choices]).forEach(choice => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice;
        button.addEventListener("click", () => {
          const isCorrect = choice === answer;
          if (isCorrect && !solved) {
            solved = true;
            score += 1;
            scoreText.textContent = "Score: " + score;
            if (score >= scoreTarget) showAdmissionPopup();
          }
          setFeedback(isCorrect ? "Correct!" : "Try again.", isCorrect ? "good" : "bad");
        });
        options.appendChild(button);
      });

      setFeedback("", "");
    }

    nextButton.addEventListener("click", renderHomeCountGame);
    renderHomeCountGame();
  })();

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
  }, 10000);

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
