# v0.0.2.1 Installation Order

For an existing v0.0.2.0 VALIDATED environment:

1. Do NOT rerun the full historical installation.
2. Execute:
   `06_users_administration_read_model.sql`
3. Execute:
   `06a_users_administration_validation.sql`
4. Deploy the application files.
5. Clear browser cache or perform a hard refresh.
6. Sign in as Administrator.
7. Open Users.

Expected result:
- The Users module loads.
- Existing company users appear.
- Search and filters work.

If the email column was newly added, the migration attempts to backfill existing
profile emails from `auth.users`.
