function loadPartial(id, file) {
  return fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

function loadPageContent() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || "home";

  fetch(`pages/${page}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("page-content").innerHTML = html;
    });
}

Promise.all([
  loadPartial("topbar", "layout/topbar.html"),
  loadPartial("footer", "layout/footer.html"),
]).then(loadPageContent);
