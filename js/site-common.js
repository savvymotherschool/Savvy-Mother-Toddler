// Shared site interactions used by static GitHub Pages pages.
(function () {
  const schoolEmail = "savvymotherschool@gmail.com";
  const defaultWhatsAppNumber = "919329517009";

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

  async function postToExternalEndpoint(form, formData) {
    const endpoint = form.dataset.endpoint || window.SAVVY_FORM_ENDPOINT || "";

    if (!endpoint) {
      return false;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
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
      if (await postToExternalEndpoint(form, formData)) {
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

  window.SavvyStaticForms = {
    submitForm,
    buildContactMessage,
    buildGenericMessage,
    openWhatsApp,
  };

  window.searchSite = searchSite;

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

    bindContactForm();
  });
})();
