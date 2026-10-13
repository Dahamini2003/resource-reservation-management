import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { listResources, type Resource } from '@/lib/resources';
import { ResourceForm } from './resource-form';

export const metadata = { title: 'Resources | Resource Reservation' };

export default function ResourcesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <Link href="/" className="text-sm font-medium text-teal-800 underline underline-offset-4">Back to home</Link>
      <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-teal-700">Resource Reservation</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Shared resources</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">Organize the rooms and equipment your team shares. Active resources can be used for reservations.</p>
      <Link href="/reservations" className="mt-5 inline-block rounded-lg bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900">View reservations and book</Link>
      <Suspense fallback={<p role="status" className="mt-10 text-slate-600">Loading resources…</p>}>
        <ResourceContent />
      </Suspense>
    </main>
  );
}

async function ResourceContent() {
  // Database reads must run at request time, inside a Suspense boundary.
  await connection();
  let resources: Resource[];
  try {
    resources = await listResources();
  } catch {
    return (
      <section className="mt-10 rounded-2xl border border-amber-300 bg-amber-50 p-6" aria-labelledby="database-unavailable">
        <h2 id="database-unavailable" className="text-lg font-semibold">Resources are temporarily unavailable</h2>
        <p className="mt-2 leading-7 text-slate-700">The resource database could not be reached. Please try again shortly or contact the person managing this application.</p>
        <Link href="/resources" className="mt-4 inline-block font-semibold text-teal-800 underline underline-offset-4">Try again</Link>
      </section>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section aria-labelledby="resource-list">
        <div className="flex items-center justify-between gap-4">
          <h2 id="resource-list" className="text-xl font-semibold">Resource directory</h2>
          <span className="text-sm text-slate-500">{resources.length} {resources.length === 1 ? 'resource' : 'resources'}</span>
        </div>
        {resources.length ? (
          <ul className="mt-5 space-y-4">
            {resources.map((resource) => (
              <li key={resource.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="break-words text-lg font-semibold">{resource.name}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resource.is_active ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>{resource.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="mt-2 break-words text-sm font-medium text-slate-500">{resource.location}</p>
                {resource.description && <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-slate-600">{resource.description}</p>}
                <details className="mt-5 border-t border-slate-100 pt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-teal-800">Edit resource</summary>
                  <ResourceForm resource={resource} />
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 leading-7 text-slate-600">No resources yet. Add your first room or piece of equipment using the form.</p>
        )}
      </section>
      <section aria-labelledby="add-resource" className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h2 id="add-resource" className="text-xl font-semibold">Add a resource</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Give your team enough detail to choose the right resource.</p>
        <ResourceForm />
      </section>
    </div>
  );
}
