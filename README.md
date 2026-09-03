# GUVEL General System — v0.0.1

Tenant-aware clean baseline for GUVEL General System.

## Architecture rule
Each customer uses a dedicated subdomain:
- metricsworks.guvelsystems.com
- magna.guvelsystems.com

The URL resolves the company context before login. Users never select a company manually.

## Bootstrap
Hostname → tenant slug → company → session → profile/company verification → application.

## SQL order
1. 00_extensions.sql
2. 01_schema.sql
3. 02_functions.sql
4. 03_rls.sql
5. Create the first Auth user
6. Run 05_bootstrap.sql


## v0.0.1.3 — Golden Core Baseline

This release freezes the proven core:
- Custom development subdomain
- Tenant detection
- Active tenant resolution before login
- Supabase authentication
- Profile/company validation
- Authorized portal shell
- Logout

The previously manual tenant-resolution RLS policy is now included in:
`sql/04_tenant_resolution_rls.sql`


## v0.0.2.0 — User Management Foundation

This release establishes the Phase 2 architecture:

- Official roles: Administrator, Manager, Supervisor, Guest
- User lifecycle: invited, active, inactive
- RBAC helper functions
- User-management indexes
- Administrator vs Manager responsibility boundary
- Security rule: UI is not authorization

Run the new migration:

`sql/05_user_management_foundation.sql`

Read before implementing the next UI version:

- `docs/ROLE_PERMISSION_MATRIX.md`
- `docs/USER_MANAGEMENT_ARCHITECTURE.md`
- `docs/PHASE_2_ROADMAP.md`


## v0.0.2.1 — Users Administration

Adds the first functional Users module.

New application files:
- `js/services/users.service.js`
- `js/modules/users/users.module.js`

New SQL:
- `sql/06_users_administration_read_model.sql`
- `sql/06a_users_administration_validation.sql`

This release is READ-FIRST and does not yet create, invite, edit, activate,
deactivate or delete users.


## v0.0.2.2 — Controlled User Actions

Adds controlled role and status actions to the Users module.

New SQL:
- `sql/07_user_actions.sql`
- `sql/07a_user_actions_validation.sql`

Supported:
- Change role within permitted role hierarchy.
- Activate user.
- Deactivate user.

Database authorization is authoritative.


## v0.0.2.3 — User Invitation & Creation

Adds controlled user invitations.

New database SQL:
- `sql/08_user_invitation_lifecycle.sql`
- `sql/08a_user_invitation_validation.sql`

New server-side component:
- `supabase/functions/invite-company-user/index.ts`

Important: deployment of the Edge Function is required before the Invite User
button can successfully create users.


## v0.0.2.8 CORRECTED
Rebuilt archive after download failure. Production Capture includes explicit load/save error handling and uses the installed `production_records` schema.
