# GUVEL General System — v0.0.1.1

## Clean Development Tenant Baseline

Current environment:

`https://development.guvelsystems.com`

## Architecture

One GUVEL product.
One codebase.
One multi-tenant database architecture.

Each environment/company uses:

`<tenant>.guvelsystems.com`

Current:

`development.guvelsystems.com`

Future examples:

`metricsworks.guvelsystems.com`
`magna.guvelsystems.com`

No future customer subdomain is required at this stage.

## Flow

1. Detect hostname.
2. Extract tenant.
3. Resolve `companies.slug`.
4. Check session.
5. Login when necessary.
6. Validate `profiles.company_id`.
7. Load the authorized environment.

## SQL order

1. 00_extensions.sql
2. 01_schema.sql
3. 02_functions.sql
4. 03_rls.sql
5. Create administrator in Supabase Authentication.
6. Run the development bootstrap in 05_bootstrap.sql.

## Security

Never place a Supabase service_role key in frontend JavaScript.

## Architecture documentation

See:

`docs/TENANT_ARCHITECTURE.md`
