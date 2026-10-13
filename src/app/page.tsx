import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getDb } from "@/lib/db";

export default function Home() {
  return (
    <main id="main-content" className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE, AT A GLANCE</p>
          <h1>Make room for good work.</h1>
          <p className="page-description">
            Less scheduling back-and-forth. More time for what matters.
          </p>
        </div>
        <Link href="/reservations" className="button-primary">
          ＋ New reservation
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="panel p-8 mt-8" role="status">
            Loading your workspace…
          </div>
        }
      >
        <WorkspaceOverview />
      </Suspense>
      <section className="dashboard-hero">
        <div>
          <span className="hero-tag">A LITTLE PLANNING GOES A LONG WAY</span>
          <h2>
            The right resource.
            <br />
            The right time.
          </h2>
          <p>
            Find a room, grab the equipment you need, and give your team space
            to do their best work.
          </p>
          <Link href="/reservations" className="button-light">
            Find an available resource <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-ring ring-one" />
          <div className="visual-ring ring-two" />
          <div className="visual-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="visual-label">
            ROOM TO DO MORE <span>↗</span>
          </div>
        </div>
      </section>
      <section className="mt-10" aria-labelledby="getting-started">
        <div className="section-heading">
          <h2 id="getting-started">A smoother way to share</h2>
          <span>Three simple steps</span>
        </div>
        <div className="workflow-grid">
          {[
            [
              "01",
              "Explore your resources",
              "Rooms, equipment, and the details that help you pick the right fit.",
              "/resources",
              "Browse resources",
            ],
            [
              "02",
              "Find your time",
              "Check a time window to see which active resources are free.",
              "/reservations",
              "Check availability",
            ],
            [
              "03",
              "Make it official",
              "Reserve your slot. Overlapping bookings are automatically prevented.",
              "/reservations",
              "Make a reservation",
            ],
          ].map(([step, title, text, href, label]) => (
            <article key={step} className="workflow-card">
              <span className="step-number">{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href={href}>
                {label} <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

async function WorkspaceOverview() {
  await connection();
  let stats;
  let upcoming;
  try {
    [stats, upcoming] = await Promise.all([
      getDb()
        .query<{
          total: number;
          active: number;
          upcoming: number;
          cancelled: number;
        }>(
          `SELECT
        (SELECT count(*)::int FROM resources) AS total,
        (SELECT count(*)::int FROM resources WHERE is_active) AS active,
        (SELECT count(*)::int FROM reservations WHERE status='confirmed' AND ends_at>now()) AS upcoming,
        (SELECT count(*)::int FROM reservations WHERE status='cancelled') AS cancelled`,
        )
        .then((r) => r.rows[0]),
      getDb()
        .query<{
          id: string;
          name: string;
          starts_at: Date;
          requester_name: string;
        }>(
          `SELECT r.id,s.name,r.starts_at,r.requester_name FROM reservations r JOIN resources s ON s.id=r.resource_id WHERE r.status='confirmed' AND r.ends_at>now() ORDER BY r.starts_at LIMIT 3`,
        )
        .then((r) => r.rows),
    ]);
  } catch {
    return (
      <p role="alert" className="feedback-error mt-8">
        Workspace information is temporarily unavailable. Please try again
        shortly.
      </p>
    );
  }
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <>
      <section className="stats-grid" aria-label="Workspace totals">
        {[
          ["Total resources", stats.total, "Rooms and equipment", "▤"],
          ["Active resources", stats.active, "In service for bookings", "↗"],
          ["Upcoming & ongoing", stats.upcoming, "Confirmed reservations", "◷"],
          [
            "Cancelled bookings",
            stats.cancelled,
            "History kept for reference",
            "↶",
          ],
        ].map(([label, value, description, icon]) => (
          <article className="stat-card" key={label}>
            <div>
              <span>{label}</span>
              <span className="stat-icon" aria-hidden="true">
                {icon}
              </span>
            </div>
            <strong>{value}</strong>
            <p>{description}</p>
          </article>
        ))}
      </section>
      <section className="panel upcoming-preview">
        <div className="section-heading">
          <h2>Coming up next</h2>
          <Link href="/reservations">View reservations ↗</Link>
        </div>
        {upcoming.length ? (
          <ul>
            {upcoming.map((booking) => (
              <li key={booking.id}>
                <span className="preview-icon" aria-hidden="true">
                  ◷
                </span>
                <div>
                  <strong>{booking.name}</strong>
                  <p>{booking.requester_name}</p>
                </div>
                <time dateTime={booking.starts_at.toISOString()}>
                  {format.format(booking.starts_at)}
                </time>
                <span className="status-badge status-active">Confirmed</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="preview-empty">
            <span aria-hidden="true">◷</span>
            <div>
              <strong>Your schedule has room.</strong>
              <p>
                No upcoming bookings yet. Start with your next team meeting.
              </p>
            </div>
            <Link href="/reservations">Book a resource ↗</Link>
          </div>
        )}
      </section>
    </>
  );
}
