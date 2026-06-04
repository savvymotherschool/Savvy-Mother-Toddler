document.getElementById("year").textContent = new Date().getFullYear();

function searchSite() {
  const value = document.querySelector(".search-box input")?.value || "";
  if (value.trim()) alert("Searching for: " + value);
}

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

function setMobileMenuOpen(isOpen) {
  navMenu?.classList.toggle("open", isOpen);
  menuToggle?.classList.toggle("active", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
}

menuToggle?.setAttribute("aria-expanded", "false");
menuToggle?.setAttribute("aria-controls", "navMenu");

menuToggle?.addEventListener("click", () => {
  setMobileMenuOpen(!navMenu?.classList.contains("open"));
});

navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMobileMenuOpen(false);
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

enquiryForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!enquiryForm.checkValidity()) {
    enquiryForm.reportValidity();
    return;
  }

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

  if (window.SavvyStaticForms) {
    window.SavvyStaticForms.submitForm(enquiryForm, {
      formData,
      message,
      subject: "New enquiry form: " + (formData.get("classAppliedFor") || "School enquiry"),
      whatsappNumber,
      successMessage: "Thank you! Your enquiry has been submitted.",
      fallbackMessage: "Your enquiry is ready in WhatsApp. Please tap send there so the school receives it.",
    });
    return;
  }

  window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message), "_blank", "noopener");
});

const admissionForm = document.getElementById("admissionForm");

function getFormText(formData, name) {
  return String(formData.get(name) || "").trim() || "-";
}

function getChildFullName(formData) {
  return [
    getFormText(formData, "childFirstName"),
    getFormText(formData, "childMiddleName"),
    getFormText(formData, "childLastName"),
  ].filter((part) => part !== "-").join(" ") || "-";
}

function getSiblingLines(formData) {
  const siblings = [1, 2, 3].map((index) => {
    const name = getFormText(formData, "siblingName" + index);
    const age = getFormText(formData, "siblingAge" + index);
    const className = getFormText(formData, "siblingClass" + index);
    const institution = getFormText(formData, "siblingInstitution" + index);

    if ([name, age, className, institution].every((value) => value === "-")) {
      return "";
    }

    return index + ". " + name + " | Age: " + age + " | Class: " + className + " | Institution: " + institution;
  }).filter(Boolean);

  return siblings.length ? siblings : ["-"];
}

function getUploadedPhotoLabels(form) {
  return [
    ["childPhoto", "Child Photo"],
    ["fatherPhoto", "Father Photo"],
    ["motherPhoto", "Mother Photo"],
  ].filter(([fieldName]) => form.elements[fieldName]?.files?.length).map(([, label]) => label).join(", ") || "-";
}

