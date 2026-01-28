#!/usr/bin/env node
/**
 * Enrich alumni with LinkedIn URLs, profile pictures, and career info via Proxycurl.
 * 1. Person Lookup: resolve linkedin_url from name + company domain when missing.
 * 2. Profile API: fetch full profile (photo, occupation, company, industry, location) and update alumni.
 * Requires: PROXYCURL_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node scripts/enrich-alumni-linkedin.js
 * Or: node -r dotenv/config scripts/enrich-alumni-linkedin.js
 */
import { createClient } from "@supabase/supabase-js";

const PROXYCURL_API_KEY = process.env.PROXYCURL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PERSON_LOOKUP_URL = "https://nubela.co/proxycurl/api/linkedin/profile/resolve";
const PROFILE_URL = "https://nubela.co/proxycurl/api/v2/linkedin";
const RATE_MS = 2000;
const COMPANY_DOMAIN = "howard.edu";

function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

function parseName(fullName) {
  if (!fullName || typeof fullName !== "string") return { first: "", last: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function personLookup(apiKey, first, last, companyDomain = COMPANY_DOMAIN) {
  const params = new URLSearchParams({
    company_domain: companyDomain,
    first_name: first || "Unknown",
    similarity_checks: "skip",
  });
  if (last) params.set("last_name", last);
  const res = await fetch(`${PERSON_LOOKUP_URL}?${params}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (res.status === 429) {
    const retry = res.headers.get("retry-after") || "60";
    throw new Error(`RATE_LIMIT:${retry}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const url = data?.url ?? null;
  return url;
}

async function fetchProfile(apiKey, linkedinUrl) {
  const params = new URLSearchParams({
    linkedin_profile_url: linkedinUrl,
    use_cache: "if-present",
  });
  const res = await fetch(`${PROFILE_URL}?${params}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (res.status === 429) {
    const retry = res.headers.get("retry-after") || "60";
    throw new Error(`RATE_LIMIT:${retry}`);
  }
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

function deriveUpdates(profile) {
  const out = {};
  const pic = profile?.profile_pic_url;
  if (pic && /^https?:\/\//i.test(pic)) out.avatar_url = pic;

  const occ = profile?.occupation;
  if (occ && typeof occ === "string") {
    const at = occ.indexOf(" at ");
    if (at > 0) {
      out.current_position = occ.slice(0, at).trim();
      out.current_company = occ.slice(at + 4).trim();
    } else {
      out.current_position = occ;
    }
  }
  const exp = profile?.experiences;
  if (Array.isArray(exp) && exp.length > 0 && (!out.current_company || !out.current_position)) {
    const cur = exp.find((e) => !e.ends_at) || exp[0];
    if (cur) {
      if (!out.current_company && cur.company) out.current_company = cur.company;
      if (!out.current_position && cur.title) out.current_position = cur.title;
    }
  }

  if (profile?.industry && typeof profile.industry === "string") out.industry = profile.industry;
  const parts = [profile?.city, profile?.state, profile?.country_full_name || profile?.country].filter(Boolean);
  if (parts.length) out.location = parts.join(", ");
  return out;
}

async function main() {
  requireEnv("PROXYCURL_API_KEY");
  requireEnv("SUPABASE_URL");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = process.env.PROXYCURL_API_KEY;
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: rows, error: fetchErr } = await supabase
    .from("alumni")
    .select("id, full_name, email, linkedin_url, avatar_url, current_company, current_position, industry, location");

  if (fetchErr) {
    console.error("Supabase fetch error:", fetchErr.message);
    process.exit(1);
  }

  const alumni = (rows || []).filter((a) => a.full_name && String(a.full_name).trim() !== "");
  console.log(`Processing ${alumni.length} alumni.`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < alumni.length; i++) {
    const alum = alumni[i];
    let linkedinUrl = alum.linkedin_url && /^https?:\/\/(www\.)?linkedin\.com\/in\//i.test(alum.linkedin_url)
      ? alum.linkedin_url
      : null;

    if (!linkedinUrl) {
      const { first, last } = parseName(alum.full_name);
      if (!first) {
        console.log(`[${i + 1}/${alumni.length}] Skip (no name): ${alum.full_name}`);
        continue;
      }
      try {
        linkedinUrl = await personLookup(apiKey, first, last);
      } catch (e) {
        const msg = e?.message || String(e);
        if (msg.startsWith("RATE_LIMIT")) {
          const sec = parseInt(msg.split(":")[1], 10) || 60;
          console.warn(`Rate limited. Sleeping ${sec}s...`);
          await sleep(sec * 1000);
          i--;
          continue;
        }
        console.warn(`[${i + 1}/${alumni.length}] Lookup error ${alum.full_name}:`, msg);
        failed++;
        if (i < alumni.length - 1) await sleep(RATE_MS);
        continue;
      }
      if (!linkedinUrl) {
        console.log(`[${i + 1}/${alumni.length}] No LinkedIn for ${alum.full_name}`);
        if (i < alumni.length - 1) await sleep(RATE_MS);
        continue;
      }
      const { error: u0 } = await supabase
        .from("alumni")
        .update({ linkedin_url: linkedinUrl })
        .eq("id", alum.id);
      if (u0) {
        console.warn(`[${i + 1}/${alumni.length}] Failed to set linkedin_url for ${alum.full_name}:`, u0.message);
        failed++;
        if (i < alumni.length - 1) await sleep(RATE_MS);
        continue;
      }
      updated++;
    }

    try {
      const profile = await fetchProfile(apiKey, linkedinUrl);
      if (!profile) {
        console.log(`[${i + 1}/${alumni.length}] No profile for ${alum.full_name}`);
        if (i < alumni.length - 1) await sleep(RATE_MS);
        continue;
      }
      const updates = deriveUpdates(profile);
      if (Object.keys(updates).length === 0) {
        if (i < alumni.length - 1) await sleep(RATE_MS);
        continue;
      }
      const { error: u1 } = await supabase.from("alumni").update(updates).eq("id", alum.id);
      if (u1) {
        console.warn(`[${i + 1}/${alumni.length}] Update failed ${alum.full_name}:`, u1.message);
        failed++;
      } else {
        const k = Object.keys(updates).join(", ");
        console.log(`[${i + 1}/${alumni.length}] Enriched ${alum.full_name} -> ${k}`);
        updated++;
      }
    } catch (e) {
      const msg = e?.message || String(e);
      if (msg.startsWith("RATE_LIMIT")) {
        const sec = parseInt(msg.split(":")[1], 10) || 60;
        console.warn(`Rate limited. Sleeping ${sec}s...`);
        await sleep(sec * 1000);
        i--;
        continue;
      }
      console.warn(`[${i + 1}/${alumni.length}] Error ${alum.full_name}:`, msg);
      failed++;
    }

    if (i < alumni.length - 1) await sleep(RATE_MS);
  }

  console.log(`Done. Enriched/updated: ${updated}, errors: ${failed}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
