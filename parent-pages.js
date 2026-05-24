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

const enquiryForm = document.getElementById("enquiryForm");
const enquiryFormPanel = document.getElementById("enquiryFormPanel");
const enquiryToggle = document.getElementById("enquiryToggle");
const openEnquiryButtons = document.querySelectorAll("[data-open-enquiry]");

function setEnquiryFormOpen(isOpen, shouldScroll = false) {
  if (!enquiryFormPanel || !enquiryToggle) return;

  enquiryFormPanel.hidden = !isOpen;
  enquiryToggle.setAttribute("aria-expanded", String(isOpen));
  enquiryToggle.querySelector("span").textContent = isOpen ? "Close Enquiry Form" : "Open Enquiry Form";

  if (isOpen && shouldScroll) {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

enquiryToggle?.addEventListener("click", () => {
  setEnquiryFormOpen(enquiryFormPanel?.hidden, false);
});

openEnquiryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setEnquiryFormOpen(true, true);
  });
});

enquiryForm?.addEventListener("submit", () => {
  if (!enquiryForm.checkValidity()) return;

  const formData = new FormData(enquiryForm);
  const heardFrom = formData.getAll("hearAbout[]").filter(Boolean).join(", ") || "-";
  const otherSource = formData.get("otherSource") || "-";
  const message = [
    "New Enquiry Form",
    "",
    "Class Applied For: " + (formData.get("classAppliedFor") || "-"),
    "",
    "Child Information",
    "Child's Name: " + (formData.get("childName") || "-"),
    "Date of Birth: " + (formData.get("dob") || "-"),
    "Age: " + (formData.get("age") || "-"),
    "Child's Gender: " + (formData.get("childGender") || "-"),
    "",
    "Parent's Information",
    "Parent's Name: " + (formData.get("parentName") || "-"),
    "Parent's Gender: " + (formData.get("parentGender") || "-"),
    "Address: " + (formData.get("address") || "-"),
    "City: " + (formData.get("city") || "-"),
    "State: " + (formData.get("state") || "-"),
    "Number: " + (formData.get("phone") || "-"),
    "Email Address: " + (formData.get("email") || "-"),
    "Enquiry: " + (formData.get("enquiryMessage") || "-"),
    "",
    "How Did You Hear About Us?: " + heardFrom,
    "Other Source: " + otherSource,
  ].join("\n");

  const whatsappNumber = enquiryForm.dataset.whatsappNumber || "919329517009";
  window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message), "_blank");
});

const pageParams = new URLSearchParams(window.location.search);
const pageStatus = pageParams.get("status");

if (window.location.hash === "#enquiry-form" || pageStatus) {
  setEnquiryFormOpen(true, false);
}

if (pageStatus === "success") {
  alert("Thank you! Your message has been sent.");
} else if (pageStatus === "error") {
  alert("There was a problem sending your message. Please try again.");
}
