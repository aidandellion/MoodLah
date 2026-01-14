/**
 * Home / Dashboard Logic
 */
document.addEventListener("DOMContentLoaded", () => {
  // Determine when the home dashboard elements are present
  const observer = new MutationObserver(() => {
    const quotesList = document.getElementById("quotesList");
    const chartEl = document.getElementById("mood-overview-chart");

    // if home elements exist and not initialized yet → init
    if ((quotesList || chartEl) && !document.body.dataset.homeInitialized) {
      initHomeDashboard();
      document.body.dataset.homeInitialized = "true";
    }
  });

  const contentArea = document.getElementById("page-content");
  if (contentArea) {
    observer.observe(contentArea, { childList: true, subtree: true });
  }
});

function initHomeDashboard() {
  console.log("✅ Home dashboard initialized");

  // =========================================================
  // Read moods storage (same format as mood-tracking.js)
  // moods = { "2026-01-13": { mood:"Happy", note:"...", timestamp:"..." }, ... }
  // =========================================================
  const moodsObj = JSON.parse(localStorage.getItem("moods")) || {};
  const moodEntries = convertMoodsObjectToArray(moodsObj);

  // =========================================================
  // SECTION CARDS
  // =========================================================
  const POSITIVE_MOODS = ["Happy", "Calm", "Relaxed", "Motivated"];

  // Mood Entries (this week)
  const thisWeek = filterLastDays(moodEntries, 7);
  setText("statMoodEntries", thisWeek.length);

  // Positive Days (this week)
  const positiveThisWeek = thisWeek.filter((e) =>
    POSITIVE_MOODS.includes(e.mood)
  ).length;
  setText("statPositiveDays", positiveThisWeek);

  // Streak
  const streak = calcStreak(moodsObj);
  setText("statStreak", streak);

  // =========================================================
  // QUOTES OF THE DAY
  // =========================================================
  renderQuotes();

  // =========================================================
  // MOODS OVERVIEW
  // =========================================================
  renderMoodDonut(moodEntries);

  // feather icons refresh
  if (window.feather) feather.replace();
}

/* --------------------- Helper UI --------------------- */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* --------------------- Data Processing --------------------- */

// convert moods object to array [{date,mood,note,timestamp}]
function convertMoodsObjectToArray(moodsObj) {
  return Object.keys(moodsObj).map((date) => ({
    date,
    mood: moodsObj[date].mood,
    note: moodsObj[date].note || "",
    timestamp: moodsObj[date].timestamp || "",
  }));
}

function filterLastDays(entries, days) {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - (days - 1));

  const startISO = toISO(start);
  const endISO = toISO(today);

  return entries.filter((e) => e.date >= startISO && e.date <= endISO);
}

function toISO(dateObj) {
  return dateObj.toISOString().split("T")[0];
}

function calcStreak(moodsObj) {
  // streak = consecutive days saved up to today
  const datesSet = new Set(Object.keys(moodsObj));
  let streak = 0;
  const d = new Date();

  while (true) {
    const iso = toISO(d);
    if (datesSet.has(iso)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

/* --------------------- Quotes --------------------- */

function renderQuotes() {
  const quotesList = document.getElementById("quotesList");
  if (!quotesList) return;

  const quotes = [
    "One day at a time.",
    "Progress, not perfection.",
    "You are doing better than you think.",
    "It’s okay to pause. Rest is productive.",
    "Small steps still move you forward.",
    "Your feelings are valid.",
    "Breathe. You’re safe in this moment.",
    "You’ve survived 100% of your hardest days.",
    "Be gentle with yourself.",
    "You don’t have to have it all figured out.",
    "Even the toughest days have an ending.",
    "Start where you are. Use what you have.",
    "It’s okay to ask for help.",
    "You are not alone in this.",
    "You can’t pour from an empty cup.",
    "Focus on what you can control.",
    "Your mental health matters.",
    "Slow is still moving.",
    "Healing isn’t linear.",
    "Today is a fresh start.",
    "Keep going — you’re closer than you think.",
    "Peace begins with a deep breath.",
    "Your best is enough.",
    "You are stronger than your stress.",
    "It’s okay to feel overwhelmed — you’re human.",
    "Take it one task at a time.",
    "Choose calm, choose clarity.",
    "You are worthy of good things.",
    "Your future needs you.",
    "One assignment at a time.",
    "Your pace is your power.",
    "You are more than your grades.",
  ];

  // shuffle
  const shuffled = [...quotes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, 5);

  quotesList.innerHTML = "";
  selected.forEach((quote, index) => {
    const number = String(index + 1).padStart(2, "0");
    quotesList.innerHTML += `
      <div class="mini-stats-wid d-flex align-items-center mt-3">
        <div class="flex-shrink-0 avatar-sm">
          <span class="mini-stat-icon avatar-title rounded-circle text-success bg-success-subtle fs-4">
            ${number}
          </span>
        </div>
        <div class="flex-grow-1 ms-3">
          <h6 class="mb-1">${quote}</h6>
        </div>
      </div>
    `;
  });
}

/* --------------------- Mood Donut Chart --------------------- */

let moodChartInstance = null;

function renderMoodDonut(moodEntries) {
  const chartEl = document.getElementById("mood-overview-chart");
  if (!chartEl) return;

  if (typeof ApexCharts === "undefined") {
    console.warn("ApexCharts not loaded.");
    return;
  }

  const MOODS = ["Happy", "Calm", "Stressed", "Sad", "Angry"];

  function countMoods(entries) {
    const counts = {};
    MOODS.forEach((m) => (counts[m] = 0));

    entries.forEach((e) => {
      if (counts[e.mood] !== undefined) counts[e.mood]++;
    });

    return counts;
  }

  function updateChart(range) {
    let filtered = moodEntries;

    if (range === "7") filtered = filterLastDays(moodEntries, 7);
    if (range === "30") filtered = filterLastDays(moodEntries, 30);

    const counts = countMoods(filtered);
    const series = MOODS.map((m) => counts[m]);
    const total = series.reduce((a, b) => a + b, 0);

    setText("moodTotalCount", total);

    // Destroy & re-render (safe)
    if (moodChartInstance) {
      moodChartInstance.destroy();
      moodChartInstance = null;
    }

    const options = {
      chart: { type: "donut", height: 320 },
      labels: MOODS,
      series,
      colors: ["#56B4E9", "#009E73", "#F0E442", "#CC79A7", "#D55E00"],
      legend: { position: "bottom" },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total Entries",
                formatter: () => total,
              },
            },
          },
        },
      },
    };

    moodChartInstance = new ApexCharts(chartEl, options);
    moodChartInstance.render();
  }

  // initial = all
  updateChart("all");

  // dropdown filters
  document.querySelectorAll(".mood-range").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      const range = item.getAttribute("data-range");
      updateChart(range);

      const btn = document.getElementById("moodRangeBtn");
      if (btn)
        btn.innerHTML = `${item.textContent} <i class="mdi mdi-chevron-down ms-1"></i>`;
    });
  });
}
