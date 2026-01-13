/*<!-- ===================== -->
<!-- Page Script -->
<!-- ===================== -->*/

  const calmingExercises = {
    angry: [
      "Do 5 minutes of slow deep breathing (inhale 4s, exhale 6s).",
      "Go for a brisk walk to release built-up tension.",
      "Stretch your neck, shoulders, and arms gently."
    ],
    sad: [
      "Try a short guided body scan meditation.",
      "Wrap yourself in a blanket and practice slow breathing.",
      "Write down one thing you’re grateful for today."
    ],
    anxious: [
      "Practice box breathing (4–4–4–4).",
      "Use the 5-4-3-2-1 grounding technique.",
      "Sit quietly and focus on relaxing your muscles one by one."
    ],
    stressed: [
      "Try progressive muscle relaxation.",
      "Step away from screens and stretch for 5 minutes.",
      "Listen to calming instrumental music."
    ],
    tired: [
      "Do gentle stretching or light yoga.",
      "Close your eyes and rest for 10–15 minutes.",
      "Practice slow breathing to recharge your energy."
    ],
    happy: [
      "Enjoy light stretching to maintain relaxation.",
      "Practice mindful breathing to stay present.",
      "Take a peaceful walk and enjoy your surroundings."
    ]
  };

  function generateCalmingExercises() {
    const mood = document.getElementById("exerciseMoodSelect").value;
    const card = document.getElementById("exerciseCard");
    const list = document.getElementById("exerciseList");

    list.innerHTML = "";

    if (!mood) {
      alert("Please select a mood first.");
      return;
    }

    calmingExercises[mood].forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = item;
      list.appendChild(li);
    });

    card.classList.remove("d-none");
  }

  let breathingInterval;

  function startBreathing() {
    clearInterval(breathingInterval);

    const circle = document.getElementById("breathingCircle");
    const text = document.getElementById("breathText");

    circle.style.transform = "scale(1)";
    text.innerText = "Inhale";
    circle.style.transform = "scale(0.6)";

    breathingInterval = setInterval(() => {
      setTimeout(() => {
        text.innerText = "Hold";
      }, 4000);

      setTimeout(() => {
        text.innerText = "Exhale";
        circle.style.transform = "scale(1)";
      }, 7000);

      setTimeout(() => {
        text.innerText = "Inhale";
        circle.style.transform = "scale(0.6)";
      }, 11000);
    }, 11000);
  }