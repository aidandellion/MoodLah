/**
 * Enhanced Weekly Report Logic
 * Groups mood history by weeks and displays "This Week's Report" format
 */

// Wait for the page content to load before applying the logic
document.addEventListener("DOMContentLoaded", () => {
    // Use MutationObserver to detect when the summary output is available, and then auto-generate the report
    const observer = new MutationObserver(() => {
        const summaryOutput = document.getElementById("summaryOutput");
        if (summaryOutput && !summaryOutput.dataset.initialized) {
            summaryOutput.dataset.initialized = "true"; // Mark as initialized to prevent multiple triggers
            generateWeeklyReport(); // Auto-generate the report when the page loads
            observer.disconnect(); // Disconnect the observer after it has been used
        }
    });

    // Observe the content area or the entire page if no specific content area is found
    const contentArea = document.getElementById("page-content") || document.body;
    observer.observe(contentArea, { childList: true, subtree: true }); // Listen for changes in the page content
});

/**
 * Generates the weekly report by fetching mood data from localStorage,
 * grouping it by week, and then rendering the data into the page.
 */
function generateWeeklyReport() {
    const summaryOutput = document.getElementById("summaryOutput");
    const moodHistory = JSON.parse(localStorage.getItem("moods")) || {}; // Retrieve mood history from localStorage
    
    // If no mood entries are found, display a message prompting the user to start tracking
    if (Object.keys(moodHistory).length === 0) {
        summaryOutput.innerHTML = `
            <div class="alert alert-info">
                <i class="ri-information-line align-middle me-2"></i>
                No mood entries found. Start tracking your mood to see weekly reports!
            </div>
            <div class="text-center">
                <a href="layout.html?page=mood-tracking" class="btn btn-primary">
                    <i class="ri-add-line me-1"></i>
                    Start Tracking
                </a>
            </div>
        `;
        return;
    }

    // Group mood entries by week and generate HTML content
    const weeklyData = groupByWeek(moodHistory);
    
    let html = '';
    weeklyData.forEach((week, index) => {
        const isCurrentWeek = index === 0; // Check if this is the current week
        html += generateWeekCard(week, isCurrentWeek); // Generate a card for each week
    });
    
    summaryOutput.innerHTML = html; // Insert the generated HTML into the summary output container
}

/**
 * Groups mood entries by week (using year and week number).
 * 
 * @param {Object} moodHistory - The mood history data stored in localStorage.
 * @returns {Array} - Array of grouped weeks with mood entries.
 */
function groupByWeek(moodHistory) {
    const weeks = {}; // Object to store grouped weeks
    const today = new Date(); // Get today's date
    
    // Iterate over each mood entry in moodHistory
    Object.keys(moodHistory).forEach(dateStr => {
        const entry = moodHistory[dateStr];
        const entryDate = new Date(dateStr); // Convert string date to Date object
        
        // Calculate the unique key for each week (year-week format)
        const weekKey = getWeekKey(entryDate);
        
        // If this week doesn't exist in the weeks object, initialize it
        if (!weeks[weekKey]) {
            weeks[weekKey] = {
                weekNumber: getWeekNumber(entryDate),
                year: entryDate.getFullYear(),
                startDate: getWeekStartDate(entryDate),
                endDate: getWeekEndDate(entryDate),
                entries: [],
                isCurrent: isSameWeek(entryDate, today) // Check if this is the current week
            };
        }
        
        // Add the entry to the respective week
        weeks[weekKey].entries.push({
            date: dateStr,
            dateObj: entryDate,
            mood: entry.mood,
            note: entry.note || "No note",
            timestamp: entry.timestamp || new Date(dateStr).toISOString()
        });
    });
    
    // Convert weeks object into an array and sort by week (newest first)
    return Object.values(weeks)
        .sort((a, b) => b.startDate - a.startDate)
        .map(week => {
            week.entries.sort((a, b) => b.dateObj - a.dateObj); // Sort entries by date (newest first)
            return week;
        });
}

/**
 * Generates a card to display weekly data including mood breakdown, entries, and stats.
 * 
 * @param {Object} week - The week data object.
 * @param {boolean} isCurrentWeek - Flag to check if this is the current week.
 * @returns {string} - HTML string for the week card.
 */
