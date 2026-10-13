# Step 4: Create reservations

## Follow one booking through the application

1. `/reservations` reads active resources and the next 100 ongoing/upcoming confirmed bookings.
2. `booking-form.tsx` collects a resource, name, email, purpose, start, and end. `useActionState` displays pending, success, and error messages.
3. The form invokes `createReservation` in `actions.ts` on the server.
4. `booking-validation.ts` validates the submitted values. The server interprets dates as Sri Lanka time (UTC+05:30), rejects invalid calendar dates, past starts, and end times at or before the start.
5. A transaction checks the resource exists and is active, then inserts the reservation. A shared row lock keeps the resource status stable during the insert.
6. PostgreSQL's exclusion constraint is the final check for overlapping bookings. Code `23P01` becomes a helpful conflict message in the form. This also protects simultaneous submissions from separate users.
7. On success, `revalidatePath` refreshes the reservation list. Booking times display in Asia/Colombo.

A transaction means the database operations either finish together or are rolled back. Browser validation improves usability, but the server validates again because requests can bypass the browser form.

## Try it yourself

1. Open http://localhost:3000/reservations.
2. Select a resource and enter your name, email, and meeting purpose.
3. Choose a future date, 10:00-11:00, and submit. You should see the booking in the list.
4. Try the same resource and date at 10:30-11:30. You should see a conflict message.
5. Try 11:00-12:00. It should succeed because adjacent bookings are allowed.
6. Try an end before the start or a past date. The server should reject it.
7. Refresh the page to confirm persistence.

## Verification commands

```powershell
npm.cmd run test:booking
npm.cmd run db:test
npm.cmd run db:test-concurrency
```

The concurrency test creates its own temporary resource and removes only its own fixtures afterward. Existing reservations are preserved.

Cancellation and availability filtering are implemented in Step 5; see `docs/availability-and-cancellation.md`. This local assessment version has no authentication; all users are trusted. Access control is needed before public deployment.
