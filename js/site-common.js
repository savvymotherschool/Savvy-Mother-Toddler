// Shared site interactions used by static GitHub Pages pages.
(function () {
  const schoolEmail = "savvymotherschool@gmail.com";
  const defaultWhatsAppNumber = "919329517009";
  const defaultFormEndpoint = "https://savvy-school-management-backend.onrender.com/api/website-leads";
  const schoolAddressShort = "Near Railway Bridge, Baisa Road, Silpara, Rewa";
  const schoolHoursLabel = "Mon-Sat: 9:30 AM - 5:00 PM";
  const schoolHoursDateTime = "Mo-Sa 09:30-17:00";
  const contentStorageKey = "savvySiteContent";
  const defaultSiteContent = {
    programs: {
      dayCare: {
        name: "Day Care",
        audience: "Specially for working parents (Job Holders).",
        location: "Rewa, Madhya Pradesh - 486001",
        ageGroup: "2 years to 15 years",
        timings: "9:30 AM - 5:00 PM",
        fee: "\u20b910,000",
        description: "Full-day care in a home-like setting with supervised rest, routines and caring support for working families.",
        address: [
          "Approximately 3 km from the city",
          "Ward No. 45, Kuthulia",
          "Near Veterinary College",
        ],
        facilities: [
          "Air Conditioned Rooms",
          "Cozy Beds",
          "RO Drinking Water",
          "Refrigerator",
          "Oven",
          "Home-like Atmosphere",
          "Qualified Mother Teachers",
          "Well Qualified Women Caretakers",
        ],
      },
      prePlayDayCare: {
        name: "Pre-Play + Day Care",
        ageGroup: "2+ Years",
        timings: "9:30 AM - 5:00 PM",
        fee: "\u20b940,000",
        description: "Full Day Care with Learning Activities and Facilities.",
      },
      playGroup: {
        name: "Play Group",
        ageGroup: "2\u00bd years to 3\u00bd years",
        timings: "9:30 AM - 5:00 PM",
        fee: "\u20b940,000",
        description: "Play-based readiness with joyful learning, language building and social confidence.",
      },
      nursery: {
        name: "Nursery",
        fee: "\u20b940,000",
      },
      juniorKg: {
        name: "Junior KG",
        fee: "\u20b940,000",
      },
      seniorKg: {
        name: "Senior KG (UKG)",
        fee: "\u20b940,000",
      },
      afterSchoolSupport: {
        name: "After School Support",
        fee: "\u20b910,000 per year",
        description: "Rest Room, Food Facility and Air Conditioned Rooms for children who stay back after school.",
        facilities: [
          "Rest Room",
          "Food Facility",
          "Air Conditioned Rooms",
        ],
      },
    },
  };

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function deepMerge(base, override) {
    if (Array.isArray(base)) {
      return Array.isArray(override) ? override.slice() : base.slice();
    }

    if (!isPlainObject(base)) {
      return override === undefined ? base : override;
    }

    const result = {};
    const keys = new Set(Object.keys(base).concat(Object.keys(override || {})));

    keys.forEach((key) => {
      const baseValue = base[key];
      const overrideValue = override ? override[key] : undefined;

      if (overrideValue === undefined) {
        result[key] = cloneValue(baseValue);
        return;
      }

      if (isPlainObject(baseValue) || Array.isArray(baseValue)) {
        result[key] = deepMerge(baseValue, overrideValue);
        return;
      }

      result[key] = overrideValue;
    });

    return result;
  }

  function readStoredContent() {
    try {
      const raw = window.localStorage?.getItem(contentStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn("Unable to read stored site content.", error);
      return {};
    }
  }

  function writeStoredContent(content) {
    try {
      window.localStorage?.setItem(contentStorageKey, JSON.stringify(content));
    } catch (error) {
      console.warn("Unable to store site content.", error);
    }
  }

  let siteContent = deepMerge(
    defaultSiteContent,
    deepMerge(window.SAVVY_SITE_CONTENT || {}, readStoredContent())
  );

  function searchSite() {
    const value = document.querySelector(".search-box input")?.value || "";
    if (value.trim()) {
      alert("Searching for: " + value);
    }
  }

  function textValue(formData, name, fallback = "-") {
    const value = String(formData.get(name) || "").trim();
    return value || fallback;
  }

  function cleanWhatsAppNumber(value) {
    return String(value || defaultWhatsAppNumber).replace(/\D/g, "") || defaultWhatsAppNumber;
  }

  function openWhatsApp(number, message) {
    const url = "https://wa.me/" + cleanWhatsAppNumber(number) + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  }

  function buildContactMessage(formData) {
    return [
      "New Contact Form",
      "",
      "Parent Name: " + textValue(formData, "parentName"),
      "Child Name: " + textValue(formData, "childName"),
      "Phone: " + textValue(formData, "phone"),
      "Email: " + textValue(formData, "email"),
      "Regarding: " + textValue(formData, "subject", "Contact form query"),
      "",
      "Message:",
      textValue(formData, "message"),
    ].join("\n");
  }

  function buildGenericMessage(form, formData) {
    const title = form.dataset.formTitle || "New Website Form";
    const lines = [title, ""];

    formData.forEach((value, key) => {
      if (value instanceof File) {
        if (value.name) {
          lines.push(key + ": " + value.name);
        }
        return;
      }

      const text = String(value || "").trim();
      if (text) {
        lines.push(key + ": " + text);
      }
    });

    return lines.join("\n");
  }

  function isFileValue(value) {
    return typeof File !== "undefined" && value instanceof File;
  }

  function payloadValue(value) {
    if (isFileValue(value)) {
      return value.name || "";
    }
    return String(value || "").trim();
  }

  function collectPayloadFields(formData) {
    const payload = {};

    formData.forEach((value, key) => {
      const text = payloadValue(value);
      if (!text) return;

      const cleanKey = key.endsWith("[]") ? key.slice(0, -2) : key;
      if (payload[cleanKey] === undefined) {
        payload[cleanKey] = text;
      } else if (Array.isArray(payload[cleanKey])) {
        payload[cleanKey].push(text);
      } else {
        payload[cleanKey] = [payload[cleanKey], text];
      }
    });

    return payload;
  }

  function firstText(formData, names) {
    for (const name of names) {
      const value = String(formData.get(name) || "").trim();
      if (value) return value;
    }
    return "";
  }

  function childFullName(formData) {
    const direct = firstText(formData, ["childName"]);
    if (direct) return direct;

    return ["childFirstName", "childMiddleName", "childLastName"]
      .map((name) => String(formData.get(name) || "").trim())
      .filter(Boolean)
      .join(" ");
  }

  function buildLeadPayload(form, formData, message, subject) {
    const payload = collectPayloadFields(formData);
    const formType = String(formData.get("formType") || form.dataset.staticForm || "contact").trim().toLowerCase();

    return {
      source: "savvy-mother-toddler",
      formType,
      childName: childFullName(formData),
      parentName: firstText(formData, ["parentName", "parentGuardianName", "fatherName", "motherName"]),
      className: firstText(formData, ["className", "admittedClass", "classAppliedFor"]),
      phone: firstText(formData, ["phone", "fatherContact", "motherContact", "guardianContact", "fatherMobile", "motherMobile"]),
      email: firstText(formData, ["email", "motherEmail", "fatherEmail"]),
      subject,
      message,
      priority: formType === "admission" ? "high" : "medium",
      payload,
    };
  }

  async function postToExternalEndpoint(form, formData, message, subject) {
    const endpoint = form.dataset.endpoint || window.SAVVY_FORM_ENDPOINT || defaultFormEndpoint;

    if (!endpoint) {
      return false;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildLeadPayload(form, formData, message, subject)),
    });

    return response.ok;
  }

  async function submitForm(form, options = {}) {
    const formData = options.formData || new FormData(form);
    const message = options.message || buildGenericMessage(form, formData);
    const subject = options.subject || form.dataset.subject || "Savvy Mother Toddler School website form";
    const whatsappNumber = options.whatsappNumber || form.dataset.whatsappNumber || defaultWhatsAppNumber;
    const successMessage = options.successMessage || "Thank you! Your details have been submitted.";
    const fallbackMessage = options.fallbackMessage || "Your message is ready in WhatsApp. Please tap send there to share it with the school.";

    try {
      if (await postToExternalEndpoint(form, formData, message, subject)) {
        alert(successMessage);
        if (options.resetOnSuccess !== false) {
          form.reset();
        }
        return true;
      }
    } catch (error) {
      console.warn("External form endpoint failed; opening WhatsApp fallback.", error);
    }

    openWhatsApp(whatsappNumber, message);

    if (options.includeMailtoFallback) {
      const mailto = "mailto:" + schoolEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
      window.setTimeout(() => {
        window.location.href = mailto;
      }, 500);
    }

    alert(fallbackMessage);
    return false;
  }

  function bindContactForm() {
    const contactForm = document.querySelector('form[data-static-form="contact"]');

    contactForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      const message = buildContactMessage(formData);

      submitForm(contactForm, {
        formData,
        message,
        subject: "New enquiry from website: " + textValue(formData, "subject", "Contact form query"),
        successMessage: "Thank you! Your message has been sent.",
        fallbackMessage: "Your message is ready in WhatsApp. Please tap send there so the school receives it.",
      });
    });
  }

  function injectHeaderInfoBar() {
    document.querySelectorAll(".navbar-wrapper").forEach((wrapper) => {
      if (wrapper.querySelector(".top-bar")) {
        return;
      }

      const infoBar = document.createElement("div");
      infoBar.className = "top-bar";
      infoBar.setAttribute("role", "note");
      infoBar.setAttribute("aria-label", "School address and opening hours");
      infoBar.innerHTML = [
        '<a class="top-bar-link" href="contact.html">',
        '<span class="top-bar-label">Address:</span>',
        '<address class="top-bar-address">', schoolAddressShort, "</address>",
        "</a>",
        '<span class="top-bar-separator" aria-hidden="true">|</span>',
        '<span class="top-bar-hours-wrap">',
        '<span class="top-bar-label">Hours:</span>',
        '<time class="top-bar-hours" datetime="', schoolHoursDateTime, '">', schoolHoursLabel, "</time>",
        "</span>",
      ].join("");

      wrapper.insertBefore(infoBar, wrapper.firstChild);
    });
  }

  function getProgramCardsByHeading(headings) {
    return headings.reduce((map, heading) => {
      const title = Array.from(document.querySelectorAll(".info-card h2")).find((node) => node.textContent.trim() === heading);
      if (title) {
        map[heading] = title.closest(".info-card");
      }
      return map;
    }, {});
  }

  function setCardCopy(card, title, bodyHtml) {
    if (!card) return;
    const heading = card.querySelector("h2");
    const body = card.querySelector("p");
    if (heading) heading.textContent = title;
    if (body) body.innerHTML = bodyHtml;
  }

  function renderProgramSelect(select) {
    if (!select) return;

    const options = [
      siteContent.programs.dayCare.name,
      siteContent.programs.prePlayDayCare.name,
      siteContent.programs.playGroup.name,
      siteContent.programs.nursery.name,
      siteContent.programs.juniorKg.name,
      siteContent.programs.seniorKg.name,
      siteContent.programs.afterSchoolSupport.name,
    ];

    const placeholder = select.querySelector('option[value=""]');
    const currentValue = select.value;
    select.innerHTML = "";

    if (placeholder) {
      select.appendChild(placeholder);
    } else {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "Choose class";
      select.appendChild(emptyOption);
    }

    options.forEach((label) => {
      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      select.appendChild(option);
    });

    if (options.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  function setSimpleList(card, title, items) {
    if (!card) return;
    const heading = card.querySelector("h2, h3");
    const list = card.querySelector(".simple-list");
    if (heading) heading.textContent = title;
    if (list) {
      list.innerHTML = items.map((item) => "<li>" + item + "</li>").join("");
    }
  }

  function programLine(label, value) {
    return "<strong>" + label + ":</strong> " + value;
  }

  function renderProgramsPage() {
    const hero = document.querySelector(".hero-panel");
    const wideCards = document.querySelectorAll(".content-wrap > .wide-card");
    const cards = getProgramCardsByHeading(["Day Care", "Pre Play", "Play Group", "After-School Support"]);
    const dayCare = siteContent.programs.dayCare;
    const prePlayDayCare = siteContent.programs.prePlayDayCare;
    const playGroup = siteContent.programs.playGroup;
    const afterSchoolSupport = siteContent.programs.afterSchoolSupport;

    if (hero) {
      const heroText = hero.querySelector("p");
      if (heroText) {
        heroText.textContent = "Updated program information for working parents, preschool readiness and after-school care in Rewa.";
      }
    }

    setCardCopy(
      cards["Day Care"],
      dayCare.name,
      [
        dayCare.audience,
        programLine("Age Group", dayCare.ageGroup),
        programLine("Timings", dayCare.timings),
        programLine("Fee", dayCare.fee),
        dayCare.location,
      ].join("<br>")
    );
    setCardCopy(
      cards["Pre Play"],
      prePlayDayCare.name,
      [
        prePlayDayCare.description,
        programLine("Age Group", prePlayDayCare.ageGroup),
        programLine("Timings", prePlayDayCare.timings),
        programLine("Total Fee", prePlayDayCare.fee),
      ].join("<br>")
    );
    setCardCopy(
      cards["Play Group"],
      playGroup.name,
      [
        playGroup.description,
        programLine("Age Group", playGroup.ageGroup),
        programLine("Timings", playGroup.timings),
      ].join("<br>")
    );
    setCardCopy(
      cards["After-School Support"],
      afterSchoolSupport.name,
      [
        afterSchoolSupport.description,
        programLine("Fee", afterSchoolSupport.fee),
      ].join("<br>")
    );

    setSimpleList(wideCards[0], "Day Care Quick Details", [
      programLine("Location", dayCare.location),
      programLine("For", dayCare.audience),
      programLine("Address", dayCare.address.join(", ")),
      programLine("Facilities", dayCare.facilities.join(", ")),
    ]);

    setSimpleList(wideCards[1], "Program Highlights", [
      programLine(prePlayDayCare.name, prePlayDayCare.description + " Age group " + prePlayDayCare.ageGroup + "."),
      programLine(playGroup.name, "Age group " + playGroup.ageGroup + " with timings " + playGroup.timings + "."),
      programLine(afterSchoolSupport.name, afterSchoolSupport.facilities.join(", ") + "."),
      "Nursery to primary classes continue with activity-based learning and classroom readiness support.",
    ]);
  }

  function renderHomePage() {
    const heading = document.getElementById("localProgramsTitle");
    const intro = heading?.parentElement?.querySelector("p");
    const stats = Array.from(document.querySelectorAll(".choice-stats .choice-stat"));
    const dayCare = siteContent.programs.dayCare;
    const prePlayDayCare = siteContent.programs.prePlayDayCare;
    const playGroup = siteContent.programs.playGroup;
    const afterSchoolSupport = siteContent.programs.afterSchoolSupport;

    if (heading) {
      heading.textContent = "Day Care, Pre-Play + Day Care and Play Group in Rewa";
    }

    if (intro) {
      intro.textContent = "Savvy Mother Toddler School supports working parents in Rewa with updated day care, pre-play and after-school care details, age-appropriate learning and a caring home-like atmosphere.";
    }

    [
      [dayCare.name, "Age " + dayCare.ageGroup + " | " + dayCare.timings],
      [prePlayDayCare.name, prePlayDayCare.description],
      [playGroup.name, "Age " + playGroup.ageGroup + " | " + playGroup.timings],
      [afterSchoolSupport.name, afterSchoolSupport.fee],
    ].forEach((item, index) => {
      const stat = stats[index];
      if (!stat) return;
      const title = stat.querySelector("strong");
      const copy = stat.querySelector("span");
      if (title) title.textContent = item[0];
      if (copy) copy.textContent = item[1];
    });
  }

  function renderFeesPage() {
    const earlyYearsTable = Array.from(document.querySelectorAll(".wide-card")).find((card) => {
      return card.querySelector("h2")?.textContent.trim() === "Bella Mente Annual Fee";
    });
    const extraChargesCard = Array.from(document.querySelectorAll(".wide-card")).find((card) => {
      return card.querySelector("h2")?.textContent.trim() === "Additional School Charges";
    });
    const noteCards = Array.from(document.querySelectorAll(".wide-card.notice"));
    const dayCare = siteContent.programs.dayCare;
    const prePlayDayCare = siteContent.programs.prePlayDayCare;
    const playGroup = siteContent.programs.playGroup;
    const afterSchoolSupport = siteContent.programs.afterSchoolSupport;

    if (extraChargesCard) {
      const items = extraChargesCard.querySelectorAll(".fee-item");
      if (items[1]) {
        items[1].querySelector(".fee-label").textContent = "Day Care Fee";
        items[1].querySelector(".fee-amount").textContent = dayCare.fee;
        items[1].querySelector(".fee-detail").textContent = "Updated annual fee for the dedicated day care program.";
      }
      if (items[2]) {
        items[2].querySelector(".fee-label").textContent = "After School Support";
        items[2].querySelector(".fee-amount").textContent = afterSchoolSupport.fee;
        items[2].querySelector(".fee-detail").textContent = afterSchoolSupport.facilities.join(", ") + ".";
      }
    }

    if (earlyYearsTable) {
      const intro = earlyYearsTable.querySelector(".fee-intro");
      const tbody = earlyYearsTable.querySelector("tbody");
      if (intro) {
        intro.textContent = "Applicable from Day Care to Senior KG (UKG), including Pre-Play + Day Care and After School Support.";
      }
      if (tbody) {
        tbody.innerHTML = [
          ["Day Care", dayCare.fee],
          [prePlayDayCare.name, prePlayDayCare.fee],
          [playGroup.name, playGroup.fee],
          ["Nursery", siteContent.programs.nursery.fee],
          ["Junior KG", siteContent.programs.juniorKg.fee],
          [siteContent.programs.seniorKg.name, siteContent.programs.seniorKg.fee],
          [afterSchoolSupport.name, afterSchoolSupport.fee],
        ].map((row) => {
          return "<tr><td>Bella Mente</td><td>" + row[0] + "</td><td>" + row[1] + "</td></tr>";
        }).join("");
      }
    }

    if (noteCards[1]) {
      noteCards[1].querySelector("p").textContent = "Please contact the school office before payment to confirm the final program fee, updated timings, age group and included facilities.";
    }
  }

  function renderAdmissionsAndDownloads() {
    renderProgramSelect(document.getElementById("admittedClass"));
    renderProgramSelect(document.getElementById("classAppliedFor"));
  }

  function renderCurriculumPage() {
    const rows = document.querySelectorAll(".fee-table tbody tr");
    const dayCare = siteContent.programs.dayCare;
    const prePlayDayCare = siteContent.programs.prePlayDayCare;
    const playGroup = siteContent.programs.playGroup;

    if (rows[0]) {
      const cells = rows[0].querySelectorAll("td");
      if (cells[0]) cells[0].textContent = dayCare.name + " / " + prePlayDayCare.name;
      if (cells[1]) cells[1].textContent = "Full day care, sensory play, guided learning activities and secure rest routines for working parents.";
      if (cells[2]) cells[2].textContent = "Settling, confidence, sharing, self-help habits and a joyful transition into learning.";
    }

    if (rows[1]) {
      const cells = rows[1].querySelectorAll("td");
      if (cells[0]) cells[0].textContent = playGroup.name;
    }
  }

  function renderFacilitiesPage() {
    const dayCare = siteContent.programs.dayCare;
    const facilityTitle = Array.from(document.querySelectorAll(".facility-card h3")).find((node) => node.textContent.trim() === "Day Care");
    if (facilityTitle) {
      const text = facilityTitle.parentElement.querySelector(".facility-text");
      if (text) {
        text.innerHTML = [
          dayCare.audience,
          programLine("Age Group", dayCare.ageGroup),
          programLine("Timings", dayCare.timings),
          programLine("Fee", dayCare.fee),
          dayCare.address.join(", "),
        ].join("<br>");
      }
    }
  }

  function renderAdmissionsOpenPanels() {
    const dayCare = siteContent.programs.dayCare;
    const prePlayDayCare = siteContent.programs.prePlayDayCare;
    const playGroup = siteContent.programs.playGroup;
    const afterSchoolSupport = siteContent.programs.afterSchoolSupport;

    Array.from(document.querySelectorAll(".offer-side-panel")).forEach((panel) => {
      const title = panel.querySelector("h3")?.textContent.trim();
      if (title !== "Admissions Open") return;

      panel.querySelectorAll(".offer-marquee-track ul").forEach((list) => {
        list.innerHTML = [
          "<li><strong>" + dayCare.name + "</strong><span>" + dayCare.audience + " Age group " + dayCare.ageGroup + ".</span></li>",
          "<li><strong>" + prePlayDayCare.name + "</strong><span>" + prePlayDayCare.description + "</span></li>",
          "<li><strong>" + playGroup.name + "</strong><span>Timings " + playGroup.timings + ".</span></li>",
          "<li><strong>" + afterSchoolSupport.name + "</strong><span>" + afterSchoolSupport.fee + " with " + afterSchoolSupport.facilities.join(", ") + ".</span></li>",
          "<li><strong>Day Care Address</strong><span>" + dayCare.address.join(", ") + ".</span></li>",
        ].join("");
      });
    });
  }

  function applySharedProgramContent() {
    const path = window.location.pathname;

    renderAdmissionsAndDownloads();
    renderAdmissionsOpenPanels();

    if (path.endsWith("/index.html") || path.endsWith("/Savvy-Mother-Toddler/") || /\/Savvy-Mother-Toddler\/?$/.test(path)) {
      renderHomePage();
    }

    if (path.endsWith("/programs.html")) {
      renderProgramsPage();
    }

    if (path.endsWith("/fees.html")) {
      renderFeesPage();
    }

    if (path.endsWith("/curriculum.html")) {
      renderCurriculumPage();
    }

    if (path.endsWith("/facilities.html")) {
      renderFacilitiesPage();
    }
  }

  window.SavvyStaticForms = {
    submitForm,
    buildContactMessage,
    buildGenericMessage,
    openWhatsApp,
  };

  window.SavvySiteContent = {
    getContent() {
      return cloneValue(siteContent);
    },
    setContent(nextContent, options = {}) {
      siteContent = deepMerge(defaultSiteContent, nextContent || {});
      if (options.persist !== false) {
        writeStoredContent(siteContent);
      }
      applySharedProgramContent();
      return cloneValue(siteContent);
    },
    clearStoredContent() {
      try {
        window.localStorage?.removeItem(contentStorageKey);
      } catch (error) {
        console.warn("Unable to clear stored site content.", error);
      }
      siteContent = deepMerge(defaultSiteContent, window.SAVVY_SITE_CONTENT || {});
      applySharedProgramContent();
      return cloneValue(siteContent);
    },
  };

  window.searchSite = searchSite;

  document.addEventListener("DOMContentLoaded", () => {
    injectHeaderInfoBar();
    applySharedProgramContent();

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

    bindContactForm();
  });
})();
