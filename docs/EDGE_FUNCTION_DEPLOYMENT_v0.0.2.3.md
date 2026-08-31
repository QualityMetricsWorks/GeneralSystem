# Edge Function Deployment — v0.0.2.3

## Function

`invite-company-user`

The source is included in:

`supabase/functions/invite-company-user/index.ts`

## Required secret

The function requires the server-side environment variable:

`SUPABASE_SERVICE_ROLE_KEY`

Do not expose this key in the browser.

## Recommended deployment path

Use the Supabase CLI or Supabase Dashboard Edge Functions deployment workflow.

After deployment, test with an Administrator session.

## Auth URLs

In Supabase Authentication configuration, add:

- Site URL: `https://development.guvelsystems.com`
- Redirect URL: `https://development.guvelsystems.com/**`

For future customer tenants, add each approved tenant URL intentionally.

## Email

Verify that the Supabase email invitation template and delivery configuration are
working before testing with a real client.
