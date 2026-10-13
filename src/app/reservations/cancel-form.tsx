'use client';

import { useActionState, useState } from 'react';
import { cancelReservation } from './actions';

export function CancelForm({ id, resourceName }: { id: string; resourceName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(cancelReservation, { message: '' });
  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {confirming ? (
        <form action={action}>
          <input type="hidden" name="reservationId" value={id} />
          <p className="text-sm text-slate-600">Cancel this booking for {resourceName}? Its time slot will be freed.</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <button type="submit" disabled={pending} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Cancelling…' : 'Confirm cancellation'}</button>
            <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="text-sm font-medium text-slate-600 underline">Keep booking</button>
          </div>
        </form>
      ) : <button type="button" onClick={() => setConfirming(true)} className="text-sm font-semibold text-red-700 underline underline-offset-4">Cancel booking</button>}
      <p role="status" className="mt-2 text-sm text-red-700">{state.message}</p>
    </div>
  );
}
