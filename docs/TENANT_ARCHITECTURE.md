# GUVEL Tenant Architecture — v0.0.1.1

## Core principle

GUVEL General System is one product with one codebase and a multi-tenant
database architecture.

Each company or environment accesses GUVEL through:

`<tenant>.guvelsystems.com`

Examples:

- development.guvelsystems.com
- metricsworks.guvelsystems.com
- magna.guvelsystems.com

There is no general portal where users select a company.

## Current development environment

The active environment during development is:

`development.guvelsystems.com`

It is represented as a normal tenant:

- name: GUVEL Development
- code: GUVELDEV
- slug: development

This is intentional. Development uses the same tenant architecture that future
customers will use.

## Tenant resolution

hostname
-> tenant slug
-> companies.slug
-> company_id
-> application context

## Authentication

The URL establishes context, not permission.

After login:

auth.users.id
-> profiles.user_id
-> profiles.company_id

The profile company must match the company resolved from the URL.

## Data isolation

Every company-owned table uses company_id.

Row Level Security provides the database enforcement layer.

## URL policy

Use:

`<tenant>.guvelsystems.com`

Examples:

`development.guvelsystems.com`

Not required:

`www.metricsworks.guvelsystems.com`

## Development rules

1. Bootstrap/authentication remains independent of UI modules.
2. Modules load independently.
3. Tenant resolution is a core contract.
4. New functionality must not silently modify authentication.
5. Server-side administrative operations must never expose service_role keys.
