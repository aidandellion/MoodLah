/* ================================
   Wellness Tips (Auto from Mood)
   ================================ */

const wellnessTips = {
  happy: [
    "Keep spreading positivity by doing something kind for others.",
    "Write down what made you happy today.",
    "Maintain your energy with a short walk or light exercise."
  ],
  sad: [
    "Take slow, deep breaths and allow yourself to rest.",
    "Reach out to a trusted friend or family member.",
    "Listen to calming music or journal your thoughts."
  ],
  angry: [
    "Pause and take 10 deep breaths before reacting.",
    "Release tension through stretching or walking.",
    "Write down what made you angry and reflect calmly."
  ],
  anxious: [
    "Practice the 5-4-3-2-1 grounding technique.",
    "Drink water and reduce caffeine intake.",
    "Focus on what you can control right now."
  ],
  tired: [
    "Take a short power nap (20–30 minutes).",
    "Hydrate and eat a healthy snack.",
    "Rest your eyes by stepping away from screens."
  ],
  stressed: [
    "Break tasks into smaller, manageable steps.",
    "Try a short breathing or meditation exercise.",
    "Take a break and do something you enjoy."
  ]
};

/* Wait for page content to be injected */
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const info = document.getElementById("wellnessMoodInfo");
    if (info && !info.dataset.initialized) {
      initWellnessTips();
      info.dataset.initialized = "true";
    }
  });

  const pageContent = document.getElementById("page-content");
  if (pageContent) {
    observer.observe(pageContent, { childList: true, subtree: true });
  }
});

function initWellnessTips() {
  const mood = getTodayMood();

  const info = document.getElementById("wellnessMoodInfo");     // header text
  const message = document.getElementById("displayMessage");  // card message
  const list = document.getElementById("tipsList");
  const card = document.getElementById("tipsCard");

  // Reset previous content
  list.innerHTML = "";
  message.textContent = "";
  card.classList.add("d-none");

  // No mood recorded
  if (!mood || !wellnessTips[mood]) {
    info.textContent = ""; // keep header clean
    message.textContent = "Please record your mood in the Mood Tracking page first.";
    card.classList.remove("d-none"); // show card with message
    return;
  }

  // Mood exists
  info.textContent =
    `Based on your mood today (${mood.toUpperCase()}), here are some wellness tips:`;

  wellnessTips[mood].forEach(tip => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = tip;
    list.appendChild(li);
  });

  card.classList.remove("d-none");
}


/* Shared Mood Reader */
function getTodayMood() {
  const allMoods = JSON.parse(localStorage.getItem("moods")) || {};
  const today = new Date().toISOString().split("T")[0];

  if (allMoods[today]) {
    return allMoods[today].mood.toLowerCase();
  }

  const dates = Object.keys(allMoods).sort().reverse();
  return dates.length ? allMoods[dates[0]].mood.toLowerCase() : null;
}
