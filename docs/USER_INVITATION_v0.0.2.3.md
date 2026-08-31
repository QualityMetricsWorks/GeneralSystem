# GUVEL General System v0.0.2.3 — User Invitation & Creation

## Scope

This release introduces the first controlled user creation flow.

## Flow

Administrator or Manager
→ Invite user
→ Server validates role and company
→ Supabase Auth invitation is created
→ Company profile is provisioned as `invited`
→ User receives invitation email
→ User sets credentials through the secure invitation flow
→ Profile can become active

## Important architecture

A static GitHub Pages application must never contain a Supabase Service Role key.

For that reason user creation is handled by:

Browser
→ Supabase Edge Function
→ Auth Admin API
→ Company profile provisioning

## Role rules

Administrator can invite:
- Manager
- Supervisor
- Guest

Manager can invite:
- Supervisor
- Guest

No role can invite Administrator in v0.0.2.3.

## Tenant isolation

The company is obtained from the authenticated inviter's profile.
The browser does not send a selectable company ID.

## Required deployment configuration

Before invitations work:

1. Deploy the Edge Function `invite-company-user`.
2. Ensure Supabase Auth Site URL and Redirect URLs include the development URL.
3. Configure email delivery in Supabase.
4. Keep the Service Role key only in Supabase server-side secrets.
