# Core Dependency Contract — v0.0.1.2

## tenant.service.js public API

- getTenant()
- getTenantFromHost()
- resolveTenant(slug)
- getResolvedTenant()

bootstrap.js depends on getTenant() and resolveTenant().

Rule: public core functions must not be renamed or removed without updating and validating all importing modules in the same version.
