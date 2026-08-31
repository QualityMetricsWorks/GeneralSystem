# invite-company-user Edge Function

This function uses the Supabase Service Role key on the server side.

Never place `SUPABASE_SERVICE_ROLE_KEY` inside:
- env.js
- GitHub
- browser JavaScript
- GitHub Pages

The browser invokes this function with the currently authenticated user's JWT.
The function validates the inviter's profile, role and company before creating
the Auth invitation and company profile.
