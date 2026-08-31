# GUVEL General System v0.0.2.2 — User Actions

## Scope

This release adds controlled user management actions.

## Supported actions

- Change user role.
- Activate a user.
- Deactivate a user.

## Security model

### Administrator
Can manage:
- Manager
- Supervisor
- Guest

Cannot manage through this module:
- Self
- Another Administrator

### Manager
Can manage:
- Supervisor
- Guest

Cannot manage:
- Administrator
- Another Manager
- Self

## Important implementation principle

Authorization is enforced in PostgreSQL functions.

The frontend hides unavailable actions for usability, but the database remains the
authoritative security layer.

## Deliberately excluded

- Creating users.
- Sending invitations.
- Password resets.
- Assigning Administrator.
- Deleting users.

These capabilities require additional lifecycle and platform governance rules.
