# LinkedIn enrichment for alumni

This project fills `linkedin_url` and **pulls profile pictures and career info** (company, position, industry, location) in two ways: manually via “Find on LinkedIn” in the app, and via the automated Proxycurl script.

## 1. In-app: “Find on LinkedIn”

On the **Alumni** page, each alumni card has:

- **Mail** – opens the default email client (if present).
- **LinkedIn** – if `linkedin_url` is set, opens that profile in a new tab.
- **Find on LinkedIn** – if `linkedin_url` is missing, opens LinkedIn People Search by full name so you can find the profile and add the URL manually.

No API key or credits are used for “Find on LinkedIn”.

## 2. Automated enrichment script

The script `scripts/enrich-alumni-linkedin.js` uses [Proxycurl](https://nubela.co/proxycurl):

1. **Person Lookup** – resolves `linkedin_url` from first name, last name, and `company_domain=howard.edu` when an alumnus has no LinkedIn URL.
2. **Profile API** – for each alumnus with a LinkedIn URL (existing or just resolved), fetches full profile and updates:
   - `avatar_url` (profile picture)
   - `current_company` / `current_position` (from occupation or current experience)
   - `industry`
   - `location` (city, state, country)

So the script both **resolve URLs** and **pull pictures and info** from LinkedIn into alumni profiles.

### Proxycurl setup

1. Sign up at [Proxycurl](https://nubela.co/proxycurl/auth/register) and get an API key from the [dashboard](https://nubela.co/proxycurl/dashboard).
2. Add credits. **Person Lookup**: 2 credits per successful resolve (0 with `similarity_checks=skip` when no result). **Profile API**: 1 credit per profile fetched. `use_cache=if-present` is used to reduce cost when cached.

### Required environment variables

| Variable | Description |
|----------|-------------|
| `PROXYCURL_API_KEY` | Your Proxycurl API key (Bearer token). |
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service role** key. Required so the script can update `alumni` regardless of RLS. |

Keep the service role key secret; use only in secure, server-side or script environments.

### How to run

From the project root:

```bash
export PROXYCURL_API_KEY="your-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npm run enrich-linkedin
```

Or use a `.env` and run:

```bash
node -r dotenv/config scripts/enrich-alumni-linkedin.js
```

### What the script does

1. Fetches **all** alumni.
2. For each alumnus **without** `linkedin_url`: calls Person Lookup (first + last name, `company_domain=howard.edu`, `similarity_checks=skip`). If a URL is returned, updates `alumni.linkedin_url`.
3. For each alumnus **with** a LinkedIn URL (existing or just set): calls the **Profile API** (`use_cache=if-present`), then updates `avatar_url`, `current_company`, `current_position`, `industry`, and `location` when present.
4. Waits 2 seconds between Proxycurl calls; on 429, sleeps and retries.

Profile pictures are stored as returned by Proxycurl. Some image URLs are temporary (e.g. 30 minutes); re-running the script periodically will refresh them. You can later add re-hosting to Supabase Storage if you need permanent URLs.

### Changing the school/company domain

Edit `COMPANY_DOMAIN` in `scripts/enrich-alumni-linkedin.js` (default `howard.edu`).

### Rate limits and credits

- **Proxycurl**: trial limits (e.g. 2 req/min); paid plans higher. The script uses a 2 s delay and backs off on 429.
- **Credits**: Person Lookup 2 per successful resolve (0 with `similarity_checks=skip` when no result). Profile API 1 per profile; `use_cache=if-present` uses cache when available.

See [Proxycurl docs](https://nubela.co/proxycurl/docs) and pricing.

---

## 3. Free alternatives (no Proxycurl, no cost)

You can get **profile pictures** and **career info** without paying for Proxycurl:

### Avatars (pictures)

| Method | What it does | Cost |
|--------|----------------|-----|
| **Gravatar** | Use alumni email → [Gravatar](https://gravatar.com) profile image. Many professionals use the same email for Gravatar. | Free |
| **Gravatar enrichment script** | `npm run enrich-gravatar` — checks each alumnus’s email against Gravatar; if found, writes `avatar_url` to the DB. Uses only Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`); no Proxycurl or other API keys. | Free |
| **UI Avatars fallback** | When `avatar_url` is missing, the Alumni page shows a generated avatar from [UI Avatars](https://ui-avatars.com) (initials + color). No script, no keys. | Free |
| **Manual upload** | Admins or alumni add a photo via Profile / edit flows (e.g. Supabase Storage). | Free |

### Career info (company, position, location)

| Method | What it does | Cost |
|--------|----------------|-----|
| **Manual entry** | Use **Add Alumni** and edit forms: paste LinkedIn URL, type **Company**, **Position**, **Location**. No automation. | Free |
| **“Find on LinkedIn”** | Open LinkedIn search by name, find the profile, paste the URL. Then fill company/position manually if needed. | Free |

### Optional: free link-preview APIs

Some services (e.g. [LinkPreview.net](https://www.linkpreview.net), [JsonLink](https://jsonlink.io)) have free tiers that return `og:image` for a URL. You could, when a user saves a LinkedIn URL, call one of these, get the image URL, and set `avatar_url`. **Caveats**: LinkedIn often blocks or limits such requests; results may be inconsistent. Use only if you’re okay with that.

### Run the Gravatar script

Requires only Supabase (no Proxycurl):

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npm run enrich-gravatar
```

Or with a `.env`: `node -r dotenv/config scripts/enrich-alumni-gravatar.js`.

### Summary

- **Pictures**: Run `npm run enrich-gravatar` for Gravatar-based avatars; rely on UI Avatars when no `avatar_url`. Add manual upload where available.
- **Info**: Rely on manual entry (LinkedIn URL, company, position, location) and “Find on LinkedIn” — no Proxycurl required.
