# GUVEL General System — Golden Core Baseline v0.0.1.3

## Verified end-to-end flow

1. development.guvelsystems.com opens.
2. Tenant slug `development` is detected.
3. The active tenant is resolved before login.
4. The login screen is displayed.
5. The user authenticates through Supabase.
6. The user profile and company relationship are validated.
7. The authorized portal shell loads.
8. Logout terminates the session.

## Critical architecture rule

Tenant resolution occurs before authentication, so the database needs a
controlled anonymous SELECT policy for active tenants.

That policy is included in:

`sql/04_tenant_resolution_rls.sql`

## Change-control rules

- Do not rename exported core functions without updating every importer.
- Do not mix authentication changes with unrelated UI changes.
- Record every required database migration inside the release package.
- Validate tenant resolution and login independently.
- Freeze verified versions before starting a new development phase.

## Next phase

Phase 2 — User Management and Administration.
