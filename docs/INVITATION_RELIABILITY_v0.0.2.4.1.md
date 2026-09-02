# GUVEL General System v0.0.2.4.1

## Invitation Reliability

This release completes the operational lifecycle of pending invitations.

### Included
- Resend invitation for users with `status = invited`.
- Cancel pending invitation for users with `status = invited`.
- Role and company permission validation remains enforced by the Edge Functions.
- No frontend access to the Supabase service role key.
- Users list refreshes after successful actions.

### Backend dependencies
- Edge Function: `resend-company-invitation`
- Edge Function: `cancel-company-invitation`
- SQL foundation: `10_invitation_reliability.sql`

### Validation
1. Resend an expired invitation and verify a new email arrives.
2. Activate the account using the new link.
3. Confirm the user becomes active.
4. Cancel a separate pending test invitation.
5. Confirm it disappears from GUVEL Users and Supabase Authentication.
