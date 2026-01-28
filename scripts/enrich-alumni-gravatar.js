#!/usr/bin/env node
/**
 * Enrich alumni avatar_url from Gravatar (free, no API keys).
 * For each alumnus with email: MD5(email) → Gravatar URL; HEAD request;
 * if 200, update alumni.avatar_url.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node scripts/enrich-alumni-gravatar.js
 * Or: node -r dotenv/config scripts/enrich-alumni-gravatar.js
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GRAVATAR_SIZE = 200;
const DELAY_MS = 300;

function requireEnv(name) {
  const v = process.env[name];
  if (!v || String(v).trim() === "") {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

function md5(s) {
  return createHash("md5").update(String(s).trim().toLowerCase()).digest("hex");
}

function gravatarUrl(email) {
  if (!email || !String(email).trim()) return null;
  const hash = md5(email);
  return `https://www.gravatar.com/avatar/${hash}?s=${GRAVATAR_SIZE}&d=404`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function checkGravatarExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  requireEnv("SUPABASE_URL");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: rows, error } = await supabase
    .from("alumni")
    .select("id, full_name, email, avatar_url");

  if (error) {
    console.error("Supabase fetch error:", error.message);
    process.exit(1);
  }

  const alumni = (rows || []).filter((a) => a.email && String(a.email).trim() !== "");
  console.log(`Checking Gravatar for ${alumni.length} alumni with email.`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < alumni.length; i++) {
    const a = alumni[i];
    const url = gravatarUrl(a.email);
    if (!url) {
      skipped++;
      continue;
    }

    const exists = await checkGravatarExists(url);
    if (!exists) {
      if ((i + 1) % 20 === 0) console.log(`[${i + 1}/${alumni.length}] checked...`);
      if (i < alumni.length - 1) await sleep(DELAY_MS);
      continue;
    }

    const { error: err } = await supabase
      .from("alumni")
      .update({ avatar_url: url })
      .eq("id", a.id);

    if (err) {
      console.warn(`[${i + 1}/${alumni.length}] Update failed ${a.full_name}:`, err.message);
    } else {
      console.log(`[${i + 1}/${alumni.length}] ${a.full_name} -> Gravatar`);
      updated++;
    }

    if (i < alumni.length - 1) await sleep(DELAY_MS);
  }

  console.log(`Done. Updated: ${updated}, skipped/no Gravatar: ${alumni.length - updated}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