function generateWeekCard(week, isCurrentWeek) {
    const moodCount = { Happy: 0, Calm: 0, Stressed: 0, Sad: 0, Angry: 0 };
    week.entries.forEach(entry => {
        if (moodCount[entry.mood] !== undefined) {
            moodCount[entry.mood]++; // Count occurrences of each mood for the week
        }
    });
    
    const dominantMood = Object.entries(moodCount).reduce((a, b) => b[1] > a[1] ? b : a)[0]; // Find the dominant mood for the week
    
    const weekTitle = isCurrentWeek ? "This Week's Report" : `Week ${week.weekNumber} Report`; // Set title depending on whether it's the current week
    
    const dateRange = `${formatDateShort(week.startDate)} - ${formatDateShort(week.endDate)}`; // Format the date range for the week
    
    // Generate the HTML structure for the week card
    return `
        <div class="card mb-3 ${isCurrentWeek ? 'border-primary' : ''}">
            <div class="card-header bg-${isCurrentWeek ? 'primary' : 'light'}">
                <h5 class="card-title mb-0 ${isCurrentWeek ? 'text-white' : 'text-dark'}">
                    ${isCurrentWeek ? '<i class="ri-calendar-check-line me-2"></i>' : ''}
                    ${weekTitle}
                </h5>
                <small class="${isCurrentWeek ? 'text-white' : 'text-muted'}">${dateRange}</small>
            </div>
            <div class="card-body">
                <!-- Daily Entries Section -->
                <div class="mb-3">
                    <h6 class="text-muted mb-3">Daily Entries</h6>
                    ${generateDailyEntries(week.entries)} <!-- Generate daily entries for the week -->
                </div>
                
                <!-- Week Summary Section -->
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <h6 class="text-muted mb-2">Week Statistics</h6>
                            <p class="mb-1"><strong>Total Entries:</strong> ${week.entries.length}</p>
                            <p class="mb-0"><strong>Dominant Mood:</strong> ${getMoodBadge(dominantMood)}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="border rounded p-3">
                            <h6 class="text-muted mb-2">Mood Breakdown</h6>
                            ${generateMoodBreakdown(moodCount)} <!-- Generate mood breakdown for the week -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates the daily entries for the week, including mood, date, time, and note.
 * 
 * @param {Array} entries - The list of entries for the week.
 * @returns {string} - HTML string for the daily entries.
 */
function generateDailyEntries(entries) {
    return entries.map(entry => {
        const dayOfWeek = entry.dateObj.toLocaleDateString('en-US', { weekday: 'long' }); // Get the day of the week
        const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }); // Format the time of the entry
        const formattedDate = entry.dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }); // Format the date

        return `
            <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                <div class="flex-shrink-0 me-3">
                    ${getMoodIcon(entry.mood)} <!-- Display mood icon -->
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${dayOfWeek}</strong>
                            <span class="text-muted ms-2">${formattedDate}</span>
                        </div>
                        <small class="text-muted">${time}</small> <!-- Display time of entry -->
                    </div>
                    <div class="mt-1">
                        ${getMoodBadge(entry.mood)} <!-- Display mood badge -->
                    </div>
                    ${entry.note !== "No note" ? `<p class="text-muted small mb-0 mt-1">${entry.note}</p>` : ''}
                </div>
            </div>
        `;
    }).join(''); // Join the array of HTML strings into a single string
}

/**
 * Generates the mood breakdown for the week (e.g., number of happy, calm, stressed, etc.).
 * 
 * @param {Object} moodCount - The mood count for the week.
 * @returns {string} - HTML string for the mood breakdown.
 */
function generateMoodBreakdown(moodCount) {
    return Object.entries(moodCount)
        .filter(([mood, count]) => count > 0) // Only show moods that have a count greater than 0
        .map(([mood, count]) => `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span>${getMoodBadge(mood)}</span>
                <span class="badge bg-light text-dark">${count}</span>
            </div>
        `).join(''); // Join the array of HTML strings into a single string
}

/**
 * Generates the HTML badge for a given mood.
 * 
 * @param {string} mood - The mood (Happy, Calm, etc.).
 * @returns {string} - HTML string for the mood badge.
 */
function getMoodBadge(mood) {
    const styleMap = {
        "Happy": { class: "success", icon: "ri-emotion-happy-line" },
        "Calm": { class: "info", icon: "ri-emotion-normal-line" },
        "Stressed": { class: "warning", icon: "ri-emotion-line" },
        "Sad": { class: "primary", icon: "ri-emotion-sad-line" },
        "Angry": { class: "danger", icon: "ri-emotion-unhappy-line" }
    };
    const theme = styleMap[mood] || { class: "secondary", icon: "ri-question-mark" };
    
    return `<span class="badge bg-${theme.class}-subtle text-${theme.class}"><i class="${theme.icon} align-middle me-1"></i>${mood}</span>`;
}

/**
 * Generates the icon for a given mood.
 * 
 * @param {string} mood - The mood (Happy, Calm, etc.).
 * @returns {string} - HTML string for the mood icon.
 */
function getMoodIcon(mood) {
    const icons = {
        "Happy": "😊",
        "Calm": "😌",
        "Stressed": "😣",
        "Sad": "😢",
        "Angry": "😠"
    };
    return `<span style="font-size: 24px;">${icons[mood] || "❓"}</span>`; // Return icon for the mood
}

// Utility Functions
/**
 * Gets a unique key for each week, based on the year and week number.
 * 
 * @param {Date} date - The date object.
 * @returns {string} - The week key (e.g., "2026-W01").
 */
function getWeekKey(date) {
    return `${date.getFullYear()}-W${getWeekNumber(date)}`;
}

/**
 * Gets the week number for a given date.
 * 
 * @param {Date} date - The date object.
 * @returns {number} - The week number.
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Gets the start date of the week for a given date.
 * 
 * @param {Date} date - The date object.
 * @returns {Date} - The start date of the week.
 */
function getWeekStartDate(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
}

/**
 * Gets the end date of the week for a given date.
 * 
 * @param {Date} date - The date object.
 * @returns {Date} - The end date of the week (6 days after the start date).
 */
function getWeekEndDate(date) {
    const start = getWeekStartDate(date);
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

/**
 * Checks if two dates are in the same week.
 * 
 * @param {Date} date1 - The first date object.
 * @param {Date} date2 - The second date object.
 * @returns {boolean} - True if both dates are in the same week, false otherwise.
 */
function isSameWeek(date1, date2) {
    return getWeekKey(date1) === getWeekKey(date2);
}

/**
 * Formats a date into a short format (e.g., "Jan 01").
 * 
 * @param {Date} date - The date object.
 * @returns {string} - The formatted date string.
 */
function formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
