# Resource Reservation Management System

A focused full-stack application for coordinating shared rooms and equipment. It centralizes resource information, shows upcoming bookings, filters availability, and prevents double bookings even when requests arrive concurrently.

## Features

- Create and edit resources, including their location and description.
- Deactivate/reactivate resources while preserving existing reservations.
- Reserve active resources with requester name/email, purpose, and start/end times.
- Reject past starts, invalid time ranges, and overlapping confirmed reservations.
- Check availability for a selected interval.
- Cancel ongoing/upcoming reservations and retain cancelled booking history.
- Display all booking times in Sri Lanka time (Asia/Colombo).
- Show validation, pending, empty, and database-unavailable states.

## Technology and architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, PostgreSQL, and the `pg` driver. Server Components read data; Server Actions validate and mutate data; small Client Components handle form progress and feedback. SQL migrations keep database setup reproducible. There is no separate backend service.

## Prerequisites

- Node.js **22.18 or later** (also supports the TypeScript verification script).
- npm and Git.
- PostgreSQL **17** running locally (the version used for verification).
- A local database role with permission to create the application database and install `btree_gist`. Using the local `postgres` role is sufficient for assessment setup; use a restricted application role for deployment.

## Set up a fresh checkout

Clone this repository, open a terminal in its root, then run:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
```

Edit `.env.local` privately:

```env
DATABASE_URL=postgresql://postgres:YOUR_URL_ENCODED_PASSWORD@localhost:5432/resource_reservation
```

Replace the password with your local PostgreSQL password. Percent-encode special characters (`@` becomes `%40`, `#` becomes `%23`, `%` becomes `%25`). Keep the file in the project root, outside `src`. Never commit `.env.local`; `.env.example` contains placeholders only.

Create and initialize the database:

```powershell
npm.cmd run db:create
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run db:check
npm.cmd run dev
```

Open http://localhost:3000. Resources are at `/resources`; bookings and availability are at `/reservations`. Stop the server with Ctrl+C. On shells other than Windows PowerShell, use `npm` in place of `npm.cmd`.

The setup commands preserve existing data. Migrations are recorded in `schema_migrations`; sample resources use fixed IDs and are not duplicated on repeat runs. A hosted PostgreSQL service may require provisioning the database/extension through its provider before running migrations.

For a production-mode local run:

```powershell
npm.cmd run build
npm.cmd start
```

## Verification

With `.env.local` configured and the schema migrated:

```powershell
npm.cmd run lint
npm.cmd run test:booking
npm.cmd run db:test
npm.cmd run db:test-concurrency
npm.cmd run db:test-setup
npm.cmd run build
```

- `test:booking`: timezone conversion, invalid dates, past starts, end-time ordering, and input validation.
- `db:test`: overlaps (including containment), adjacent bookings, invalid ranges, foreign keys, cancellation, and conflicting reactivation. Test data is rolled back.
- `db:test-concurrency`: two simultaneous overlapping inserts; exactly one must succeed. It removes only its own temporary fixtures afterward. Run it against a local development database.
- `db:test-setup`: creates a temporary database, applies migrations and seeds twice, verifies the results, and removes that temporary database. Requires permission to create databases.
- Browser checks during development covered saving bookings, conflict messages, availability, cancellation/history, and resource editing/deactivation/reactivation.

## Important decisions

**Reliability at the database boundary.** A partial GiST exclusion constraint compares resource IDs and `tstzrange(starts_at, ends_at, '[)')` for confirmed bookings. It protects against simultaneous double bookings. `[)` allows 10:00-11:00 followed by 11:00-12:00. Database error `23P01` becomes a friendly conflict message.

**Preserved history.** Cancellation changes status instead of deleting a row. Resource deactivation prevents new bookings without silently cancelling existing ones. Foreign keys restrict resource deletion. Resource names on bookings reflect their current names rather than historical snapshots.

**Explicit timezone handling.** The datetime inputs are interpreted as Sri Lanka time (UTC+05:30); PostgreSQL stores timezone-aware instants. The UI formats timestamps in Asia/Colombo regardless of browser timezone.

**Simple scope.** Requester details are stored directly on reservations. Accounts, roles, recurring bookings, approvals, and notifications are outside this focused assessment implementation. AI assistance was used during implementation; the walkthroughs document the design and behavior to support explanation and review.

## Database design

See [the ER diagram](docs/er-diagram.md), [standalone SVG](docs/er-diagram.svg), and [migration](db/migrations/001_initial.sql). One resource has zero or more reservations; each reservation belongs to exactly one resource. `schema_migrations` is an internal setup table.

## Project structure

```text
src/app/resources/       Resource pages, forms, and server actions
src/app/reservations/    Bookings, availability, and cancellation
src/lib/                Server database pool, resource queries, booking validation
db/migrations/          Versioned SQL schema
db/seed.sql             Repeatable sample resources
scripts/                Database commands and verification scripts
docs/                   ER diagram, learning walkthroughs, and submission guide
```

## Known limits

- Local assessment version with trusted users; there is no authentication or per-user authorization. Resource editing and cancellation are accessible to every application user. Add access control before public deployment.
- Upcoming reservations are limited to 100; cancelled history to 50. Pagination and a full completed-booking history screen are not implemented.
- Availability is a snapshot. Another user may book before submission; the database constraint still prevents a conflict.
- Resource edits use last-save-wins behavior; no edit-version conflict detection.
- Deactivation preserves existing bookings. Cancel affected bookings separately when taking a resource out of service.

## Troubleshooting

- **Password authentication failed:** check the username, password encoding, and port in `.env.local`.
- **Connection refused:** start the PostgreSQL service and verify its port (default 5432).
- **Resources unavailable / missing tables:** run `db:migrate`, `db:seed`, and `db:check` in order.
- **Extension or database permission error:** use a local setup role authorized to create the database and `btree_gist`.
- **PowerShell blocks npm.ps1:** use `npm.cmd` as shown above.
- **Port 3000 is occupied:** stop the other development server or run `npm.cmd run dev -- --port 3001`.

## Walkthroughs and submission

[Database](docs/database.md) · [Resources](docs/resources.md) · [Reservations](docs/reservations.md) · [Availability/cancellation](docs/availability-and-cancellation.md) · [Resource management](docs/resource-management.md)

See [the submission guide and demo script](docs/submission-guide.md) for the remaining GitHub, diagram-link, recording, and submission steps.
