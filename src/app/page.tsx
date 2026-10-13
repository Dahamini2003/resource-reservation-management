import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Resource Reservation</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Shared resources. Clear schedules.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">A central place to organize rooms and equipment, check availability, and coordinate reservations.</p>
      <Link href="/resources" className="mt-8 inline-block rounded-lg bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900">Manage resources</Link>
      <section aria-labelledby="workflow" className="mt-12">
        <h2 id="workflow" className="text-xl font-semibold">How reservations will work</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Choose a resource", "Find the room or equipment your team needs."],
            ["02", "Select a time", "Check availability for your start and end time."],
            ["03", "Reserve with confidence", "Conflicting reservations will be prevented."],
          ].map(([step, title, description]) => (
            <article key={step} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-mono text-sm text-teal-700">{step}</p>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <Link href="/reservations" className="mt-8 inline-block font-semibold text-teal-800 underline underline-offset-4">Make a reservation</Link>
    </main>
  );
}
