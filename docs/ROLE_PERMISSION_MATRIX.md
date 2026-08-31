# GUVEL Role & Permission Matrix — v0.0.2.0

## Official roles

### Administrator — controls the platform
- Full company administration.
- User administration.
- Company/system configuration.
- Resources and master data.
- Create, edit and delete operational data.

### Manager — controls the operation
- Operational administration.
- May add/manage operational users.
- May create, edit and delete operational data.
- May manage shifts and operational resources.
- Cannot control critical platform/company ownership settings.

### Supervisor — captures and monitors
- Capture operational information.
- View dashboards and history.
- Filter data.
- Cannot edit or delete existing records.
- Cannot manage users or configuration.

### Guest — view and analyze
- View dashboards and permitted data.
- Filter.
- View and download history.
- Cannot capture, edit or delete.

## v1 role model

Role-based access control (RBAC) only.

Individual custom permissions are deliberately out of scope for this phase.
They may be added later without changing the four official role names.
