// Scripts extracted from play-learn.html

function searchSite() {
    const value = document.querySelector('.search-box input')?.value || "";
    if (value.trim()) alert('Searching for: ' + value);
  }

  document.getElementById("year").textContent = new Date().getFullYear();

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

  (() => {
    const activityRoot = document.getElementById("playActivityCards");
    if (!activityRoot) return;

    activityRoot.querySelectorAll(".play-activity-toggle").forEach(toggle => {
      const panel = document.getElementById(toggle.getAttribute("aria-controls"));
      const card = toggle.closest(".play-activity-card");

      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";

        activityRoot.querySelectorAll(".play-activity-toggle").forEach(otherToggle => {
          const otherPanel = document.getElementById(otherToggle.getAttribute("aria-controls"));
          otherToggle.setAttribute("aria-expanded", "false");
          otherToggle.closest(".play-activity-card").classList.remove("open");
          otherPanel.hidden = true;
        });

        toggle.setAttribute("aria-expanded", String(!isOpen));
        card.classList.toggle("open", !isOpen);
        panel.hidden = isOpen;
      });
    });
  })();

  (() => {
    const gamesRoot = document.getElementById("playGames");
    if (!gamesRoot) return;
    const admissionPopup = document.getElementById("gameAdmissionPopup");
    const admissionContinue = document.getElementById("gameAdmissionContinue");
    const scoreTarget = 5;
    let admissionPopupShown = false;

    function showGameAdmissionPopup() {
      if (!admissionPopup || admissionPopupShown) return;
      admissionPopupShown = true;
      admissionPopup.classList.add("show");
      admissionPopup.setAttribute("aria-hidden", "false");
    }

    function hideGameAdmissionPopup() {
      if (!admissionPopup) return;
      admissionPopup.classList.remove("show");
      admissionPopup.setAttribute("aria-hidden", "true");
    }

    admissionContinue?.addEventListener("click", hideGameAdmissionPopup);
    admissionPopup?.addEventListener("click", event => {
      if (event.target === admissionPopup) hideGameAdmissionPopup();
    });

    const colors = [
      { name: "Red", value: "#ef4444" },
      { name: "Blue", value: "#2563eb" },
      { name: "Green", value: "#16a34a" },
      { name: "Yellow", value: "#eab308" },
      { name: "Pink", value: "#db2777" },
      { name: "Orange", value: "#f97316" }
    ];

    const shapes = [
      { name: "Circle", className: "shape-circle" },
      { name: "Square", className: "shape-square" },
      { name: "Triangle", className: "shape-triangle" }
    ];

    const letters = ["A", "B", "C", "D", "E", "F"];

    const memoryCards = [
      { label: "Sun", icon: "fa-solid fa-sun", color: "#f59e0b" },
      { label: "Star", icon: "fa-solid fa-star", color: "#eab308" },
      { label: "Heart", icon: "fa-solid fa-heart", color: "#e11d48" },
      { label: "Leaf", icon: "fa-solid fa-leaf", color: "#16a34a" },
      { label: "Moon", icon: "fa-solid fa-moon", color: "#6366f1" },
      { label: "House", icon: "fa-solid fa-house", color: "#2563eb" },
      { label: "Car", icon: "fa-solid fa-car", color: "#f97316" },
      { label: "Music", icon: "fa-solid fa-music", color: "#8b5cf6" },
      { label: "Gift", icon: "fa-solid fa-gift", color: "#0f766e" }
    ];

    const scores = {
      color: 0,
      count: 0,
      shape: 0,
      letter: 0,
      missing: 0,
      pattern: 0,
      memory: 0
    };

    let currentColor = colors[0];
    let currentCount = 1;
    let currentShape = shapes[0];
    let currentLetter = letters[0];
    let currentMissing = 2;
    let currentPatternAnswer = colors[0];
    let memoryDeck = [];
    let flippedMemoryCards = [];
    let memoryLocked = false;
    let memoryMatchedPairs = 0;
    const memoryPairTarget = 4;
    let colorSolved = false;
    let countSolved = false;
    let shapeSolved = false;
    let letterSolved = false;
    let missingSolved = false;
    let patternSolved = false;

    function pick(items) {
      return items[Math.floor(Math.random() * items.length)];
    }

    function shuffle(items) {
      return [...items].sort(() => Math.random() - 0.5);
    }

    function setFeedback(id, text, isGood) {
      const feedback = document.getElementById(id);
      feedback.textContent = text;
      feedback.classList.toggle("good", isGood);
    }

    function updateScore(id, value) {
      document.getElementById(id).textContent = "Score: " + value;
    }

    function awardPoint(gameKey, scoreId) {
      scores[gameKey] += 1;
      updateScore(scoreId, scores[gameKey]);
      if (scores[gameKey] >= scoreTarget) showGameAdmissionPopup();
    }

    function renderColorGame() {
      currentColor = pick(colors);
      colorSolved = false;
      document.getElementById("colorPrompt").textContent = "Find " + currentColor.name;

      const colorWord = document.getElementById("colorWord");
      colorWord.textContent = currentColor.name.toUpperCase();
      colorWord.style.color = currentColor.value;

      const colorOptions = document.getElementById("colorOptions");
      colorOptions.innerHTML = "";
      shuffle(colors).slice(0, 6).forEach(color => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "game-swatch";
        button.style.background = color.value;
        button.textContent = color.name;
        button.setAttribute("aria-label", color.name);
        button.addEventListener("click", () => {
          const isCorrect = color.name === currentColor.name;
          if (isCorrect && !colorSolved) {
            colorSolved = true;
            awardPoint("color", "colorScore");
          }
          setFeedback("colorFeedback", isCorrect ? "Correct color!" : "Try another color.", isCorrect);
        });
        colorOptions.appendChild(button);
      });
      setFeedback("colorFeedback", "", false);
    }

    function renderCountGame() {
      currentCount = Math.floor(Math.random() * 6) + 1;
      countSolved = false;
      document.getElementById("countPrompt").textContent = "How many dots?";

      const dotsBoard = document.getElementById("dotsBoard");
      dotsBoard.innerHTML = "";
      for (let index = 0; index < currentCount; index += 1) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dotsBoard.appendChild(dot);
      }

      const choices = new Set([currentCount]);
      while (choices.size < 3) {
        choices.add(Math.floor(Math.random() * 6) + 1);
      }

      const countOptions = document.getElementById("countOptions");
      countOptions.innerHTML = "";
      shuffle([...choices]).forEach(number => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "game-btn";
        button.textContent = number;
        button.addEventListener("click", () => {
          const isCorrect = number === currentCount;
          if (isCorrect && !countSolved) {
            countSolved = true;
            awardPoint("count", "countScore");
          }
          setFeedback("countFeedback", isCorrect ? "Nice counting!" : "Count once more.", isCorrect);
        });
        countOptions.appendChild(button);
      });
      setFeedback("countFeedback", "", false);
    }

    function renderShapeGame() {
      currentShape = pick(shapes);
      shapeSolved = false;
      document.getElementById("shapePrompt").textContent = "Tap the " + currentShape.name;

      const shapeDisplay = document.getElementById("shapeDisplay");
      shapeDisplay.className = "shape-display " + currentShape.className;

      const shapeOptions = document.getElementById("shapeOptions");
      shapeOptions.innerHTML = "";
      shuffle(shapes).forEach(shape => {
        const button = document.createElement("button");
        const icon = document.createElement("span");
        button.type = "button";
        button.className = "game-btn shape-button";
        button.setAttribute("aria-label", shape.name);
        icon.className = "shape-icon " + shape.className;
        button.appendChild(icon);
        button.addEventListener("click", () => {
          const isCorrect = shape.name === currentShape.name;
          if (isCorrect && !shapeSolved) {
            shapeSolved = true;
            awardPoint("shape", "shapeScore");
          }
          setFeedback("shapeFeedback", isCorrect ? "Great shape!" : "Try another shape.", isCorrect);
        });
        shapeOptions.appendChild(button);
      });
      setFeedback("shapeFeedback", "", false);
    }

    function renderLetterGame() {
      currentLetter = pick(letters);
      letterSolved = false;
      document.getElementById("letterPrompt").textContent = "Find small " + currentLetter.toLowerCase();
      document.getElementById("letterTile").textContent = currentLetter;

      const choices = new Set([currentLetter.toLowerCase()]);
      while (choices.size < 3) {
        choices.add(pick(letters).toLowerCase());
      }

      const letterOptions = document.getElementById("letterOptions");
      letterOptions.innerHTML = "";
      shuffle([...choices]).forEach(letter => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "game-btn";
        button.textContent = letter;
        button.addEventListener("click", () => {
          const isCorrect = letter === currentLetter.toLowerCase();
          if (isCorrect && !letterSolved) {
            letterSolved = true;
            awardPoint("letter", "letterScore");
          }
          setFeedback("letterFeedback", isCorrect ? "Lovely letter!" : "Try another letter.", isCorrect);
        });
        letterOptions.appendChild(button);
      });
      setFeedback("letterFeedback", "", false);
    }

    function renderMissingGame() {
      const start = Math.floor(Math.random() * 6) + 1;
      currentMissing = start + 1;
      missingSolved = false;
      document.getElementById("missingPrompt").textContent = "Which number is missing?";
      document.getElementById("missingSequence").textContent = start + ", ?, " + (start + 2);

      const choices = new Set([currentMissing]);
      while (choices.size < 3) {
        choices.add(Math.floor(Math.random() * 8) + 1);
      }

      const missingOptions = document.getElementById("missingOptions");
      missingOptions.innerHTML = "";
      shuffle([...choices]).forEach(number => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "game-btn";
        button.textContent = number;
        button.addEventListener("click", () => {
          const isCorrect = number === currentMissing;
          if (isCorrect && !missingSolved) {
            missingSolved = true;
            awardPoint("missing", "missingScore");
          }
          setFeedback("missingFeedback", isCorrect ? "Right number!" : "Try the middle number.", isCorrect);
        });
        missingOptions.appendChild(button);
      });
      setFeedback("missingFeedback", "", false);
    }

    function renderPatternGame() {
      const first = pick(colors);
      let second = pick(colors);
      while (second.name === first.name) {
        second = pick(colors);
      }
      currentPatternAnswer = first;
      patternSolved = false;

      const patternRow = document.getElementById("patternRow");
      patternRow.innerHTML = "";
      [first, second, first, second].forEach(color => {
        const token = document.createElement("span");
        token.className = "pattern-token";
        token.style.background = color.value;
        patternRow.appendChild(token);
      });
      const question = document.createElement("span");
      question.className = "pattern-token question";
      question.textContent = "?";
      patternRow.appendChild(question);

      const patternOptions = document.getElementById("patternOptions");
      patternOptions.innerHTML = "";
      const choices = [first, second, pick(colors)].filter((color, index, list) => {
        return list.findIndex(item => item.name === color.name) === index;
      });
      while (choices.length < 3) {
        const color = pick(colors);
        if (!choices.some(item => item.name === color.name)) choices.push(color);
      }

      shuffle(choices).forEach(color => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "game-swatch";
        button.style.background = color.value;
        button.textContent = color.name;
        button.addEventListener("click", () => {
          const isCorrect = color.name === currentPatternAnswer.name;
          if (isCorrect && !patternSolved) {
            patternSolved = true;
            awardPoint("pattern", "patternScore");
          }
          setFeedback("patternFeedback", isCorrect ? "Perfect pattern!" : "Look at the order again.", isCorrect);
        });
        patternOptions.appendChild(button);
      });
      setFeedback("patternFeedback", "", false);
    }

    function getMemoryButtons() {
      return [...document.querySelectorAll(".memory-card")];
    }

    function setMemoryBoardEnabled(isEnabled) {
      getMemoryButtons().forEach(card => {
        if (card.classList.contains("is-found")) {
          card.disabled = true;
          card.classList.remove("is-disabled");
          return;
        }

        if (card.classList.contains("is-flipped")) {
          card.disabled = true;
          card.classList.remove("is-disabled");
          return;
        }

        card.disabled = !isEnabled;
        card.classList.toggle("is-disabled", !isEnabled);
      });
    }

    function updateMemoryProgress() {
      document.getElementById("memoryScore").textContent = "Pairs: " + memoryMatchedPairs + "/" + memoryPairTarget;
    }

    function setMemoryShuffleEnabled(isEnabled) {
      document.getElementById("memoryNext").disabled = !isEnabled;
    }

    function buildMemoryDeck() {
      const pairCards = shuffle(memoryCards).slice(0, memoryPairTarget);
      const pairLabels = new Set(pairCards.map(card => card.label));
      const bonusCard = shuffle(memoryCards.filter(card => !pairLabels.has(card.label)))[0];
      const pairedCards = pairCards.flatMap(card => [
        { ...card, pairId: card.label, found: false },
        { ...card, pairId: card.label, found: false }
      ]);

      return shuffle([
        ...pairedCards,
        { ...bonusCard, pairId: "bonus", found: false, isBonus: true }
      ]);
    }

    function resetMemoryTurn() {
      flippedMemoryCards = [];
      memoryLocked = false;
      document.getElementById("memoryPrompt").textContent = "Turn two cards and match the pictures.";
      setMemoryBoardEnabled(true);
      setMemoryShuffleEnabled(true);
    }

    function finishMemoryRound() {
      memoryLocked = true;
      setMemoryBoardEnabled(false);
      setMemoryShuffleEnabled(false);
      document.getElementById("memoryPrompt").textContent = "All pairs found!";
      setFeedback("memoryFeedback", "Shuffling again...", true);

      getMemoryButtons().forEach((button, index) => {
        if (!memoryDeck[index].found) {
          memoryDeck[index].found = true;
          button.classList.add("is-flipped");
          setTimeout(() => button.classList.add("is-found"), 260);
        }
      });

      setTimeout(renderMemoryGame, 1300);
    }

    function finishMemoryMatch(first, second) {
      first.card.found = true;
      second.card.found = true;
      memoryMatchedPairs += 1;
      scores.memory = memoryMatchedPairs;
      updateMemoryProgress();
      setFeedback("memoryFeedback", "Matched pair!", true);

      setTimeout(() => {
        first.button.classList.add("is-found");
        second.button.classList.add("is-found");
        flippedMemoryCards = [];

        if (memoryMatchedPairs === memoryPairTarget) {
          setTimeout(finishMemoryRound, 420);
          return;
        }

        resetMemoryTurn();
      }, 360);
    }

    function finishMemoryMiss() {
      const [first, second] = flippedMemoryCards;
      first.button.classList.add("is-missed");
      second.button.classList.add("is-missed");
      setFeedback("memoryFeedback", "Not a match. Try again.", false);

      setTimeout(() => {
        first.button.classList.remove("is-flipped", "is-missed");
        second.button.classList.remove("is-flipped", "is-missed");
        resetMemoryTurn();
      }, 850);
    }

    function checkMemoryCard(button, card) {
      if (memoryLocked || card.found || button.classList.contains("is-flipped")) return;

      button.classList.add("is-flipped");
      flippedMemoryCards.push({ button, card });
      setFeedback("memoryFeedback", flippedMemoryCards.length === 1 ? "Choose one more card." : "", false);

      if (flippedMemoryCards.length < 2) return;

      const [first, second] = flippedMemoryCards;
      const isMatch = first.card.pairId === second.card.pairId && !first.card.isBonus && !second.card.isBonus;
      memoryLocked = true;
      setMemoryBoardEnabled(false);
      setMemoryShuffleEnabled(false);

      if (isMatch) {
        finishMemoryMatch(first, second);
      } else {
        finishMemoryMiss();
      }
    }

    function renderMemoryBoard() {
      const memoryBoard = document.getElementById("memoryBoard");
      memoryBoard.innerHTML = "";

      memoryDeck.forEach((card, index) => {
        const button = document.createElement("button");
        const face = document.createElement("span");
        const icon = document.createElement("i");

        button.type = "button";
        button.className = "memory-card";
        button.style.setProperty("--memory-color", card.color);
        button.setAttribute("aria-label", "Turn memory card " + (index + 1));

        face.className = "memory-card-face";
        icon.className = card.icon;
        icon.setAttribute("aria-hidden", "true");

        face.appendChild(icon);
        button.appendChild(face);
        button.addEventListener("click", () => checkMemoryCard(button, card));
        memoryBoard.appendChild(button);
      });
    }

    function renderMemoryGame() {
      memoryDeck = buildMemoryDeck();
      flippedMemoryCards = [];
      memoryLocked = false;
      memoryMatchedPairs = 0;
      scores.memory = 0;
      setMemoryShuffleEnabled(false);
      renderMemoryBoard();
      updateMemoryProgress();
      setFeedback("memoryFeedback", "", false);
      resetMemoryTurn();
    }

    document.getElementById("colorNext").addEventListener("click", renderColorGame);
    document.getElementById("countNext").addEventListener("click", renderCountGame);
    document.getElementById("shapeNext").addEventListener("click", renderShapeGame);
    document.getElementById("letterNext").addEventListener("click", renderLetterGame);
    document.getElementById("missingNext").addEventListener("click", renderMissingGame);
    document.getElementById("patternNext").addEventListener("click", renderPatternGame);
    document.getElementById("memoryNext").addEventListener("click", renderMemoryGame);

    renderColorGame();
    renderCountGame();
    renderShapeGame();
    renderLetterGame();
    renderMissingGame();
    renderPatternGame();
    renderMemoryGame();
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
