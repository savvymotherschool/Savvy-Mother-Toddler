# School Management Integration

This site is prepared for GitHub Pages, so the public website must stay static. GitHub Pages serves HTML, CSS, JavaScript and assets, but it does not execute PHP or other server-side code.

## Forms

The contact, enquiry and admission forms now use client-side JavaScript:

- If `window.SAVVY_FORM_ENDPOINT` or a form-level `data-endpoint` is configured, the form will POST to that external endpoint.
- If no endpoint is configured, the form opens a prepared WhatsApp message for the school team.
- The admission form still downloads a filled text copy for office submission.

Example endpoint configuration:

```html
<script>
  window.SAVVY_FORM_ENDPOINT = "https://your-form-endpoint.example/submit";
</script>
```

Use a hosted form service, Google Apps Script web app, or your school management API as that endpoint. The endpoint must accept browser form submissions from `https://savvytoddlerrewa.com`.

## Login Links

The navbar login links are hidden by default on GitHub Pages. To show them, define a public login URL before `school-management-login.js` loads:

```html
<script>
  window.SCHOOL_MANAGEMENT_LOGIN_URL = "https://your-school-management-domain.example/login";
</script>
```
