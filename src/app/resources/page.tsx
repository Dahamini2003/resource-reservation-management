import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { listResources, type Resource } from "@/lib/resources";
import { ResourceForm } from "./resource-form";

export const metadata = { title: "Resources | Resource Reservation" };

export default function ResourcesPage() {
  return (
    <main id="main-content" className="page-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">A PLACE FOR EVERYTHING</p>
          <h1>Your shared resources</h1>
          <p className="page-description">
            Keep rooms and equipment organized, so everyone knows what’s
            available to book.
          </p>
        </div>
        <Link href="/reservations" className="button-primary">
          ＋ Make a reservation
        </Link>
      </div>
      <Suspense
        fallback={
          <p role="status" className="mt-10 text-slate-600">
            Loading resources…
          </p>
        }
      >
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
      <section
        className="mt-10 rounded-2xl border border-amber-300 bg-amber-50 p-6"
        aria-labelledby="database-unavailable"
      >
        <h2 id="database-unavailable" className="text-lg font-semibold">
          Resources are temporarily unavailable
        </h2>
        <p className="mt-2 leading-7 text-slate-700">
          The resource database could not be reached. Please try again shortly
          or contact the person managing this application.
        </p>
        <Link
          href="/resources"
          className="mt-4 inline-block font-semibold text-teal-800 underline underline-offset-4"
        >
          Try again
        </Link>
      </section>
    );
  }

  return (
    <div className="directory-layout">
      <section aria-labelledby="resource-list">
        <div className="section-heading">
          <h2 id="resource-list" className="text-xl font-semibold">
            Resource directory
          </h2>
          <span className="text-sm text-slate-500">
            {resources.length}{" "}
            {resources.length === 1 ? "resource" : "resources"}
          </span>
        </div>
        <div className="mini-summary">
          <span>
            {resources.filter((resource) => resource.is_active).length} active
          </span>
          <span>
            {resources.filter((resource) => !resource.is_active).length}{" "}
            inactive
          </span>
        </div>
        {resources.length ? (
          <ul className="mt-5 space-y-4">
            {resources.map((resource) => (
              <li key={resource.id} className="resource-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="break-words text-lg font-semibold">
                    {resource.name}
                  </h3>
                  <span
                    className={`status-badge ${resource.is_active ? "status-active" : "status-inactive"}`}
                  >
                    {resource.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="resource-location break-words">
                  {resource.location}
                </p>
                {resource.description && (
                  <p className="resource-description whitespace-pre-wrap break-words">
                    {resource.description}
                  </p>
                )}
                <details className="mt-5 border-t border-slate-100 pt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-teal-800">
                    Edit resource
                  </summary>
                  <ResourceForm resource={resource} />
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state mt-5">
            Your resource directory starts here.
            <br />
            Add your first room or piece of equipment using the form.
          </p>
        )}
      </section>
      <section aria-labelledby="add-resource" className="form-panel">
        <h2 id="add-resource" className="text-xl font-semibold">
          Add a resource
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Give your team enough detail to choose the right resource.
        </p>
        <ResourceForm />
      </section>
    </div>
  );
}
