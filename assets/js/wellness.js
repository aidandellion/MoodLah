
  const wellnessTips = {
    happy: [
      "Keep spreading positivity by doing something kind for others.",
      "Capture the moment by journaling what made you happy today.",
      "Maintain your energy with a short walk or light exercise."
    ],
    sad: [
      "It's okay to feel sad. Take slow, deep breaths for a few minutes.",
      "Reach out to a trusted friend or family member.",
      "Listen to calming music or write down your thoughts."
    ],
    angry: [
      "Pause and take 10 deep breaths before reacting.",
      "Release tension with physical activity like walking or stretching.",
      "Try writing down what made you angry and how to resolve it."
    ],
    anxious: [
      "Practice the 5-4-3-2-1 grounding technique.",
      "Limit caffeine intake and drink water.",
      "Focus on what you can control right now."
    ],
    tired: [
      "Take a short power nap (20–30 minutes).",
      "Stay hydrated and eat a healthy snack.",
      "Step away from screens and rest your eyes."
    ],
    stressed: [
      "Break tasks into smaller, manageable steps.",
      "Try a short breathing or meditation exercise.",
      "Take a break and do something enjoyable."
    ]
  };

  function generateWellnessTips() {
    const mood = document.getElementById("moodSelect").value;
    const tipsCard = document.getElementById("tipsCard");
    const tipsList = document.getElementById("tipsList");

    tipsList.innerHTML = "";

    if (!mood) {
      alert("Please select a mood first.");
      return;
    }

    wellnessTips[mood].forEach(tip => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = tip;
      tipsList.appendChild(li);
    });

    tipsCard.classList.remove("d-none");
  }