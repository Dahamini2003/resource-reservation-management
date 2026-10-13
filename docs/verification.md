# Local verification record

Verification date: 13 October 2026 (Sri Lanka).

| Check | Result |
| --- | --- |
| Booking input/timezone checks | Passed |
| PostgreSQL overlap, adjacency, invalid range, foreign key, cancellation/reactivation checks | Passed |
| Concurrent overlapping inserts | Passed: exactly one accepted |
| Fresh database migration and seeding | Passed |
| Repeat migration and seeding | Passed: one migration ledger entry and three resources |
| ESLint | Passed |
| Production build and TypeScript | Passed |
| Browser: create booking and overlap error | Passed |
| Browser: availability, invalid filter, cancellation/history | Passed |
| Browser: edit, deactivate, reactivate resource; preserve booking | Passed |
| ER diagram rendering | Visually inspected |

Browser and database fixtures were dedicated temporary records and removed after verification. Existing user resources and bookings were preserved.

The fresh database test verifies schema provisioning and repeatability. A clean dependency install on a separate computer has not been performed. GitHub access, shared-link access, and the demo recording still require verification after upload.

Run the commands in the README to repeat automated checks. This record describes the local verification performed during development; it is not an automated CI run.
