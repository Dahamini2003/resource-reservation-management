"use client";

import { useActionState, useId } from "react";
import {
  createResource,
  updateResource,
  type ResourceFormState,
} from "./actions";
import type { Resource } from "@/lib/resources";

const initialState: ResourceFormState = { success: false, message: "" };
const inputClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

export function ResourceForm({ resource }: { resource?: Resource }) {
  const prefix = useId();
  const [state, formAction, pending] = useActionState(
    resource ? updateResource : createResource,
    initialState,
  );
  const values = state.values ?? resource;
  return (
    <form action={formAction} className="mt-5">
      {resource && (
        <input type="hidden" name="resourceId" value={resource.id} />
      )}
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-60">
        <legend className="sr-only">
          {resource ? "Edit resource details" : "New resource details"}
        </legend>
        <div>
          <label htmlFor={`${prefix}-name`} className="text-sm font-medium">
            Resource name <span className="text-slate-500">(required)</span>
          </label>
          <input
            id={`${prefix}-name`}
            name="name"
            required
            maxLength={120}
            defaultValue={values?.name}
            className={inputClass}
            placeholder="Meeting Room C"
            aria-invalid={!!state.errors?.name}
            aria-describedby={
              state.errors?.name ? `${prefix}-name-error` : undefined
            }
          />
          {state.errors?.name && (
            <p
              id={`${prefix}-name-error`}
              className="mt-1 text-sm text-red-700"
            >
              {state.errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${prefix}-location`} className="text-sm font-medium">
            Location <span className="text-slate-500">(required)</span>
          </label>
          <input
            id={`${prefix}-location`}
            name="location"
            required
            maxLength={200}
            defaultValue={values?.location}
            className={inputClass}
            placeholder="First floor"
            aria-invalid={!!state.errors?.location}
            aria-describedby={
              state.errors?.location ? `${prefix}-location-error` : undefined
            }
          />
          {state.errors?.location && (
            <p
              id={`${prefix}-location-error`}
              className="mt-1 text-sm text-red-700"
            >
              {state.errors.location}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={`${prefix}-description`}
            className="text-sm font-medium"
          >
            Description <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            id={`${prefix}-description`}
            name="description"
            maxLength={2000}
            rows={3}
            defaultValue={values?.description}
            className={inputClass}
            placeholder="Capacity, equipment, or other useful details"
            aria-invalid={!!state.errors?.description}
            aria-describedby={
              state.errors?.description
                ? `${prefix}-description-error`
                : undefined
            }
          />
          {state.errors?.description && (
            <p
              id={`${prefix}-description-error`}
              className="mt-1 text-sm text-red-700"
            >
              {state.errors.description}
            </p>
          )}
        </div>
        {resource && (
          <div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={resource.is_active}
                className="h-4 w-4 accent-teal-800"
              />
              Active: allow new reservations
            </label>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Uncheck to take this resource out of service. Existing
              reservations remain confirmed; cancel them separately if needed.
            </p>
          </div>
        )}
        <button
          type="submit"
          className="button-primary w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait"
        >
          {pending ? "Saving…" : resource ? "Save changes" : "Add resource"}
        </button>
      </fieldset>
      <p
        role="status"
        aria-live="polite"
        data-success={state.success}
        className={`form-feedback mt-4 text-sm ${state.success ? "text-teal-800" : "text-red-700"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
