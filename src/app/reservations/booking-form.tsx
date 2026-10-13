'use client';

import { useActionState } from 'react';
import { createReservation } from './actions';
import type { BookingValues } from '@/lib/booking-validation';

type Option = { id: string; name: string; location: string };
const fields: { name: keyof BookingValues; label: string; type: string; maxLength?: number }[] = [
  { name: 'requesterName', label: 'Your name', type: 'text', maxLength: 120 },
  { name: 'requesterEmail', label: 'Email address', type: 'email', maxLength: 254 },
  { name: 'purpose', label: 'Purpose', type: 'text', maxLength: 500 },
  { name: 'startsAt', label: 'Start time', type: 'datetime-local' },
  { name: 'endsAt', label: 'End time', type: 'datetime-local' },
];
const inputClass = 'mt-2 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-teal-700';

export function BookingForm({ resources, initialTimes }: { resources: Option[]; initialTimes?: { startsAt: string; endsAt: string } }) {
  const [state, action, pending] = useActionState(createReservation, { success: false, message: '' });
  return (
    <form action={action} className="mt-5">
      <p id="booking-timezone" className="mb-5 text-sm leading-6 text-slate-600">All times are in Sri Lanka time (UTC+05:30). All fields are required.</p>
      <fieldset disabled={pending || !resources.length} className="space-y-4 disabled:opacity-60">
        <legend className="sr-only">Reservation details</legend>
        <div>
          <label htmlFor="resourceId" className="text-sm font-medium">Resource</label>
          <select id="resourceId" name="resourceId" required defaultValue={state.values?.resourceId ?? ''} className={inputClass} aria-invalid={!!state.errors?.resourceId} aria-describedby={state.errors?.resourceId ? 'resourceId-error' : undefined}>
            <option value="">Choose a resource</option>
            {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name} · {resource.location}</option>)}
          </select>
          {state.errors?.resourceId && <p id="resourceId-error" className="mt-1 text-sm text-red-700">{state.errors.resourceId}</p>}
        </div>
        {fields.map(({ name, label, type, maxLength }) => (
          <div key={name}>
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <input id={name} name={name} type={type} required maxLength={maxLength} defaultValue={state.values?.[name] ?? (name === 'startsAt' || name === 'endsAt' ? initialTimes?.[name] : '') ?? ''} className={inputClass} aria-invalid={!!state.errors?.[name]} aria-describedby={[type === 'datetime-local' ? 'booking-timezone' : '', state.errors?.[name] ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined} />
            {state.errors?.[name] && <p id={`${name}-error`} className="mt-1 text-sm text-red-700">{state.errors[name]}</p>}
          </div>
        ))}
        <button className="w-full rounded-lg bg-teal-800 px-4 py-3 font-semibold text-white hover:bg-teal-900 disabled:cursor-wait" type="submit">{pending ? 'Reserving…' : 'Confirm reservation'}</button>
      </fieldset>
      {!resources.length && <p className="mt-4 text-sm text-slate-600">No active resources are available{initialTimes ? ' for the selected time. Change or clear the availability filter.' : '. Add a resource to get started.'}</p>}
      <p role="status" aria-live="polite" className={`mt-4 text-sm ${state.success ? 'text-teal-800' : 'text-red-700'}`}>{state.message}</p>
    </form>
  );
}
