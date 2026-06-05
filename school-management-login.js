(function () {
  const loginUrl = window.SCHOOL_MANAGEMENT_LOGIN_URL || "https://school-management-nine-mu.vercel.app/login";
  const parentDropdown = document.querySelector(".nav-student-dropdown") || document.querySelector(".nav-parent-dropdown");

  if (!loginUrl) return;

  const style = document.createElement("style");
  style.textContent = `
    .erp-nav-login-divider {
      height: 1px;
      margin: 0.45rem 0.2rem;
      background: rgba(91,103,115,0.18);
    }

    .nav-parent-dropdown .erp-nav-login-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.45rem;
      padding: 0.25rem 0.1rem 0;
    }

    .nav-parent-dropdown .erp-nav-login-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0.68rem 0.78rem;
      border-radius: 7px;
      color: #ffffff;
      background: linear-gradient(135deg, #7145d6, #4a2ca6);
      text-align: center;
      font-size: 0.9rem;
      font-weight: 800;
      line-height: 1.15;
      white-space: normal;
      width: 100%;
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
    ["Student/Parent", "Student and parent login"],
  ];

  if (!parentDropdown || parentDropdown.querySelector(".erp-nav-login-link")) return;

  const dividerItem = document.createElement("li");
  const divider = document.createElement("div");
  divider.className = "erp-nav-login-divider";
  dividerItem.appendChild(divider);
  parentDropdown.appendChild(dividerItem);

  const actionItem = document.createElement("li");
  const actionWrap = document.createElement("div");
  actionWrap.className = "erp-nav-login-actions";

  links.forEach(([label, ariaLabel]) => {
    const link = document.createElement("a");
    link.className = "erp-nav-login-link";
    link.href = loginUrl;
    link.textContent = label;
    link.setAttribute("aria-label", ariaLabel);
    actionWrap.appendChild(link);
  });

  actionItem.appendChild(actionWrap);
  parentDropdown.appendChild(actionItem);
})();
