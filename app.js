(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────
  const STORAGE_KEY = "meetingprep";
  let manifest = null;
  let decks = {};       // id -> deck data
  let progress = {};    // cardId -> { rating, score, seen }
  let currentDeckId = null;
  let currentCards = [];
  let currentIndex = 0;
  let currentFollowUpIndex = 0;
  let mode = "study";   // "study" | "quiz"
  let quizRevealed = false;

  // ── DOM refs ───────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const homeScreen = $("#home-screen");
  const deckScreen = $("#deck-screen");
  const deckGrid = $("#deck-grid");
  const deckTitle = $("#deck-title");
  const deckDescription = $("#deck-description");
  const categoryFilter = $("#category-filter");
  const progressBar = $("#progress-bar");
  const progressText = $("#progress-text");
  const studyArea = $("#study-area");
  const quizArea = $("#quiz-area");

  // ── Persistence ────────────────────────────────────────────────
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      progress = raw ? JSON.parse(raw) : {};
    } catch { progress = {}; }
  }
  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  }

  // ── Data loading ───────────────────────────────────────────────
  async function loadManifest() {
    const resp = await fetch("data/manifest.json");
    manifest = await resp.json();
  }

  async function loadDeck(id) {
    if (decks[id]) return decks[id];
    const entry = manifest.decks.find((d) => d.id === id);
    const resp = await fetch("data/" + entry.file);
    decks[id] = await resp.json();
    return decks[id];
  }

  // ── Home screen ────────────────────────────────────────────────
  function renderHome() {
    deckGrid.innerHTML = "";
    for (const entry of manifest.decks) {
      const deck = decks[entry.id];
      const total = deck ? deck.cards.length : 0;
      const seen = deck
        ? deck.cards.filter((c) => progress[c.id]?.seen).length
        : 0;
      const pct = total ? Math.round((seen / total) * 100) : 0;

      const el = document.createElement("div");
      el.className = "deck-card";
      el.dataset.deckId = entry.id;
      el.innerHTML = `
        <div class="deck-card-top">
          <span class="deck-icon">${entry.icon}</span>
          <span class="deck-card-title">${esc(entry.title)}</span>
        </div>
        <div class="deck-card-desc">${esc(entry.description)}</div>
        <div class="deck-card-meta">
          <span>${total} cards</span>
          <span>${seen}/${total} seen</span>
          <span>${pct}%</span>
        </div>
        <div class="deck-progress-bar"><div class="deck-progress-fill" style="width:${pct}%"></div></div>
      `;
      el.addEventListener("click", () => openDeck(entry.id));
      deckGrid.appendChild(el);
    }
  }

  // ── Open deck ──────────────────────────────────────────────────
  async function openDeck(id) {
    currentDeckId = id;
    const deck = await loadDeck(id);
    const entry = manifest.decks.find((d) => d.id === id);
    deckTitle.textContent = entry.title;
    deckDescription.textContent = entry.description;

    // Build category filter
    const cats = [...new Set(deck.cards.map((c) => c.category))];
    categoryFilter.innerHTML = '<option value="all">All</option>';
    for (const cat of cats) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    }

    filterAndShow();
    showScreen("deck");
  }

  function filterAndShow() {
    const deck = decks[currentDeckId];
    const cat = categoryFilter.value;
    currentCards =
      cat === "all" ? [...deck.cards] : deck.cards.filter((c) => c.category === cat);
    currentIndex = 0;
    renderCard();
    updateProgress();
  }

  // ── Screen switching ───────────────────────────────────────────
  function showScreen(name) {
    homeScreen.classList.toggle("active", name === "home");
    deckScreen.classList.toggle("active", name === "deck");
  }

  // ── Mode switching ─────────────────────────────────────────────
  function setMode(m) {
    mode = m;
    $("#mode-study").classList.toggle("active", m === "study");
    $("#mode-quiz").classList.toggle("active", m === "quiz");
    studyArea.classList.toggle("hidden", m !== "study");
    quizArea.classList.toggle("hidden", m !== "quiz");
    currentIndex = 0;
    renderCard();
  }

  // ── Shuffle ────────────────────────────────────────────────────
  function shuffle() {
    for (let i = currentCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
    }
    currentIndex = 0;
    renderCard();
  }

  // ── Render card ────────────────────────────────────────────────
  function renderCard() {
    if (!currentCards.length) return;
    const card = currentCards[currentIndex];

    // Mark seen
    if (!progress[card.id]) progress[card.id] = {};
    progress[card.id].seen = true;
    saveProgress();
    updateProgress();

    if (mode === "study") renderStudyCard(card);
    else renderQuizCard(card);
  }

  function renderStudyCard(card) {
    const studyCard = $("#study-card");
    studyCard.classList.remove("flipped");

    $("#card-type-badge").textContent = typeName(card.type);
    $("#card-category-badge").textContent = card.category;
    $("#card-question").textContent = card.question;
    $("#card-answer").textContent = card.answer;

    if (card.notes) {
      $("#card-notes-container").classList.remove("hidden");
      $("#card-notes").textContent = card.notes;
    } else {
      $("#card-notes-container").classList.add("hidden");
    }

    // Follow-ups
    renderFollowUps(card, "study");

    // Nav
    updateStudyNav();

    // Rating
    $$(".btn-rating").forEach((btn) => {
      btn.classList.toggle(
        "selected",
        progress[card.id]?.rating === Number(btn.dataset.rating)
      );
    });
  }

  function renderQuizCard(card) {
    quizRevealed = false;
    $("#quiz-type-badge").textContent = typeName(card.type);
    $("#quiz-category-badge").textContent = card.category;
    $("#quiz-question").textContent = card.question;

    const optionsEl = $("#quiz-options");
    const revealArea = $("#quiz-reveal-area");
    const answerArea = $("#quiz-answer-area");
    answerArea.classList.add("hidden");

    if (card.type === "multi-choice" && card.options) {
      optionsEl.classList.remove("hidden");
      revealArea.classList.add("hidden");
      optionsEl.innerHTML = "";
      card.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.textContent = opt;
        btn.addEventListener("click", () => handleOptionClick(btn, i, card));
        optionsEl.appendChild(btn);
      });
    } else {
      optionsEl.classList.add("hidden");
      revealArea.classList.remove("hidden");
      $("#quiz-reveal-btn").onclick = () => revealQuizAnswer(card);
    }

    $("#quiz-answer").textContent = card.answer;
    if (card.notes) {
      $("#quiz-notes-container").classList.remove("hidden");
      $("#quiz-notes").textContent = card.notes;
    } else {
      $("#quiz-notes-container").classList.add("hidden");
    }

    renderFollowUps(card, "quiz");
    updateQuizNav();

    // Score
    $$(".btn-score").forEach((btn) => {
      btn.classList.toggle(
        "selected",
        progress[card.id]?.score === btn.dataset.score
      );
    });
  }

  function handleOptionClick(btn, index, card) {
    if (quizRevealed) return;
    quizRevealed = true;

    const options = $$(".quiz-option");
    options.forEach((o) => o.classList.add("disabled"));

    if (index === card.correctOption) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
      options[card.correctOption].classList.add("correct");
    }
    $("#quiz-answer-area").classList.remove("hidden");
  }

  function revealQuizAnswer(card) {
    quizRevealed = true;
    $("#quiz-answer-area").classList.remove("hidden");
    $("#quiz-reveal-area").classList.add("hidden");
  }

  // ── Follow-ups ─────────────────────────────────────────────────
  function renderFollowUps(card, prefix) {
    const hasFollowUps = card.followUps && card.followUps.length > 0;
    const area = $(`#${prefix === "study" ? "" : "quiz-"}followups-area`);

    if (!hasFollowUps) {
      area.classList.add("hidden");
      return;
    }

    area.classList.remove("hidden");
    currentFollowUpIndex = 0;
    renderFollowUp(card, prefix);
  }

  function renderFollowUp(card, prefix) {
    const fu = card.followUps[currentFollowUpIndex];
    if (!fu) return;

    if (prefix === "study") {
      const fuCard = $("#followup-card");
      fuCard.classList.remove("flipped");
      $("#followup-question").textContent = fu.question;
      $("#followup-answer").textContent = fu.answer;
      if (fu.notes) {
        $("#followup-notes-container").classList.remove("hidden");
        $("#followup-notes").textContent = fu.notes;
      } else {
        $("#followup-notes-container").classList.add("hidden");
      }
    } else {
      $("#quiz-followup-question").textContent = fu.question;
      $("#quiz-followup-answer").textContent = fu.answer;
      $("#quiz-followup-answer-area").classList.add("hidden");
      $("#quiz-followup-reveal-area").classList.remove("hidden");
      if (fu.notes) {
        $("#quiz-followup-notes-container").classList.remove("hidden");
        $("#quiz-followup-notes").textContent = fu.notes;
      } else {
        $("#quiz-followup-notes-container").classList.add("hidden");
      }
    }

    const total = card.followUps.length;
    const counterId = prefix === "study" ? "followup-counter" : "quiz-followup-counter";
    $(`#${counterId}`).textContent = `${currentFollowUpIndex + 1} / ${total}`;

    const prevId = prefix === "study" ? "prev-followup" : "quiz-prev-followup";
    const nextId = prefix === "study" ? "next-followup" : "quiz-next-followup";
    $(`#${prevId}`).disabled = currentFollowUpIndex === 0;
    $(`#${nextId}`).disabled = currentFollowUpIndex === total - 1;
  }

  // ── Navigation ─────────────────────────────────────────────────
  function updateStudyNav() {
    $("#card-counter").textContent = `${currentIndex + 1} / ${currentCards.length}`;
    $("#prev-card").disabled = currentIndex === 0;
    $("#next-card").disabled = currentIndex === currentCards.length - 1;
  }

  function updateQuizNav() {
    $("#quiz-counter").textContent = `${currentIndex + 1} / ${currentCards.length}`;
    $("#quiz-prev").disabled = currentIndex === 0;
    $("#quiz-next").disabled = currentIndex === currentCards.length - 1;
  }

  function navigate(delta) {
    const next = currentIndex + delta;
    if (next < 0 || next >= currentCards.length) return;
    currentIndex = next;
    renderCard();
  }

  function navigateFollowUp(delta) {
    const card = currentCards[currentIndex];
    if (!card.followUps) return;
    const next = currentFollowUpIndex + delta;
    if (next < 0 || next >= card.followUps.length) return;
    currentFollowUpIndex = next;
    renderFollowUp(card, mode);
  }

  // ── Progress ───────────────────────────────────────────────────
  function updateProgress() {
    const seen = currentCards.filter((c) => progress[c.id]?.seen).length;
    const pct = currentCards.length
      ? Math.round((seen / currentCards.length) * 100)
      : 0;
    progressBar.style.width = pct + "%";
    progressText.textContent = `${seen}/${currentCards.length} seen`;
  }

  // ── Helpers ────────────────────────────────────────────────────
  function typeName(type) {
    const names = {
      flashcard: "Flashcard",
      scenario: "Scenario",
      "multi-choice": "Multi-Choice",
      classify: "Classify",
    };
    return names[type] || type;
  }

  function esc(str) {
    const el = document.createElement("span");
    el.textContent = str;
    return el.innerHTML;
  }

  // ── Event binding ──────────────────────────────────────────────
  function bindEvents() {
    // Back
    $("#back-home-btn").addEventListener("click", () => {
      showScreen("home");
      renderHome();
    });

    // Mode
    $("#mode-study").addEventListener("click", () => setMode("study"));
    $("#mode-quiz").addEventListener("click", () => setMode("quiz"));

    // Shuffle
    $("#shuffle-btn").addEventListener("click", shuffle);

    // Category filter
    categoryFilter.addEventListener("change", filterAndShow);

    // Study card flip
    $("#study-card").addEventListener("click", (e) => {
      if (e.target.closest(".card-notes") || e.target.tagName === "SUMMARY") return;
      $("#study-card").classList.toggle("flipped");
    });

    // Followup card flip
    $("#followup-card").addEventListener("click", (e) => {
      if (e.target.closest(".card-notes") || e.target.tagName === "SUMMARY") return;
      $("#followup-card").classList.toggle("flipped");
    });

    // Study nav
    $("#prev-card").addEventListener("click", () => navigate(-1));
    $("#next-card").addEventListener("click", () => navigate(1));

    // Quiz nav
    $("#quiz-prev").addEventListener("click", () => navigate(-1));
    $("#quiz-next").addEventListener("click", () => navigate(1));

    // Follow-up nav (study)
    $("#prev-followup").addEventListener("click", () => navigateFollowUp(-1));
    $("#next-followup").addEventListener("click", () => navigateFollowUp(1));

    // Follow-up nav (quiz)
    $("#quiz-prev-followup").addEventListener("click", () => navigateFollowUp(-1));
    $("#quiz-next-followup").addEventListener("click", () => navigateFollowUp(1));

    // Quiz follow-up reveal
    $("#quiz-followup-reveal-btn").addEventListener("click", () => {
      $("#quiz-followup-answer-area").classList.remove("hidden");
      $("#quiz-followup-reveal-area").classList.add("hidden");
    });

    // Rating
    $$(".btn-rating").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = currentCards[currentIndex];
        if (!progress[card.id]) progress[card.id] = {};
        progress[card.id].rating = Number(btn.dataset.rating);
        saveProgress();
        $$(".btn-rating").forEach((b) =>
          b.classList.toggle("selected", b === btn)
        );
      });
    });

    // Score
    $$(".btn-score").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = currentCards[currentIndex];
        if (!progress[card.id]) progress[card.id] = {};
        progress[card.id].score = btn.dataset.score;
        saveProgress();
        $$(".btn-score").forEach((b) =>
          b.classList.toggle("selected", b === btn)
        );
      });
    });

    // Reset
    $("#reset-progress-btn").addEventListener("click", () => {
      if (confirm("Reset all progress? This cannot be undone.")) {
        progress = {};
        saveProgress();
        renderHome();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!deckScreen.classList.contains("active")) return;
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (mode === "study") {
          $("#study-card").classList.toggle("flipped");
        } else if (!quizRevealed) {
          const card = currentCards[currentIndex];
          if (card.type !== "multi-choice") {
            revealQuizAnswer(card);
          }
        }
      }
    });

    // Touch swipe
    let touchStartX = 0;
    const cardArea = deckScreen;
    cardArea.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    cardArea.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 60) {
        navigate(diff < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  // ── Init ───────────────────────────────────────────────────────
  async function init() {
    loadProgress();
    await loadManifest();
    // Pre-load all decks for card counts on home screen
    await Promise.all(manifest.decks.map((d) => loadDeck(d.id)));
    renderHome();
    bindEvents();
  }

  init();
})();
