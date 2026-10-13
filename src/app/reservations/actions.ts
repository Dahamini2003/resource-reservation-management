'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { validateBooking, type BookingValues, type BookingErrors } from '@/lib/booking-validation';

export type BookingState = { success: boolean; message: string; values?: BookingValues; errors?: BookingErrors };

export async function cancelReservation(_state: { message: string }, form: FormData): Promise<{ message: string }> {
  const id = form.get('reservationId');
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { message: 'Invalid reservation.' };
  }
  try {
    const result = await getDb().query(
      "UPDATE reservations SET status = 'cancelled' WHERE id = $1 AND status = 'confirmed' AND ends_at > now() RETURNING id", [id],
    );
    if (!result.rowCount) return { message: 'This booking has already ended or is no longer confirmed. Refresh the page.' };
  } catch {
    return { message: 'The reservation could not be cancelled. Please try again.' };
  }
  revalidatePath('/reservations');
  return { message: 'Reservation cancelled. Its time slot is available again.' };
}

export async function createReservation(_state: BookingState, form: FormData): Promise<BookingState> {
  const read = (key: string) => typeof form.get(key) === 'string' ? (form.get(key) as string).trim() : '';
  const values: BookingValues = {
    resourceId: read('resourceId'), requesterName: read('requesterName'), requesterEmail: read('requesterEmail'),
    purpose: read('purpose'), startsAt: read('startsAt'), endsAt: read('endsAt'),
  };
  const { errors, start, end } = validateBooking(values);
  if (Object.keys(errors).length || !start || !end) return { success: false, message: 'Please correct the highlighted fields.', values, errors };

  let client;
  try {
    client = await getDb().connect();
    await client.query('BEGIN');
    // The lock keeps this resource from being deactivated during the insert.
    const resource = await client.query('SELECT is_active FROM resources WHERE id = $1 FOR SHARE', [values.resourceId]);
    if (!resource.rows[0]?.is_active) {
      await client.query('ROLLBACK');
      return { success: false, message: 'This resource is no longer active. Choose another resource.', values, errors: { resourceId: 'Choose an active resource.' } };
    }
    await client.query(
      `INSERT INTO reservations (resource_id, requester_name, requester_email, purpose, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [values.resourceId, values.requesterName, values.requesterEmail, values.purpose, start.toISOString(), end.toISOString()],
    );
    await client.query('COMMIT');
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    const code = (error as { code?: string }).code;
    return { success: false, message: code === '23P01'
      ? 'This resource is already booked during that time. Choose a different time or resource.'
      : 'The reservation could not be saved. Please try again.', values };
  } finally {
    client?.release();
  }
  revalidatePath('/reservations');
  return { success: true, message: 'Reservation confirmed.', values: { resourceId: values.resourceId, requesterName: '', requesterEmail: '', purpose: '', startsAt: '', endsAt: '' } };
}
