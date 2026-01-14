/**
 * Mood History Logic
 */
document.addEventListener("DOMContentLoaded", () => {
  // Determine when the mood history table is present
  const observer = new MutationObserver(() => {
    const table = document.getElementById("historyTable");
    if (table && !table.dataset.initialized) {
      initMoodHistory();
      table.dataset.initialized = "true";
    }
  });

  const contentArea = document.getElementById("page-content");
  if (contentArea) {
    observer.observe(contentArea, { childList: true, subtree: true });
  }
});

function initMoodHistory() {
  const historyBody = document.getElementById("historyBody");
  const emptyState = document.getElementById("historyEmpty");
  const tableInfo = document.getElementById("historyTable");
  const clearBtn = document.getElementById("clearHistoryBtn");

  renderTable();

  // Clear History
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem("moods");
      renderTable();
    }
  });

  function renderTable() {
    const allMoods = JSON.parse(localStorage.getItem("moods")) || {};
    const dates = Object.keys(allMoods).sort().reverse(); // Newest first

    historyBody.innerHTML = "";

    if (dates.length === 0) {
      tableInfo.classList.add("d-none");
      emptyState.classList.remove("d-none");
      return;
    }

    tableInfo.classList.remove("d-none");
    emptyState.classList.add("d-none");

    dates.forEach((date) => {
      const entry = allMoods[date];
      const row = document.createElement("tr");

      // Simple map for styling
      const styleMap = {
        Happy: { class: "mood-happy", icon: "ri-emotion-happy-line" },
        Calm: { class: "mood-calm", icon: "ri-emotion-normal-line" },
        Stressed: { class: "mood-stressed", icon: "ri-emotion-line" },
        Sad: { class: "mood-sad", icon: "ri-emotion-sad-line" },
        Angry: { class: "mood-angry", icon: "ri-emotion-unhappy-line" },
      };
      const theme = styleMap[entry.mood] || {
        class: "secondary",
        icon: "ri-question-mark",
      };

      row.innerHTML = `
                <td>${formatDate(date)}</td>
                <td>
                    <span class="badge ${theme.class}-subtle text-${
        theme.class
      } fs-12">
                        <i class="${theme.icon} align-middle me-1"></i> ${
        entry.mood
      }
                    </span>
                </td>
                <td class="text-truncate" style="max-width: 250px;">${
                  entry.note || "-"
                }</td>
                <td>
                    <a href="layout.html?page=mood-tracking&date=${date}" class="btn btn-sm btn-ghost-primary">
                        <i class="ri-edit-line"></i> Edit
                    </a>
                </td>
            `;
      historyBody.appendChild(row);
    });
  }

  function formatDate(dateStr) {
    // e.g., 2025-01-01 -> Jan 01, 2025
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
