# GUVEL General System — CLEAN BASELINE v1.4.8.9

This package is the clean deployment baseline for the stable GUVEL v1.4.8.9 application.

## Deployment

1. Create a NEW Supabase project.
2. Create the first Auth user in Supabase Authentication.
3. Open `supabase/GUVEL_v1.4.8.9_CLEAN_BOOTSTRAP.sql` in Supabase SQL Editor and run it completely.
4. Use the bootstrap section at the bottom of the SQL to create the first GUVEL company/profile for the Auth user.
5. Put the new Supabase URL and Publishable Key into `config.js`.
6. Deploy `index.html`, `config.js`, and the complete `assets/` folder to the new hosting/repository.

## Important

- This is a fresh schema, not a migration chain.
- It does not include legacy migration files.
- It does not include the previous Supabase project credentials.
- It is based on the stable v1.4.8.9 application.
- No v1.5.x functionality is included.
- Existing application logic was not rewritten for this baseline.
