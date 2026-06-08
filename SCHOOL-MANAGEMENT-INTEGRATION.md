# School Management Integration

This site is prepared for GitHub Pages, so the public website must stay static. GitHub Pages serves HTML, CSS, JavaScript and assets, but it does not execute PHP or other server-side code.

## Forms

The contact, enquiry and admission forms now use client-side JavaScript and work on GitHub Pages:

- By default, the forms POST JSON leads to `https://savvy-school-management-backend.onrender.com/api/website-leads`.
- If `window.SAVVY_FORM_ENDPOINT` or a form-level `data-endpoint` is configured, that endpoint overrides the default.
- If the endpoint is unavailable, the form opens a prepared WhatsApp message for the school team.
- The admission form still downloads a filled text copy for office submission.

Example endpoint configuration:

```html
<script>
  window.SAVVY_FORM_ENDPOINT = "https://savvy-school-management-backend.onrender.com/api/website-leads";
</script>
```

Use a hosted form service, Google Apps Script web app, or your school management API as that endpoint. The endpoint must accept browser form submissions from `https://savvymotherschool.github.io/Savvy-Mother-Toddler/`.

## Login Links

The navbar login links are hidden by default on GitHub Pages. To show them, define a public login URL before `school-management-login.js` loads:

```html
<script>
  window.SCHOOL_MANAGEMENT_LOGIN_URL = "https://your-school-management-domain.example/login";
</script>
```
