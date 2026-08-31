# GUVEL User Management Architecture — v0.0.2.0

## Security model

Authentication:
auth.users

Application identity:
public.profiles

Tenant isolation:
profiles.company_id

Authorization:
profiles.role + RLS

Lifecycle:
profiles.status

## User lifecycle

INVITED -> ACTIVE -> INACTIVE

An invitation workflow is planned for v0.0.2.2.
v0.0.2.0 establishes the data model only.

## Tenant rule

A user belongs to one company in the current v1 architecture.

Future multi-company access must be implemented through an explicit membership
table, not by weakening company isolation.

## Administrator vs Manager

Administrator controls the platform and company administration.

Manager controls operational administration.

This distinction is intentional and must remain visible in future permission
checks and UI actions.

## Critical rule

Frontend visibility is never the security boundary.

A hidden button is not authorization.

All sensitive operations must eventually be enforced through RLS policies,
RPCs or server-side functions.
