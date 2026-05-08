"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";

export async function signOut() {
  try {
    await apiFetch("/auth/logout", { method: "DELETE" });
  } catch {
    // ignore — still clear the local cookie
  }
  const cookieStore = await cookies();
  cookieStore.delete("rpgclub_token");
  redirect("/");
}
