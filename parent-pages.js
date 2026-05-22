document.getElementById("year").textContent = new Date().getFullYear();

function searchSite() {
  const value = document.querySelector(".search-box input")?.value || "";
  if (value.trim()) alert("Searching for: " + value);
}

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle?.addEventListener("click", () => {
  navMenu?.classList.toggle("open");
  menuToggle.classList.toggle("active");
});

navMenu?.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    menuToggle?.classList.remove("active");
  });
});
