# Step 5: Availability and cancellation

## Availability

The form at the top of `/reservations` submits a GET request. Its start and end times are stored in the URL, so refreshing preserves the filter. The server validates both times and interprets them as Sri Lanka time.

The SQL query selects active resources for which no confirmed reservation overlaps the requested interval:

```sql
existing.starts_at < requested.end
AND existing.ends_at > requested.start
```

This is the same overlap rule enforced by the database constraint. A booking ending exactly when your requested booking starts does not conflict. The filtered resource choices and selected times are passed into the booking form. Availability can change between checking and submitting, so the database still enforces conflicts when saving.

The upcoming booking list remains visible for all resources so you can understand the schedule while choosing an available resource.

## Cancellation

1. Click **Cancel booking** on an ongoing or upcoming reservation.
2. The inline confirmation offers **Keep booking** or **Confirm cancellation**.
3. The server validates the reservation ID and runs a parameterized update that changes only a confirmed reservation that has not ended.
4. The database row remains, but its status becomes `cancelled`.
5. The reservation moves to the cancelled history section and stops blocking availability. The page and active availability filter refresh.

The conditional update makes a repeated cancellation harmless. An already cancelled or ended reservation returns an explanatory message. The current local assessment app treats all users as trusted; there is no ownership or account authentication yet.

## Try it yourself

1. Make a booking for tomorrow, 10:00-11:00.
2. Check availability for tomorrow, 10:30-11:30. That resource should be missing from the resource dropdown.
3. Cancel that booking and confirm. It should move into cancelled history.
4. The resource should reappear in the dropdown for the same filter.
5. Try an end before the start: the filter should show a validation message.
6. Use **Clear filter** to return to all active resources.

## Verification

Browser verification used a temporary dedicated resource: an overlap excluded it, cancellation moved its booking into history, and the same filter immediately included it again. A direct database check confirmed the row was retained with cancelled status. Only the temporary verification fixtures were removed afterward.
