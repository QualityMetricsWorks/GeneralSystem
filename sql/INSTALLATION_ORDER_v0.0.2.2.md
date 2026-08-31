# GUVEL v0.0.2.2 Installation

Prerequisite:
- v0.0.2.1 is already installed and validated.

## Database

Execute in Supabase SQL Editor:

1. `07_user_actions.sql`
2. `07a_user_actions_validation.sql`

## Application

Deploy all files from this release to the GitHub repository.

## Validation

1. Sign in as Administrator.
2. Open Users.
3. Existing users appear.
4. Only manageable users show the Manage button.
5. Change a permitted role and save.
6. Verify the table refreshes.
7. Activate/deactivate a permitted user.
8. Confirm that your own user cannot be managed.
9. Confirm that Administrator users cannot be managed from this version.
