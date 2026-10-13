# Implementation plan

## Proposed minimum scope

Manage resources (name, description, location, active status). Create reservations with requester name/email, purpose, resource, start, and end. List upcoming bookings and cancel reservations. Show availability for a selected time range.

Authentication, recurring bookings, approval workflows, and notifications are outside the initial scope. This is a proposed implementation choice, not an explicit assessment rule.

## Data model to implement

Resource: id, name, description, location, isActive, createdAt.
Reservation: id, resourceId, requesterName, requesterEmail, purpose, startsAt, endsAt, status, createdAt.

One resource has many reservations. Requester details are stored directly for the initial version; user accounts are not required for this scope.

## Booking rules

- Require a resource and valid requester details.
- End must be later than start; new reservations cannot start in the past.
- Inactive resources cannot receive new bookings.
- Cancelled bookings do not block availability.
- Two active bookings conflict when existing.start < requested.end AND existing.end > requested.start.
- Adjacent bookings are allowed: 10:00-11:00 and 11:00-12:00.
- Enforce overlap protection in PostgreSQL as well as server validation so simultaneous requests cannot double-book.
- Store timezone-aware timestamps and display times consistently in Asia/Colombo.
- Preserve booking history when deactivating resources or cancelling bookings.

## Learning checkpoints

1. Scaffold the application and understand the folder structure.
2. Configure PostgreSQL, create schema/migrations, and add sample resources.
3. Build resource listing and management.
4. Build reservations and enforce overlap rules.
5. Add availability filtering, cancellation, and helpful validation messages.
6. Verify conflicting and simultaneous booking attempts, document setup, prepare ER diagram and demo.

## Submission checklist

GitHub repository, reproducible README, shareable ER diagram, and 3-5 minute demonstration video. Assessment deadline: 15 October 2026, 11:59 PM Sri Lanka time.
