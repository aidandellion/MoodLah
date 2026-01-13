localStorage.setItem(
  "moodEntries",
  JSON.stringify([
    { date: "2026-01-07", mood: "Happy" },
    { date: "2026-01-08", mood: "Calm" },
    { date: "2026-01-09", mood: "Stressed" },
    { date: "2026-01-10", mood: "Happy" },
    { date: "2026-01-11", mood: "Neutral" },
    { date: "2026-01-12", mood: "Angry" },
    { date: "2026-01-13", mood: "Happy" },
  ])
);

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // SECTION A: DASHBOARD STATS (Mood Entries, Positive Days, Streak)
  // =========================================================

  const STORAGE_KEY = "moodEntries";
  const POSITIVE_MOODS = ["Happy", "Calm", "Relaxed", "Motivated"];

  function readMoodData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function toISODate(dateObj) {
    return dateObj.toISOString().split("T")[0];
  }

  function getLastNDaysEntries(data, n) {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (n - 1));

    const startISO = toISODate(start);
    const endISO = toISODate(today);

    return data.filter((item) => item.date >= startISO && item.date <= endISO);
  }

  function countUniqueDays(entries) {
    return new Set(entries.map((e) => e.date)).size;
  }

  function calcStreak(data) {
    const set = new Set(data.map((e) => e.date));
    let streak = 0;
    const d = new Date();

    while (true) {
      const iso = toISODate(d);
      if (set.has(iso)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }

  function trendPercent(current, previous) {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  function setBadge(badgeEl, trendEl, value) {
    if (!badgeEl || !trendEl) return;

    const iconEl = badgeEl.querySelector("i");
    const up = value >= 0;

    badgeEl.classList.remove(
      "bg-success-subtle",
      "text-success",
      "bg-danger-subtle",
      "text-danger"
    );
    iconEl.classList.remove("ri-arrow-up-s-line", "ri-arrow-down-s-line");

    if (up) {
      badgeEl.classList.add("bg-success-subtle", "text-success");
      iconEl.classList.add("ri-arrow-up-s-line");
    } else {
      badgeEl.classList.add("bg-danger-subtle", "text-danger");
      iconEl.classList.add("ri-arrow-down-s-line");
    }

    trendEl.textContent = `${Math.abs(value)} %`;
  }

  function getLastWeekEntries(data) {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 13);
    const end = new Date();
    end.setDate(today.getDate() - 7);

    const startISO = toISODate(start);
    const endISO = toISODate(end);

    return data.filter((item) => item.date >= startISO && item.date <= endISO);
  }

  // Run dashboard stats
  const data = readMoodData();
  const thisWeek = getLastNDaysEntries(data, 7);
  const lastWeek = getLastWeekEntries(data);

  // Card 1: Mood Entries
  const moodEntriesThisWeek = thisWeek.length;
  const moodEntriesLastWeek = lastWeek.length;
  const moodEntriesTrend = trendPercent(
    moodEntriesThisWeek,
    moodEntriesLastWeek
  );

  const statMoodEntries = document.getElementById("statMoodEntries");
  if (statMoodEntries) statMoodEntries.textContent = moodEntriesThisWeek;

  setBadge(
    document.getElementById("badgeMoodEntries"),
    document.getElementById("trendMoodEntries"),
    moodEntriesTrend
  );

  // Card 2: Positive Days
  const positiveThisWeek = thisWeek.filter((e) =>
    POSITIVE_MOODS.includes(e.mood)
  ).length;
  const positiveLastWeek = lastWeek.filter((e) =>
    POSITIVE_MOODS.includes(e.mood)
  ).length;
  const positiveTrend = trendPercent(positiveThisWeek, positiveLastWeek);

  const statPositiveDays = document.getElementById("statPositiveDays");
  if (statPositiveDays) statPositiveDays.textContent = positiveThisWeek;

  setBadge(
    document.getElementById("badgePositiveDays"),
    document.getElementById("trendPositiveDays"),
    positiveTrend
  );

  // Card 3: Tracking Streak
  const streak = calcStreak(data);
  const statStreak = document.getElementById("statStreak");
  if (statStreak) statStreak.textContent = streak;

  const uniqueThisWeek = countUniqueDays(thisWeek);
  const uniqueLastWeek = countUniqueDays(lastWeek);
  const streakTrend = trendPercent(uniqueThisWeek, uniqueLastWeek);

  setBadge(
    document.getElementById("badgeStreak"),
    document.getElementById("trendStreak"),
    streakTrend
  );

  // =========================================================
  // SECTION B: QUOTES (Display 5 random quotes in dashboard card)
  // =========================================================

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
    "Take it one task at a time.",
    "Choose calm, choose clarity.",
    "You are worthy of good things.",
    "Your future needs you.",
    "One assignment at a time.",
    "Your pace is your power.",
    "You are more than your grades.",
  ];

  const quotesList = document.getElementById("quotesList");
  if (quotesList) {
    const shuffled = [...quotes];

    // Fisher-Yates shuffle
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

  // =========================================================
  // SECTION C: MOODS OVERVIEW DONUT (ApexCharts)
  // =========================================================

  const moodData = readMoodData(); // already exists in home.js

  const MOOD_LABELS = ["Happy", "Calm", "Neutral", "Stressed", "Sad", "Angry"];

  function getEntriesByRange(days) {
    if (days === "all") return moodData;

    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (days - 1));

    const startISO = toISODate(start);
    const endISO = toISODate(today);

    return moodData.filter(
      (item) => item.date >= startISO && item.date <= endISO
    );
  }

  function countMoods(entries) {
    const counts = {};
    MOOD_LABELS.forEach((m) => (counts[m] = 0));

    entries.forEach((e) => {
      if (counts[e.mood] !== undefined) counts[e.mood]++;
    });

    return counts;
  }

  let moodChart = null;

  function renderMoodChart(range = "all") {
    const entries =
      range === "all" ? getEntriesByRange("all") : getEntriesByRange(range);

    const counts = countMoods(entries);
    const series = MOOD_LABELS.map((m) => counts[m]);
    const total = series.reduce((a, b) => a + b, 0);

    // Update Total Count only
    const totalEl = document.getElementById("moodTotalCount");
    if (totalEl) totalEl.textContent = total;

    // Chart container
    const chartEl = document.querySelector("#mood-overview-chart");
    if (!chartEl) return;

    // Destroy old chart if exists
    if (moodChart) {
      moodChart.destroy();
      moodChart = null;
    }

    const options = {
      chart: {
        type: "donut",
        height: 320,
      },
      labels: MOOD_LABELS,
      series: series,

      colors: [
        "#0d6efd",
        "#20c997",
        "#ffc107",
        "#ff4d4f",
        "#6f42c1",
        "#fd7e14",
      ],

      legend: {
        position: "bottom",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 0,
      },
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

    moodChart = new ApexCharts(chartEl, options);
    moodChart.render();
  }

  // initial render
  renderMoodChart("all");

  // Dropdown filter
  document.querySelectorAll(".mood-range").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      const range = item.getAttribute("data-range");
      const btn = document.getElementById("moodRangeBtn");

      // Update button label
      if (btn)
        btn.innerHTML = `${item.textContent} <i class="mdi mdi-chevron-down ms-1"></i>`;

      // Render chart based on selected range
      if (range === "all") renderMoodChart("all");
      else renderMoodChart(parseInt(range));
    });
  });
});

document.querySelectorAll(".mood-range").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const range = item.getAttribute("data-range");

    // update dropdown button text
    const btn = document.querySelector(".dropdown-btn.text-muted");
    if (btn)
      btn.innerHTML = `${item.textContent} <i class="mdi mdi-chevron-down ms-1"></i>`;

    // render chart with range
    if (range === "all") renderMoodChart("all");
    else renderMoodChart(parseInt(range));
  });
});
