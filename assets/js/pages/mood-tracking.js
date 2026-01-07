/**
 * Mood Tracking & History Management
 * 
 * This module handles all mood-related functionality:
 * - Saving mood entries to localStorage
 * - Retrieving and displaying mood history
 * - Editing today's mood entry
 * - Clearing all mood history
 * 
 * Data Structure:
 * Each mood entry: { date: "YYYY-MM-DD", mood: "Happy", note: "optional note" }
 * Storage key: "moodLahEntries"
 */

// Available mood options with emoji representations
const MOOD_OPTIONS = [
  { value: "Happy", emoji: "😊", color: "success" },
  { value: "Calm", emoji: "😌", color: "info" },
  { value: "Stressed", emoji: "😰", color: "warning" },
  { value: "Sad", emoji: "😢", color: "secondary" },
  { value: "Angry", emoji: "😠", color: "danger" }
];

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get all mood entries from localStorage
 * @returns {Array} Array of mood entry objects
 */
function getAllMoodEntries() {
  try {
    const storedData = localStorage.getItem("moodLahEntries");
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Error retrieving mood entries:", error);
    return [];
  }
}

/**
 * Save mood entries to localStorage
 * @param {Array} entries - Array of mood entry objects
 */
function saveMoodEntries(entries) {
  try {
    localStorage.setItem("moodLahEntries", JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving mood entries:", error);
    throw new Error("Failed to save mood entry. Please try again.");
  }
}

/**
 * Save a new mood entry or update existing entry for today
 * @param {string} mood - The mood value (e.g., "Happy", "Calm")
 * @param {string} note - Optional user note
 * @returns {boolean} True if successful, false otherwise
 */
function saveMoodEntry(mood, note = "") {
  // Validate mood is selected
  if (!mood || !MOOD_OPTIONS.find(m => m.value === mood)) {
    return false;
  }

  const today = getTodayDate();
  const entries = getAllMoodEntries();
  
  // Check if entry for today already exists
  const existingIndex = entries.findIndex(entry => entry.date === today);
  
  const newEntry = {
    date: today,
    mood: mood,
    note: note.trim()
  };

  if (existingIndex >= 0) {
    // Update existing entry (overwrite)
    entries[existingIndex] = newEntry;
  } else {
    // Add new entry
    entries.push(newEntry);
  }

  // Save to localStorage
  saveMoodEntries(entries);
  return true;
}

/**
 * Get today's mood entry if it exists
 * @returns {Object|null} Today's mood entry or null
 */
function getTodayMoodEntry() {
  const today = getTodayDate();
  const entries = getAllMoodEntries();
  return entries.find(entry => entry.date === today) || null;
}

/**
 * Format date for display (e.g., "Jan 15, 2025")
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get emoji for a mood value
 * @param {string} mood - Mood value
 * @returns {string} Emoji character
 */
function getMoodEmoji(mood) {
  const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
  return moodOption ? moodOption.emoji : "😐";
}

/**
 * Get color class for a mood value
 * @param {string} mood - Mood value
 * @returns {string} Bootstrap color class
 */
function getMoodColor(mood) {
  const moodOption = MOOD_OPTIONS.find(m => m.value === mood);
  return moodOption ? moodOption.color : "secondary";
}

/**
 * Sort mood entries by date (most recent first)
 * @param {Array} entries - Array of mood entries
 * @returns {Array} Sorted array
 */
function sortEntriesByDate(entries) {
  return [...entries].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
}

/**
 * Clear all mood history with confirmation
 * @returns {boolean} True if cleared, false if cancelled
 */
function clearAllMoodHistory() {
  if (confirm("Are you sure you want to clear all mood history? This action cannot be undone.")) {
    try {
      localStorage.removeItem("moodLahEntries");
      return true;
    } catch (error) {
      console.error("Error clearing mood history:", error);
      return false;
    }
  }
  return false;
}

/**
 * Initialize Mood Tracking page
 * Sets up event listeners and displays today's entry if it exists
 */
function initializeMoodTracking() {
  // Get today's entry if it exists
  const todayEntry = getTodayMoodEntry();
  
  // If entry exists, pre-select the mood and fill the note
  if (todayEntry) {
    // Highlight the selected mood button
    const moodButtons = document.querySelectorAll('.mood-option-btn');
    moodButtons.forEach(btn => {
      if (btn.dataset.mood === todayEntry.mood) {
        btn.classList.add('active');
        btn.classList.add(`btn-${getMoodColor(todayEntry.mood)}`);
        btn.classList.remove('btn-outline-secondary');
      }
    });
    
    // Fill the note textarea
    const noteInput = document.getElementById('mood-note-input');
    if (noteInput) {
      noteInput.value = todayEntry.note;
    }
    
    // Update save button text to indicate editing
    const saveButton = document.getElementById('save-mood-btn');
    if (saveButton) {
      saveButton.textContent = "Update Today's Mood";
    }
  }
  
  // Set up mood button click handlers
  const moodButtons = document.querySelectorAll('.mood-option-btn');
  moodButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      moodButtons.forEach(b => {
        b.classList.remove('active');
        b.classList.remove('btn-success', 'btn-info', 'btn-warning', 'btn-secondary', 'btn-danger');
        b.classList.add('btn-outline-secondary');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      this.classList.remove('btn-outline-secondary');
      const moodColor = getMoodColor(this.dataset.mood);
      this.classList.add(`btn-${moodColor}`);
      
      // Enable save button
      const saveButton = document.getElementById('save-mood-btn');
      if (saveButton) {
        saveButton.disabled = false;
      }
    });
  });
  
  // Set up save button handler
  const saveButton = document.getElementById('save-mood-btn');
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Get selected mood
      const selectedMoodBtn = document.querySelector('.mood-option-btn.active');
      if (!selectedMoodBtn) {
        showFeedback("Please select a mood before saving.", "error");
        return;
      }
      
      const selectedMood = selectedMoodBtn.dataset.mood;
      const noteInput = document.getElementById('mood-note-input');
      const note = noteInput ? noteInput.value : "";
      
      // Save the mood entry
      if (saveMoodEntry(selectedMood, note)) {
        const todayEntry = getTodayMoodEntry();
        if (todayEntry) {
          showFeedback("Mood saved successfully! You can edit it anytime today.", "success");
          // Update button text
          this.textContent = "Update Today's Mood";
        }
      } else {
        showFeedback("Failed to save mood. Please try again.", "error");
      }
    });
  }
}

