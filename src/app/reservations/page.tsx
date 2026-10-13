import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { listResources } from "@/lib/resources";
import { BookingForm } from "./booking-form";
import { CancelForm } from "./cancel-form";
import { parseColomboTime } from "@/lib/booking-validation";
import type { Resource } from "@/lib/resources";

export const metadata = { title: "Reservations | Resource Reservation" };
type Reservation = {
  id: string;
  resource_name: string;
  requester_name: string;
  purpose: string;
  starts_at: Date;
  ends_at: Date;
};
type Search = Promise<Record<string, string | string[] | undefined>>;
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo",
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ReservationsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  return (
    <main id="main-content" className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GOOD PLANS START HERE</p>
          <h1>Reservations</h1>
          <p className="page-description">
            Find a free resource, reserve your time, and keep everyone on the
            same page.
          </p>
        </div>
        <a href="#new-booking" className="button-primary">
          ＋ New reservation
        </a>
      </div>
      <Suspense
        fallback={
          <p role="status" className="mt-10">
            Loading reservations…
          </p>
        }
      >
        <BookingContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BookingContent({ searchParams }: { searchParams: Search }) {
  await connection();
  const params = await searchParams;
  const startsAt = typeof params.startsAt === "string" ? params.startsAt : "";
  const endsAt = typeof params.endsAt === "string" ? params.endsAt : "";
  const filterRequested =
    params.startsAt !== undefined || params.endsAt !== undefined;
  const start = parseColomboTime(startsAt);
  const end = parseColomboTime(endsAt);
  const filterError =
    filterRequested && (!start || !end || end <= start || start <= new Date())
      ? "Choose a valid future start and an end after the start."
      : "";
  const filtering = filterRequested && !filterError && !!start && !!end;
  let resources;
  let bookings: Reservation[];
  let cancelled: Reservation[];
  try {
    [resources, bookings, cancelled] = await Promise.all([
      filtering
        ? getDb()
            .query<Resource>(
              `SELECT s.id, s.name, s.description, s.location, s.is_active FROM resources s
        WHERE s.is_active AND NOT EXISTS (
          SELECT 1 FROM reservations r WHERE r.resource_id = s.id AND r.status = 'confirmed'
          AND r.starts_at < $2::timestamptz AND r.ends_at > $1::timestamptz
        ) ORDER BY s.name, s.id`,
              [start!.toISOString(), end!.toISOString()],
            )
            .then((result) => result.rows)
        : listResources(),
      getDb()
        .query<Reservation>(
          `SELECT r.id, s.name AS resource_name, r.requester_name, r.purpose, r.starts_at, r.ends_at
        FROM reservations r JOIN resources s ON s.id = r.resource_id
        WHERE r.status = 'confirmed' AND r.ends_at > now() ORDER BY r.starts_at, r.id LIMIT 100`,
        )
        .then((result) => result.rows),
      getDb()
        .query<Reservation>(
          `SELECT r.id, s.name AS resource_name, r.requester_name, r.purpose, r.starts_at, r.ends_at
        FROM reservations r JOIN resources s ON s.id = r.resource_id
        WHERE r.status = 'cancelled' ORDER BY r.starts_at DESC, r.id LIMIT 50`,
        )
        .then((result) => result.rows),
    ]);
  } catch {
    return (
      <p
        role="alert"
        className="mt-10 rounded-xl border border-amber-300 bg-amber-50 p-6"
      >
        Reservations are temporarily unavailable. Please try again shortly.
      </p>
    );
  }
  return (
    <>
      <section
        aria-labelledby="availability-heading"
        className="availability-panel"
      >
        <h2 id="availability-heading" className="text-xl font-semibold">
          Find available resources
        </h2>
        <p id="availability-help" className="mt-2 text-sm text-slate-600">
          Choose a time in Sri Lanka time to show only free resources in the
          booking form.
        </p>
        <form
          action="/reservations"
          method="get"
          className="mt-5 flex flex-wrap items-end gap-4"
        >
          <div>
            <label
              htmlFor="available-start"
              className="block text-sm font-medium"
            >
              Available from
            </label>
            <input
              id="available-start"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={startsAt}
              aria-describedby="availability-help"
              className="mt-2 rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="available-end"
              className="block text-sm font-medium"
            >
              Available until
            </label>
            <input
              id="available-end"
              name="endsAt"
              type="datetime-local"
              required
              defaultValue={endsAt}
              aria-describedby="availability-help"
              className="mt-2 rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            className="rounded-lg bg-teal-800 px-4 py-2.5 font-semibold text-white"
            type="submit"
          >
            Check availability
          </button>
          <Link
            href="/reservations"
            className="py-2 text-sm text-teal-800 underline"
          >
            Clear filter
          </Link>
        </form>
        {filterError && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {filterError}
          </p>
        )}
        {filtering && (
          <p role="status" className="mt-4 text-sm font-medium text-teal-800">
            {resources.length} active{" "}
            {resources.length === 1 ? "resource is" : "resources are"} free for
            the selected time. Availability is checked again when you book.
          </p>
        )}
      </section>
      <div className="directory-layout">
        <section aria-labelledby="upcoming">
          <div className="section-heading">
            <h2 id="upcoming">Upcoming & ongoing</h2>
            <span>{bookings.length} shown</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Showing the next 100 confirmed reservations.
          </p>
          {bookings.length ? (
            <ul className="mt-5 space-y-4">
              {bookings.map((booking) => (
                <li key={booking.id} className="booking-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="break-words">{booking.resource_name}</h3>
                    <span className="status-badge status-active">
                      Confirmed
                    </span>
                  </div>
                  <p className="booking-time mt-3 font-medium text-teal-800">
                    <time dateTime={booking.starts_at.toISOString()}>
                      {dateFormat.format(booking.starts_at)}
                    </time>{" "}
                    –{" "}
                    <time dateTime={booking.ends_at.toISOString()}>
                      {dateFormat.format(booking.ends_at)}
                    </time>
                  </p>
                  <p className="mt-3 break-words text-slate-600">
                    {booking.purpose}
                  </p>
                  <p className="mt-2 break-words text-sm text-slate-500">
                    Booked by {booking.requester_name}
                  </p>
                  <CancelForm
                    id={booking.id}
                    resourceName={booking.resource_name}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state mt-5">
              Nothing on the schedule yet.
              <br />
              Your next booking will appear here once confirmed.
            </p>
          )}
          <section
            aria-labelledby="cancelled-heading"
            className="history-panel mt-10"
          >
            <div className="section-heading">
              <h2 id="cancelled-heading">Cancelled bookings</h2>
              <span>{cancelled.length} shown</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              History is preserved. Showing up to 50 bookings, ordered by
              scheduled start.
            </p>
            {cancelled.length ? (
              <ul className="mt-5 space-y-4">
                {cancelled.map((booking) => (
                  <li
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <h3 className="flex flex-wrap justify-between gap-3 break-words font-semibold">
                      {booking.resource_name}{" "}
                      <span className="status-badge status-inactive">
                        Cancelled
                      </span>
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {dateFormat.format(booking.starts_at)} –{" "}
                      {dateFormat.format(booking.ends_at)}
                    </p>
                    <p className="mt-2 break-words text-sm text-slate-600">
                      {booking.purpose} · {booking.requester_name}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No cancelled bookings.
              </p>
            )}
          </section>
        </section>
        <section aria-labelledby="new-booking" className="form-panel">
          <h2 id="new-booking" className="scroll-mt-40">
            New reservation
          </h2>
          <p>Reserve a resource for your next meeting or project.</p>
          <BookingForm
            key={filtering ? `${startsAt}/${endsAt}` : "all"}
            initialTimes={filtering ? { startsAt, endsAt } : undefined}
            resources={resources
              .filter((resource) => resource.is_active)
              .map(({ id, name, location }) => ({ id, name, location }))}
          />
        </section>
      </div>
    </>
  );
}
