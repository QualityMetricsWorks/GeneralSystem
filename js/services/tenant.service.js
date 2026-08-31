import { supabase } from "./supabase.js";
import { ENV } from "../config/env.js";

/**
 * GUVEL tenant rule:
 * <tenant>.guvelsystems.com
 *
 * development is a valid tenant during the current development phase.
 */
export function getTenantFromHost(){
  const host = window.location.hostname.toLowerCase();

  if (host === "localhost" || host === "127.0.0.1") {
    return new URLSearchParams(window.location.search).get("tenant") || "development";
  }

  const suffix = "." + ENV.ROOT_DOMAIN.toLowerCase();
  if (!host.endsWith(suffix)) return null;

  const prefix = host.slice(0, -suffix.length);

  // One tenant label only:
  // development.guvelsystems.com -> development
  if (!prefix || prefix.includes(".")) return null;

  return prefix;
}

export async function resolveTenant(slug){
  const { data, error } = await supabase
    .from("companies")
    .select("id,name,slug,code,timezone,status")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(`No active GUVEL environment was found for "${slug}". Verify the company bootstrap.`);
  }

  return data;
}