/**
 * Initialize Mood History page
 * Displays all mood entries in a table/list format
 */
function initializeMoodHistory() {
  const entries = getAllMoodEntries();
  const sortedEntries = sortEntriesByDate(entries);
  const historyContainer = document.getElementById('mood-history-container');
  const emptyState = document.getElementById('mood-history-empty');
  const historyTable = document.getElementById('mood-history-table');
  const clearButton = document.getElementById('clear-all-mood-history-btn');
  
  if (!historyContainer) return;
  
  // Show/hide empty state
  if (sortedEntries.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (historyTable) historyTable.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (historyTable) historyTable.style.display = 'table';
    
    // Populate table body
    const tbody = historyTable ? historyTable.querySelector('tbody') : null;
    if (tbody) {
      tbody.innerHTML = '';
      
      sortedEntries.forEach(entry => {
        const row = document.createElement('tr');
        const isToday = entry.date === getTodayDate();
        
        row.innerHTML = `
          <td>${formatDateForDisplay(entry.date)} ${isToday ? '<span class="badge bg-primary ms-2">Today</span>' : ''}</td>
          <td>
            <span class="badge bg-${getMoodColor(entry.mood)}-subtle text-${getMoodColor(entry.mood)}">
              ${getMoodEmoji(entry.mood)} ${entry.mood}
            </span>
          </td>
          <td>${entry.note || '<span class="text-muted">No note</span>'}</td>
          ${isToday ? '<td><button class="btn btn-sm btn-soft-primary edit-today-mood-btn">Edit</button></td>' : '<td></td>'}
        `;
        
        tbody.appendChild(row);
      });
      
      // Set up edit button for today's entry
      const editBtn = tbody.querySelector('.edit-today-mood-btn');
      if (editBtn) {
        editBtn.addEventListener('click', function() {
          // Switch to Mood Tracking page
          showMoodTrackingPage();
        });
      }
    }
  }
  
  // Set up clear all button
  if (clearButton) {
    clearButton.addEventListener('click', function() {
      if (clearAllMoodHistory()) {
        showFeedback("All mood history has been cleared.", "success");
        // Refresh the history display
        initializeMoodHistory();
      }
    });
  }
}

/**
 * Show feedback message to user
 * @param {string} message - Message to display
 * @param {string} type - Type of feedback: "success" or "error"
 */
function showFeedback(message, type = "success") {
  // Remove any existing feedback
  const existingFeedback = document.querySelector('.mood-feedback-message');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  // Create feedback element
  const feedback = document.createElement('div');
  feedback.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show mood-feedback-message`;
  feedback.setAttribute('role', 'alert');
  feedback.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Insert at the top of the relevant container
  const moodTrackingContainer = document.getElementById('mood-tracking-container');
  const moodHistoryContainer = document.getElementById('mood-history-container');
  const container = moodTrackingContainer || moodHistoryContainer;
  
  if (container) {
    container.insertBefore(feedback, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 5000);
  }
}

/**
 * Show Mood Tracking page and hide others
 */
function showMoodTrackingPage() {
  // Hide all page sections (including default dashboard)
  const allPages = document.querySelectorAll('.mood-page-section');
  allPages.forEach(page => page.style.display = 'none');
  
  // Show mood tracking page
  const trackingPage = document.getElementById('mood-tracking-page');
  if (trackingPage) {
    trackingPage.style.display = 'block';
    initializeMoodTracking();
  }
}

/**
 * Show Mood History page and hide others
 */
function showMoodHistoryPage() {
  // Hide all page sections (including default dashboard)
  const allPages = document.querySelectorAll('.mood-page-section');
  allPages.forEach(page => page.style.display = 'none');
  
  // Show mood history page
  const historyPage = document.getElementById('mood-history-page');
  if (historyPage) {
    historyPage.style.display = 'block';
    initializeMoodHistory();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Set up navigation link handlers
  const moodTrackingLinks = document.querySelectorAll('[data-page="mood-tracking"]');
  const moodHistoryLinks = document.querySelectorAll('[data-page="mood-history"]');
  
  // Handle all mood tracking links (sidebar and buttons)
  moodTrackingLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showMoodTrackingPage();
    });
  });
  
  // Handle all mood history links (sidebar and buttons)
  moodHistoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showMoodHistoryPage();
    });
  });
  
  // Initialize the page that should be visible by default
  // Check if mood tracking page exists and is visible
  const trackingPage = document.getElementById('mood-tracking-page');
  if (trackingPage && trackingPage.style.display !== 'none') {
    initializeMoodTracking();
  }
  
  // Check if mood history page exists and is visible
  const historyPage = document.getElementById('mood-history-page');
  if (historyPage && historyPage.style.display !== 'none') {
    initializeMoodHistory();
  }
});

