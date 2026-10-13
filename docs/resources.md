# Step 3: Read and create resources

## How the pieces connect

1. Visit `/resources` from the home page.
2. The Server Component in `src/app/resources/page.tsx` calls `listResources()`.
3. `src/lib/resources.ts` queries PostgreSQL through the reusable connection pool.
4. The page renders the stored resource names, locations, descriptions, and active status.
5. The form calls `createResource()` in `actions.ts`. This Server Action trims input, checks required fields and length limits, and inserts a row using SQL parameters.
6. `revalidatePath('/resources')` refreshes the displayed list after a successful save.

`resource-form.tsx` is a Client Component because it shows submission progress and validation feedback using `useActionState`. Database code stays on the server. A resource's active flag describes whether it is in service; it does not mean it is free at a particular time.

## Prerequisite

Finish the steps in `docs/database.md`. Without a working connection and migrated schema, the resource page shows an unavailable message and does not display invented data.

## Try it yourself

1. Start the app with `npm.cmd run dev`.
2. Open http://localhost:3000/resources.
3. Check that the three seeded resources appear.
4. Add `Training Room`, location `Ground floor`, with a short description.
5. Refresh the page: the new resource should still appear because PostgreSQL stores it.
6. Try a name containing only spaces. Server validation should reject it.
7. Stop PostgreSQL temporarily only if you are comfortable doing so: the page should show an unavailable state instead of a false empty list. Restore the service afterward.

This checkpoint introduced listing and creation. Editing and deactivation are covered in `docs/resource-management.md`; bookings are covered in `docs/reservations.md`. This local assessment version has no authentication and treats application users as trusted; public deployment would require access control on resource mutations.
