export type BookingValues = Record<'resourceId' | 'requesterName' | 'requesterEmail' | 'purpose' | 'startsAt' | 'endsAt', string>;
export type BookingErrors = Partial<Record<keyof BookingValues, string>>;

// datetime-local contains no timezone. Interpret it explicitly as Sri Lanka time.
export function parseColomboTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+05:30`);
  if (!Number.isFinite(date.getTime())) return null;
  const roundTrip = new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 16);
  return roundTrip === value ? date : null;
}

export function validateBooking(values: BookingValues, now = new Date()) {
  const errors: BookingErrors = {};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.resourceId)) errors.resourceId = 'Choose a resource.';
  if (!values.requesterName.trim() || values.requesterName.length > 120) errors.requesterName = 'Enter your name (up to 120 characters).';
  if (values.requesterEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.requesterEmail)) errors.requesterEmail = 'Enter a valid email address.';
  if (!values.purpose.trim() || values.purpose.length > 500) errors.purpose = 'Enter a purpose (up to 500 characters).';
  const start = parseColomboTime(values.startsAt);
  const end = parseColomboTime(values.endsAt);
  if (!start) errors.startsAt = 'Enter a valid start date and time.';
  else if (start <= now) errors.startsAt = 'Start time must be in the future.';
  if (!end) errors.endsAt = 'Enter a valid end date and time.';
  else if (start && end <= start) errors.endsAt = 'End time must be after the start time.';
  return { errors, start, end };
}
