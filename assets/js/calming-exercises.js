/* ==================================
   Calming Exercises (Auto from Mood)
   ================================== */

/*
  Object that stores calming exercises
  for each possible mood.
  The key = mood name
  The value = array of exercise strings
*/
const calmingExercises = {
  angry: [
    "Do 5 minutes of slow deep breathing.",
    "Go for a brisk walk to release tension.",
    "Stretch your shoulders and neck gently."
  ],
  sad: [
    "Try a guided body scan meditation.",
    "Wrap yourself in a blanket and breathe slowly.",
    "Write down one thing you’re grateful for."
  ],
  anxious: [
    "Practice box breathing (4–4–4–4).",
    "Use the 5-4-3-2-1 grounding technique.",
    "Relax each muscle group one by one."
  ],
  stressed: [
    "Try progressive muscle relaxation.",
    "Stretch away from screens for a few minutes.",
    "Listen to calming instrumental music."
  ],
  tired: [
    "Do gentle stretching or light yoga.",
    "Close your eyes and rest for 10 minutes.",
    "Practice slow breathing to recharge."
  ],
  happy: [
    "Enjoy light stretching to stay relaxed.",
    "Practice mindful breathing.",
    "Take a peaceful walk and enjoy nature."
  ]
};

/*
  DOMContentLoaded ensures the script runs
  after the main HTML page is ready.
  Since your pages are loaded dynamically,
  we use MutationObserver.
*/
document.addEventListener("DOMContentLoaded", () => {

  // Watches for changes inside #page-content
  const observer = new MutationObserver(() => {

    // Get the element where mood info will be shown
    const info = document.getElementById("moodInfo");

    /*
      Prevents the function from running multiple times
      by checking a custom data attribute
    */
    if (info && !info.dataset.initialized) {
      initCalmingExercises(); // Initialize page logic
      info.dataset.initialized = "true";
    }
  });

  // The container where pages are injected dynamically
  const pageContent = document.getElementById("page-content");

  // Start observing page-content for changes
  if (pageContent) {
    observer.observe(pageContent, { childList: true, subtree: true });
  }
});

/*
  Main function that generates calming exercises
  based on the user's saved mood
*/
function initCalmingExercises() {

  // Get user's mood from localStorage
  const mood = getTodayMood();

  // Get important DOM elements
  const info = document.getElementById("moodInfo");
  const message = document.getElementById("displayMessage");  // card message
  const list = document.getElementById("exerciseList");
  const card = document.getElementById("exerciseCard");

  // Clear previous exercises (important if page reloads)
  list.innerHTML = "";
  message.textContent = "";
  card.classList.add("d-none");

  // If no mood is found, show instruction message
  if (!mood || !wellnessTips[mood]) {
    info.textContent = ""; // keep header clean
    message.textContent = "Please record your mood in the Mood Tracking page first.";
    card.classList.remove("d-none"); // show card with message
    return;
  }

  // Display mood-based message
  info.textContent =
    `Based on your mood today (${mood.toUpperCase()}), here are some calming exercises:`;

  // Loop through exercises for the mood
  calmingExercises[mood].forEach(exercise => {

    // Create a list item
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = exercise;

    // Add to the list
    list.appendChild(li);
  });

  // Show the card after exercises are generated
  card.classList.remove("d-none");
}

/*
  Function to retrieve today's mood
  from localStorage (saved in Mood Tracking)
*/
function getTodayMood() {

  // Get all saved moods
  const allMoods = JSON.parse(localStorage.getItem("moods")) || {};

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // If today's mood exists, return it
  if (allMoods[today]) {
    return allMoods[today].mood.toLowerCase();
  }

  // Fallback: return the most recent mood if today not found
  const dates = Object.keys(allMoods).sort().reverse();
  return dates.length ? allMoods[dates[0]].mood.toLowerCase() : null;
}