function buildAdmissionWhatsAppMessage(form, formData) {
  const documents = formData.getAll("documents[]").filter(Boolean).join(", ") || "-";
  const uploadedPhotos = getUploadedPhotoLabels(form);

  return [
    "New Admission Form",
    "",
    "Child Information",
    "Child Name: " + getChildFullName(formData),
    "Date of Birth: " + getFormText(formData, "childDob"),
    "Date of Birth in Words: " + getFormText(formData, "dobWords"),
    "Gender: " + getFormText(formData, "childGender"),
    "Religion: " + getFormText(formData, "religion"),
    "Nationality: " + getFormText(formData, "nationality"),
    "Child ID: " + getFormText(formData, "childId"),
    "Birth Certificate No.: " + getFormText(formData, "birthCertificateNo"),
    "Samagra ID: " + getFormText(formData, "samagraId"),
    "Aadhaar No.: " + getFormText(formData, "childAadhaar"),
    "Bank Passbook Account No.: " + getFormText(formData, "childBankPassbook"),
    "Bank IFSC Code: " + getFormText(formData, "childBankIfsc"),
    "",
    "Medical Information",
    "Blood Group: " + getFormText(formData, "bloodGroup"),
    "Allergies: " + getFormText(formData, "allergies"),
    "Chronic Ailment: " + getFormText(formData, "chronicAilment"),
    "Physical Disability: " + getFormText(formData, "physicalDisability"),
    "Surgery Undergone: " + getFormText(formData, "surgeryUndergone"),
    "Specific Instruction: " + getFormText(formData, "specificInstruction"),
    "",
    "Contact Information",
    "Temporary Address: " + getFormText(formData, "temporaryAddress"),
    "Permanent Address: " + getFormText(formData, "permanentAddress"),
    "Telephone No.: " + getFormText(formData, "residencePhone"),
    "Father Contact No.: " + getFormText(formData, "fatherContact"),
    "Mother Contact No.: " + getFormText(formData, "motherContact"),
    "Guardian Contact No.: " + getFormText(formData, "guardianContact"),
    "",
    "Mother Information",
    "Name: " + getFormText(formData, "motherName"),
    "Age: " + getFormText(formData, "motherAge"),
    "Blood Group: " + getFormText(formData, "motherBloodGroup"),
    "Educational Qualification: " + getFormText(formData, "motherQualification"),
    "Occupation: " + getFormText(formData, "motherOccupation"),
    "Designation: " + getFormText(formData, "motherDesignation"),
    "Organisation: " + getFormText(formData, "motherOrganisation"),
    "Office Address: " + getFormText(formData, "motherOfficeAddress"),
    "Tel: " + getFormText(formData, "motherTel"),
    "E-mail: " + getFormText(formData, "motherEmail"),
    "Mobile: " + getFormText(formData, "motherMobile"),
    "Aadhaar No.: " + getFormText(formData, "motherAadhaar"),
    "Bank Passbook Account No.: " + getFormText(formData, "motherBankPassbook"),
    "Bank IFSC Code: " + getFormText(formData, "motherBankIfsc"),
    "",
    "Father Information",
    "Name: " + getFormText(formData, "fatherName"),
    "Age: " + getFormText(formData, "fatherAge"),
    "Blood Group: " + getFormText(formData, "fatherBloodGroup"),
    "Educational Qualification: " + getFormText(formData, "fatherQualification"),
    "Occupation: " + getFormText(formData, "fatherOccupation"),
    "Designation: " + getFormText(formData, "fatherDesignation"),
    "Organisation: " + getFormText(formData, "fatherOrganisation"),
    "Office Address: " + getFormText(formData, "fatherOfficeAddress"),
    "Tel: " + getFormText(formData, "fatherTel"),
    "E-mail: " + getFormText(formData, "fatherEmail"),
    "Mobile: " + getFormText(formData, "fatherMobile"),
    "Aadhaar No.: " + getFormText(formData, "fatherAadhaar"),
    "Bank Passbook Account No.: " + getFormText(formData, "fatherBankPassbook"),
    "Bank IFSC Code: " + getFormText(formData, "fatherBankIfsc"),
    "",
    "Emergency",
    "Name: " + getFormText(formData, "emergencyName"),
    "Contact No.: " + getFormText(formData, "emergencyPhone"),
    "",
    "Brothers / Sisters",
    ...getSiblingLines(formData),
    "",
    "Undertaking",
    "Parent / Guardian Name: " + getFormText(formData, "parentGuardianName"),
    "Date: " + getFormText(formData, "undertakingDate"),
    "Accepted: " + getFormText(formData, "undertakingAccepted"),
    "",
    "Office Submission Note: Please submit this form at the school office with the admission form fee.",
    "",
    "Documents Attached: " + documents,
    "Photo Uploads Attached by Email: " + uploadedPhotos,
    "",
    "Office Details",
    "Academic Session: " + getFormText(formData, "academicSession"),
    "Admission No.: " + getFormText(formData, "admissionNo"),
    "Registration No.: " + getFormText(formData, "registrationNo"),
    "Date of Admission: " + getFormText(formData, "dateOfAdmission"),
    "Admitted to Class: " + getFormText(formData, "admittedClass"),
    "Admission Incharge: " + getFormText(formData, "admissionIncharge"),
    "Centre Head: " + getFormText(formData, "centreHead"),
  ].join("\n");
}

function getAdmissionCopyFileName(formData) {
  const childName = getChildFullName(formData).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = childName || "admission-form";
  return "savvy-mother-toddler-" + suffix + ".txt";
}

function downloadAdmissionCopy(form) {
  const formData = new FormData(form);
  const content = buildAdmissionWhatsAppMessage(form, formData);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = getAdmissionCopyFileName(formData);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.getElementById("downloadAdmissionCopy")?.addEventListener("click", () => {
  if (!admissionForm.checkValidity()) {
    admissionForm.reportValidity();
    return;
  }

  downloadAdmissionCopy(admissionForm);
});

admissionForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!admissionForm.checkValidity()) {
    admissionForm.reportValidity();
    return;
  }

  const formData = new FormData(admissionForm);
  const message = buildAdmissionWhatsAppMessage(admissionForm, formData);
  const whatsappNumber = admissionForm.dataset.whatsappNumber || "919329517009";

  downloadAdmissionCopy(admissionForm);

  if (window.SavvyStaticForms) {
    window.SavvyStaticForms.submitForm(admissionForm, {
      formData,
      message,
      subject: "New admission form: " + getChildFullName(formData),
      whatsappNumber,
      resetOnSuccess: false,
      successMessage: "Thank you! Your admission form has been submitted. Please submit the downloaded copy at the school office with the admission form fee.",
      fallbackMessage: "The filled copy has downloaded and your admission message is ready in WhatsApp. Please tap send there so the school receives it.",
    });
    return;
  }

  window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message), "_blank", "noopener");
});

const pageParams = new URLSearchParams(window.location.search);
const pageStatus = pageParams.get("status");

if (window.location.hash === "#enquiry-form" || pageStatus) {
  setEnquiryFormOpen(true, false);
}

if (pageStatus === "success") {
  alert(admissionForm ? "Thank you! Your admission form has been submitted. Please submit the downloaded form at the school office with the admission form fee." : "Thank you! Your message has been sent.");
} else if (pageStatus === "error") {
  alert(admissionForm ? "There was a problem submitting the admission form. Please try again or contact the school office." : "There was a problem sending your message. Please try again.");
}
