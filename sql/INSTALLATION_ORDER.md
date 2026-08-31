# SQL Installation Order — v0.0.1.3

1. 00_extensions.sql
2. 01_schema.sql
3. 02_functions.sql
4. 03_rls.sql
5. 04_tenant_resolution_rls.sql
6. Create the initial administrator in Supabase Authentication.
7. Execute the bootstrap command from 05_bootstrap.sql with the real Auth user UUID.

Expected development tenant:
- Name: GUVEL Development
- Code: GUVELDEV
- Slug: development
- URL: https://development.guvelsystems.com
- Status: active
