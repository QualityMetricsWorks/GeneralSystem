# GUVEL v0.0.2.4 — Invitation Acceptance & Account Activation

## Included
- Invitation redirect uses `?flow=activate`.
- Supabase client enables `detectSessionInUrl`.
- Valid invitation sessions display account activation.
- User creates a password.
- `activate_current_user_profile()` changes the profile from `invited` to `active`.
- Invalid or expired invitation links show a dedicated error state.

## Required backend state
Run `sql/09_account_activation.sql` if the activation function is not already present.

## Edge Function change
In `invite-company-user`, use:

`redirectTo: `${origin}/?flow=activate``

Deploy the function after the change.
