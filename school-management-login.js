(function () {
  const loginUrl = window.SCHOOL_MANAGEMENT_LOGIN_URL || "";
  const parentDropdown = document.querySelector(".nav-student-dropdown") || document.querySelector(".nav-parent-dropdown");

  if (!loginUrl) return;

  const style = document.createElement("style");
  style.textContent = `
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
})();
