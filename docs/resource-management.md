# Step 6: Editing and retiring resources

## Learn the update flow

The resource directory now reuses `ResourceForm` for both adding and editing. When a resource is provided, the form starts with its existing values, includes its ID in a hidden field, and invokes the `updateResource` server action instead of `createResource`.

Every form receives unique HTML field IDs through React's `useId`, so labels and validation messages stay linked to the correct fields even when multiple edit forms are open.

The server does not trust hidden fields or browser validation. It validates the ID, required values, and text limits, then uses a parameterized SQL `UPDATE`. A missing record or failed database operation produces a message instead of reporting success.

Both resource and reservation pages are revalidated after saving. Renaming a resource updates its displayed name on bookings because reservations join to the resource table by its stable ID. Names are current values, not historical snapshots.

## Active versus inactive

- Active resources can receive new bookings.
- Inactive resources remain in the directory, but do not appear among booking choices or availability results.
- Existing confirmed bookings are preserved. If they can no longer go ahead, cancel them explicitly from Reservations.
- Reactivation allows new bookings again; existing bookings still block conflicting times.

The reservation action locks the resource row with `FOR SHARE` while checking active status and inserting. An update that changes active status must wait for that transaction. If deactivation finishes first, the later reservation request sees the inactive state and is rejected.

## Try it yourself

1. Visit `/resources` and expand **Edit resource** on Training Room.
2. Change its location or description, then click **Save changes**.
3. Refresh and confirm the changes persist.
4. Uncheck **Active: allow new reservations** and save.
5. Visit `/reservations`: Training Room should be absent from the resource choices. Any existing bookings remain listed.
6. Return to Resources, check Active, and save to restore it.

## Verification

Browser tests used a dedicated temporary resource and confirmed that edits saved, deactivation removed it from booking choices, an existing booking remained visible, and reactivation succeeded. Database checks verified persisted values and the booking's confirmed status. The temporary test records were removed without changing user records.

This remains a local application with trusted users and no authentication. The next checkpoint is submission preparation: a complete README, ER diagram, final checks, GitHub repository, and demo recording.
