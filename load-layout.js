function loadLayout(id, file) {
  return fetch(file)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById(id).innerHTML = html;
    });
}

function loadPageContent() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || "home";

  fetch(`pages/${page}.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("page-content").innerHTML = html;
    });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

Promise.all([
  loadLayout("topbar", "layout/topbar.html"),
  loadLayout("theme-settings", "layout/theme-settings.html"),
  loadLayout("footer", "layout/footer.html"),
])
  .then(() => loadScript("assets/js/app.js")) // app.js AFTER theme settings exists
  .then(loadPageContent)
  .catch((err) => console.error("Layout load error:", err));