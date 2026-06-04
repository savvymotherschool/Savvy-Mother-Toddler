// Shared site interactions used by static pages.

function searchSite() {
  const value = document.querySelector(".search-box input")?.value || "";
  if (value.trim()) {
    alert("Searching for: " + value);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".search-box button").forEach((button) => {
    button.addEventListener("click", searchSite);
  });

  document.querySelectorAll("[data-href]").forEach((control) => {
    control.addEventListener("click", () => {
      const href = control.getAttribute("data-href");
      if (href) {
        window.location.href = href;
      }
    });
  });
});
