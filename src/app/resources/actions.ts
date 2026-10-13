"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

export type ResourceFormState = {
  success: boolean;
  message: string;
  errors?: Partial<Record<"name" | "location" | "description", string>>;
  values?: { name: string; location: string; description: string };
};

export async function createResource(
  _previousState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const text = (field: string) => {
    const value = formData.get(field);
    return typeof value === "string" ? value.trim() : "";
  };
  const values = {
    name: text("name"),
    location: text("location"),
    description: text("description"),
  };
  const errors: NonNullable<ResourceFormState["errors"]> = {};
  if (!values.name || values.name.length > 120)
    errors.name = "Enter a name between 1 and 120 characters.";
  if (!values.location || values.location.length > 200)
    errors.location = "Enter a location between 1 and 200 characters.";
  if (values.description.length > 2000)
    errors.description = "Keep the description within 2,000 characters.";
  if (Object.keys(errors).length) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
      values,
    };
  }

  try {
    // Parameters keep user input separate from the SQL statement.
    await getDb().query(
      "INSERT INTO resources (name, location, description) VALUES ($1, $2, $3)",
      [values.name, values.location, values.description],
    );
  } catch {
    return {
      success: false,
      message:
        "The resource could not be saved. Check the database connection and try again.",
      values,
    };
  }
  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/reservations");
  return {
    success: true,
    message: `Added ${values.name}.`,
    values: { name: "", location: "", description: "" },
  };
}

export async function updateResource(
  _state: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const text = (key: string) =>
    typeof formData.get(key) === "string"
      ? (formData.get(key) as string).trim()
      : "";
  const id = text("resourceId");
  const values = {
    name: text("name"),
    location: text("location"),
    description: text("description"),
  };
  const errors: NonNullable<ResourceFormState["errors"]> = {};
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return { success: false, message: "Invalid resource. Refresh the page." };
  if (!values.name || values.name.length > 120)
    errors.name = "Enter a name between 1 and 120 characters.";
  if (!values.location || values.location.length > 200)
    errors.location = "Enter a location between 1 and 200 characters.";
  if (values.description.length > 2000)
    errors.description = "Keep the description within 2,000 characters.";
  if (Object.keys(errors).length)
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
      values,
    };
  try {
    const result = await getDb().query(
      "UPDATE resources SET name = $1, location = $2, description = $3, is_active = $4 WHERE id = $5 RETURNING id",
      [
        values.name,
        values.location,
        values.description,
        formData.get("isActive") === "on",
        id,
      ],
    );
    if (!result.rowCount)
      return {
        success: false,
        message: "This resource no longer exists. Refresh the page.",
        values,
      };
  } catch {
    return {
      success: false,
      message: "The resource could not be updated. Please try again.",
      values,
    };
  }
  revalidatePath("/");
  revalidatePath("/resources");
  revalidatePath("/reservations");
  return {
    success: true,
    message: "Resource updated. Existing bookings have been preserved.",
    values,
  };
}
