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
