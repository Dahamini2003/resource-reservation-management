import assert from 'node:assert/strict';
import { parseColomboTime, validateBooking } from '../src/lib/booking-validation.ts';

const values = { resourceId: '00000000-0000-4000-8000-000000000001', requesterName: 'Test User', requesterEmail: 'test@example.com', purpose: 'Meeting', startsAt: '2099-01-01T10:00', endsAt: '2099-01-01T11:00' };
assert.equal(parseColomboTime(values.startsAt).toISOString(), '2099-01-01T04:30:00.000Z');
assert.equal(parseColomboTime('2099-02-30T10:00'), null);
assert.equal(parseColomboTime('2099-01-01T25:00'), null);
assert.equal(parseColomboTime('2099-01-01T10:00Z'), null);
assert.deepEqual(validateBooking(values, new Date('2098-01-01')).errors, {});
assert.ok(validateBooking(values, new Date('2100-01-01')).errors.startsAt);
assert.ok(validateBooking({ ...values, endsAt: values.startsAt }).errors.endsAt);
assert.ok(validateBooking({ ...values, requesterEmail: 'invalid' }).errors.requesterEmail);
assert.ok(validateBooking({ ...values, resourceId: 'invalid' }).errors.resourceId);
assert.ok(validateBooking({ ...values, requesterName: '   ' }).errors.requesterName);
console.log('PASS: Colombo timezone, invalid calendar dates, future times, end time, email, resource ID, and required name.');
