# GUVEL v0.0.2.3 Installation Order

Prerequisite:
- v0.0.2.2 is validated.

## Step 1 — Database

Execute:

1. `08_user_invitation_lifecycle.sql`
2. `08a_user_invitation_validation.sql`

## Step 2 — Edge Function

Deploy:

`supabase/functions/invite-company-user/index.ts`

Configure the required server-side Service Role secret.

## Step 3 — Supabase Auth URLs

Add:

- `https://development.guvelsystems.com`
- `https://development.guvelsystems.com/**`

Use the appropriate Supabase Authentication URL configuration screen.

## Step 4 — Email

Confirm invitation email delivery before inviting a production user.

## Step 5 — GitHub Pages

Deploy the application files from this release.

## Step 6 — Test

1. Sign in as Administrator.
2. Users → Invite user.
3. Enter a test email.
4. Select Supervisor or Guest.
5. Send invitation.
6. Confirm a profile appears with status `invited`.
7. Confirm the invitation email arrives.
8. Complete the secure account setup flow.
9. Confirm the user can sign in.

Do not use a production client account for the first test.
