import { supabase } from "./supabase.js";
import { ENV } from "../config/env.js";

export function getTenantFromHost() {
  const host = window.location.hostname.toLowerCase();

  if (host === "localhost" || host === "127.0.0.1") {
    return new URLSearchParams(window.location.search).get("tenant") || "development";
  }

  const suffix = "." + ENV.ROOT_DOMAIN.toLowerCase();
  if (!host.endsWith(suffix)) return null;

  const slug = host.slice(0, -suffix.length);
  if (!slug || slug.includes(".")) return null;

  return slug;
}

/* Compatibility API expected by the existing bootstrap. */
export function getTenant() {
  return getTenantFromHost();
}

export async function resolveTenant(slug) {
  if (!slug) {
    throw new Error("No GUVEL environment was detected from the current URL.");
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id,name,slug,code,status,timezone")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(`GUVEL environment "${slug}" was not found or is inactive.`);
  }

  return data;
}

export async function getResolvedTenant() {
  return resolveTenant(getTenantFromHost());
}
