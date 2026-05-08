"use server";

import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export interface UploadGameImageState {
  status: "idle" | "success" | "error";
  message: string | null;
}

export async function uploadGameImage(
  gameId: number,
  _state: UploadGameImageState,
  formData: FormData,
): Promise<UploadGameImageState> {
  const file = formData.get("file");
  const kind = formData.get("kind")?.toString() ?? "cover";
  const isPrimary = formData.get("is_primary")?.toString() ?? "true";

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image file." };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("rpgclub_token")?.value;
  if (!token) {
    return { status: "error", message: "Sign in again before uploading." };
  }

  const railsForm = new FormData();
  railsForm.append("image[file]", file);
  railsForm.append("image[kind]", kind);
  railsForm.append("image[is_primary]", isPrimary);

  const response = await fetch(`${API_URL}/api/v1/games/${gameId}/images`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: railsForm,
  });

  if (!response.ok) {
    return { status: "error", message: await errorMessage(response) };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/games/${gameId}`);
  updateTag("games");
  return { status: "success", message: "Uploaded." };
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message ?? body.error ?? `Upload failed with HTTP ${response.status}.`;
  } catch {
    return `Upload failed with HTTP ${response.status}.`;
  }
}
