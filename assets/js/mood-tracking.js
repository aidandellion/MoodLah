/**
 * Mood Tracking Logic
 */
document.addEventListener("DOMContentLoaded", () => {
    // Determine when the mood tracking form is present
    const observer = new MutationObserver(() => {
        const form = document.getElementById("moodForm");
        if (form && !form.dataset.initialized) {
            initMoodTracking(form);
            form.dataset.initialized = "true";
        }
    });

    const contentArea = document.getElementById("page-content");
    if (contentArea) {
        observer.observe(contentArea, { childList: true, subtree: true });
    }
});

function initMoodTracking(form) {
    const dateInput = document.getElementById("moodDate");
    const noteInput = document.getElementById("moodNote");
    const feedback = document.getElementById("saveFeedback");

    // Pre-select today or date from URL
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");
    const today = new Date().toISOString().split("T")[0];
    const initialDate = dateParam || today;

    dateInput.value = initialDate;

    // Load existing data for this date
    loadMoodData(initialDate);

    // Reload data if date changes
    dateInput.addEventListener("change", (e) => loadMoodData(e.target.value));

    // Handle Save
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveMoodData();
    });

    function loadMoodData(date) {
        const allMoods = JSON.parse(localStorage.getItem("moods")) || {};
        const entry = allMoods[date];

        // Reset
        form.querySelectorAll('input[name="moodOption"]').forEach(r => r.checked = false);
        noteInput.value = "";

        if (entry) {
            const radio = form.querySelector(`input[value="${entry.mood}"]`);
            if (radio) radio.checked = true;
            noteInput.value = entry.note || "";
        }
    }

    function saveMoodData() {
        const date = dateInput.value;
        const note = noteInput.value;
        const selectedMood = form.querySelector('input[name="moodOption"]:checked');

        if (!date || !selectedMood) {
            showFeedback("Please select a date and mood.", "danger");
            return;
        }

        const mood = selectedMood.value;
        const allMoods = JSON.parse(localStorage.getItem("moods")) || {};

        allMoods[date] = {
            mood: mood,
            note: note,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem("moods", JSON.stringify(allMoods));
        showFeedback("Mood saved successfully!", "success");
    }

    function showFeedback(msg, type) {
        feedback.textContent = msg;
        feedback.className = `alert alert-${type}`;
        feedback.classList.remove("d-none");
        setTimeout(() => feedback.classList.add("d-none"), 3000);
    }
}
