"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export async function addWineToTracker(wine) {
  const { data, error } = await supabase.from("tracked_wines").insert([wine])

  if (error) {
    console.error("Error adding wine:", error)
    return false
  }

  revalidatePath("/tracker")
  return true
}

export async function removeWineFromTracker(id) {
  const { error } = await supabase.from("tracked_wines").delete().eq("id", id)

  if (error) {
    console.error("Error removing wine:", error)
    return false
  }

  revalidatePath("/tracker")
  return true
}

export async function markWineAsConsumed(id: string) {
  const { error } = await supabase.from("tracked_wines").update({ tracking_status: "consumed" }).eq("id", id)

  if (error) {
    console.error("Error marking wine as consumed:", error)
    return false
  }

  revalidatePath("/tracker")
  return true
}
