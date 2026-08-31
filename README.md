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
