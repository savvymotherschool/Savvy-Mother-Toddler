(function () {
  const loginUrl = window.SCHOOL_MANAGEMENT_LOGIN_URL || "http://localhost:3000/login";
  const homeHero = document.querySelector("#home.hero");
  const parentDropdown = document.querySelector(".nav-parent-dropdown");
  const isHomePage = Boolean(homeHero);

  const style = document.createElement("style");
  style.textContent = `
    .hero {
      position: relative;
    }

    .erp-login-panel {
      position: absolute;
      top: clamp(18px, 3vw, 34px);
      right: clamp(18px, 4vw, 56px);
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      max-width: min(520px, calc(100% - 32px));
    }

    .erp-login-link {
      min-width: 144px;
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.20);
      color: #ffffff;
      background: linear-gradient(135deg, #7145d6, #4a2ca6);
      box-shadow: 0 14px 30px rgba(15,23,42,0.32);
      font-size: 1rem;
      font-weight: 800;
      line-height: 1.1;
      text-align: center;
      text-decoration: none;
      white-space: nowrap;
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    }

    .erp-login-link:hover {
      color: #ffffff;
      transform: translateY(-2px);
      filter: brightness(1.07);
      box-shadow: 0 18px 34px rgba(15,23,42,0.38);
    }

    .erp-login-link:focus-visible {
      outline: 3px solid rgba(255,255,255,0.86);
      outline-offset: 3px;
    }

    @media (max-width: 768px) {
      .erp-login-panel {
        top: auto;
        right: auto;
        left: 50%;
        bottom: 20px;
        width: min(92vw, 420px);
        justify-content: center;
        transform: translateX(-50%);
      }

      .erp-login-link {
        min-width: 0;
        flex: 1 1 0;
        min-height: 44px;
        padding: 0.65rem 0.55rem;
        font-size: 0.86rem;
        white-space: normal;
      }
    }

    @media (max-width: 420px) {
      .erp-login-panel {
        flex-direction: column;
        align-items: stretch;
        width: min(88vw, 320px);
      }
    }

    .erp-nav-login-divider {
      height: 1px;
      margin: 0.35rem 0.2rem;
      background: rgba(91,103,115,0.18);
    }

    .nav-parent-dropdown .erp-nav-login-link {
      display: block;
      margin-top: 0.25rem;
      color: #ffffff;
      background: linear-gradient(135deg, #7145d6, #4a2ca6);
      text-align: center;
      box-shadow: 0 8px 16px rgba(73,39,168,0.18);
    }

    .nav-parent-dropdown .erp-nav-login-link:hover {
      color: #ffffff;
      background: linear-gradient(135deg, #7b50de, #5432b4);
    }
  `;
  document.head.appendChild(style);

  const links = [
    ["Admin/Staff", "Admin and staff login"],
    ["Student/Parents", "Student and parent login"],
  ];

  if (!isHomePage) {
    if (!parentDropdown || parentDropdown.querySelector(".erp-nav-login-link")) return;

    const dividerItem = document.createElement("li");
    const divider = document.createElement("div");
    divider.className = "erp-nav-login-divider";
    dividerItem.appendChild(divider);
    parentDropdown.appendChild(dividerItem);

    links.forEach(([label, ariaLabel]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "erp-nav-login-link";
      link.href = loginUrl;
      link.textContent = label;
      link.setAttribute("aria-label", ariaLabel);
      item.appendChild(link);
      parentDropdown.appendChild(item);
    });
    return;
  }

  if (homeHero.querySelector(".erp-login-panel")) return;

  const panel = document.createElement("div");
  panel.className = "erp-login-panel";

  links.forEach(([label, ariaLabel]) => {
    const link = document.createElement("a");
    link.className = "erp-login-link";
    link.href = loginUrl;
    link.textContent = label;
    link.setAttribute("aria-label", ariaLabel);
    panel.appendChild(link);
  });

  homeHero.appendChild(panel);
})();
