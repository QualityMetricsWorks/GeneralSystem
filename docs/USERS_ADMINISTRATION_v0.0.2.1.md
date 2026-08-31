# GUVEL General System v0.0.2.1 — Users Administration

## Scope

This release introduces the first functional Users module.

The module is intentionally READ-FIRST.

### Included
- Company-scoped user directory.
- Total, active, inactive and invited user counters.
- Search by display name or email.
- Filter by role.
- Filter by status.
- Administrator and Manager module access.
- Supervisor and Guest access restriction.
- Read-only database function for tenant-scoped users.

### Not included
- Create user.
- Invite user.
- Password management.
- Change role.
- Activate/deactivate.
- Delete user.

Those operations are deliberately deferred until explicit authorization rules and
controlled database operations are added.

## Security

The browser never reads `auth.users`.

The Users module calls:

`public.get_company_users()`

The database function scopes results to:

`public.current_company_id()`

The frontend access check is for UX only. Future write actions must be enforced
in the database and not merely hidden in the UI.
