# GUVEL General System v0.0.2.5
## Company & Shift Management

### Scope
- Settings module with Company and Shifts tabs.
- Company information displayed from `companies`.
- Shift CRUD backed by `company_shifts`.
- Administrator and Manager can create, edit, deactivate and reactivate shifts.
- Supervisor and Guest have read-only shift access.
- No physical deletion of shifts.
- Overnight shifts are detected visually when `start_time > end_time`.

### Database prerequisite
The `company_shifts` table and RLS policies from `11_company_shift_management.sql` must already be installed.
