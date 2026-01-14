/**
 * WEEKLY REPORT SYSTEM
 * =====================
 * This script generates a weekly mood tracking report that:
 * 1. Reads mood data from localStorage
 * 2. Filters entries for the current week (Monday-Sunday)
 * 3. Displays mood statistics and most common mood
 * 4. Allows users to download the report as PDF
 */

// ===== INITIALIZATION =====

/**
 * Checks if all required HTML elements are loaded in the DOM
 * Returns true if elements exist, false if they need to wait
 */
function initializeReport() {
    // Get the three main elements needed for the report
    const summaryOutput = document.getElementById("summaryOutput");
    const reportStats = document.getElementById("reportStats");
    const downloadButton = document.getElementById("downloadReport");

    // If any element is missing, return false to try again later
    if (!summaryOutput || !reportStats || !downloadButton) {
        return false;
    }

    // All elements found! Generate the report and setup download button
    generateWeeklyReport();
    downloadButton.addEventListener("click", downloadReportAsPDF);
    
    return true;
}

/**
 * Waits for the page to load, then initializes the report
 * Uses MutationObserver to handle dynamic content loading
 * (Important for single-page applications where content loads after page ready)
 */
document.addEventListener("DOMContentLoaded", function () {
    // Try to initialize immediately
    if (!initializeReport()) {
        // If elements aren't ready yet, watch for DOM changes
        const observer = new MutationObserver(function() {
            if (initializeReport()) {
                // Success! Stop watching for changes
                observer.disconnect();
            }
        });

        // Start watching the entire document for new elements
        observer.observe(document.body, {
            childList: true,  // Watch for added/removed elements
            subtree: true     // Watch all descendants, not just direct children
        });
    }
});

// ===== MAIN REPORT GENERATION =====

/**
 * Main function that generates the weekly mood report
 * Reads data from localStorage, filters by current week, and displays results
 */
function generateWeeklyReport() {
    // Get references to the output containers
    const summaryOutput = document.getElementById("summaryOutput");
    const reportStats = document.getElementById("reportStats");

    // Load all mood entries from browser's localStorage
    // If no data exists, use an empty object
    const moodHistory = JSON.parse(localStorage.getItem("moods")) || {};

    // CASE 1: No mood data at all
    if (Object.keys(moodHistory).length === 0) {
        summaryOutput.innerHTML = `
            <div class="alert alert-info">
                <i class="ri-information-line align-middle me-2"></i>
                No mood entries found. Start tracking your mood to see weekly reports!
            </div>
        `;
        return;
    }

    // Get the date range for current week (Monday to Sunday)
    const today = new Date();
    const weekStart = getWeekStartDate(today);  // This week's Monday
    const weekEnd = getWeekEndDate(today);      // This week's Sunday

    // Filter mood entries to only include this week's data
    const currentWeekEntries = Object.entries(moodHistory).filter(([dateStr, entry]) => {
        const entryDate = new Date(dateStr);
        // Check if entry date falls within this week
        return entryDate >= weekStart && entryDate <= weekEnd;
    });

    // CASE 2: Have mood data but none for this week
    if (currentWeekEntries.length === 0) {
        summaryOutput.innerHTML = `
            <div class="alert alert-warning">
                <i class="ri-information-line align-middle me-2"></i>
                No mood entries found for this week (${formatDate(weekStart)} - ${formatDate(weekEnd)}).
            </div>
        `;
        reportStats.innerHTML = "";
        return;
    }

    // CASE 3: Have data for this week - count and display it!
    
    // Initialize counters
    let totalReports = 0;
    let moodCount = { Happy: 0, Calm: 0, Stressed: 0, Sad: 0, Angry: 0 };

    // Loop through this week's entries and count each mood type
    currentWeekEntries.forEach(([dateStr, entry]) => {
        totalReports++;
        // Only count if it's a valid mood type
        if (moodCount[entry.mood] !== undefined) {
            moodCount[entry.mood]++;
        }
    });

    // Find which mood appeared most frequently this week
    let mostCommonMood = "None";
    let maxCount = 0;
    Object.entries(moodCount).forEach(([mood, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommonMood = mood;
        }
    });

    // Display the weekly overview summary
    summaryOutput.innerHTML = `
        <div class="alert alert-primary">
            <h6 class="mb-2"><strong>Weekly Overview</strong></h6>
            <p class="mb-1"><strong>Week Period:</strong> ${formatDate(weekStart)} - ${formatDate(weekEnd)}</p>
            <p class="mb-1"><strong>Total Mood Entries:</strong> ${totalReports}</p>
            <p class="mb-0"><strong>Most Common Mood:</strong> ${mostCommonMood} (${maxCount} times)</p>
        </div>
    `;

    // Display the mood breakdown with emojis and counts
    reportStats.innerHTML = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            😊 Happy
            <span class="badge bg-success rounded-pill">${moodCount.Happy}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            😌 Calm
            <span class="badge bg-info rounded-pill">${moodCount.Calm}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            😣 Stressed
            <span class="badge bg-warning rounded-pill">${moodCount.Stressed}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            😢 Sad
            <span class="badge bg-primary rounded-pill">${moodCount.Sad}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
            😠 Angry
            <span class="badge bg-danger rounded-pill">${moodCount.Angry}</span>
        </li>
    `;
}

// ===== PDF DOWNLOAD FEATURE =====

/**
 * Allows user to download/print the report as a PDF
 * Uses the browser's built-in print dialog (which has "Save as PDF" option)
 */
function downloadReportAsPDF() {
    const downloadButton = document.getElementById("downloadReport");
    
    // Hide the download button so it doesn't appear in the PDF
    downloadButton.style.display = "none";
    
    // Set a descriptive document title for the PDF filename
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.title = `MoodLah Weekly Report - ${today}`;

    // Open the browser's print dialog
    // User can choose to print or save as PDF
    window.print();

    // After print dialog closes, show the download button again
    setTimeout(() => {
        downloadButton.style.display = "block";
    }, 100);
}

// ===== HELPER FUNCTIONS FOR DATE CALCULATIONS =====

/**
 * Returns the Monday (start) of the week for a given date
 * Example: If today is Wednesday Jan 15, returns Monday Jan 13
 */
function getWeekStartDate(date) {
    const d = new Date(date);
    const day = d.getDay();  // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Calculate how many days to subtract to get to Monday
    // If Sunday (0), go back 6 days; otherwise go back (day - 1) days
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    
    return new Date(d.setDate(diff));
}

/**
 * Returns the Sunday (end) of the week for a given date
 * Simply adds 6 days to the week start date
 */
function getWeekEndDate(date) {
    const start = getWeekStartDate(date);
    // Add 6 days (in milliseconds) to Monday to get Sunday
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

/**
 * Formats a date object into readable format
 * Example: Returns "Jan 15, 2026" instead of "2026-01-15"
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short',   // Short month name (Jan, Feb, etc.)
        day: 'numeric',   // Day as number
        year: 'numeric'   // Full year
    });
}