# School Management Integration

Website forms try to save leads to the School Management backend at:

```text
http://localhost:5000/api/website-leads
```

Set `SCHOOL_MANAGEMENT_API_URL` if the backend runs somewhere else, for example:

```text
SCHOOL_MANAGEMENT_API_URL=https://management.example.com/api
```

If the backend is offline, submissions are stored locally in:

```text
website-leads-queue/pending-leads.jsonl
```

That keeps the public website working for contact, enquiry, and admission forms. After the backend is running again, sync queued leads with:

```bash
php sync-school-management-leads.php
```

The navbar login links use `window.SCHOOL_MANAGEMENT_LOGIN_URL` when it is defined. If it is not defined, local development uses:

```text
http://localhost:3000/login
```
