# Upload Avatar Photos (firstname_example.com-*.png)

Your avatar files use the pattern **`firstname_example.com-{uuid}.png`** (e.g. `jared_example.com-f05d9515-442a-41e8-a057-f6ef8a2ca01a.png`). Follow these steps so they show in the app.

## 1. Put photos in a folder

Copy all avatar images into one folder, e.g. `./avatar-photos/`, **keeping the exact filenames** (e.g. `jared_example.com-f05d9515-442a-41e8-a057-f6ef8a2ca01a.png`).

## 2. Upload to Supabase Storage

From the project root, with `.env` (or env) set:

- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

run:

```bash
node scripts/upload-avatars.js ./avatar-photos
```

Or upload manually in **Supabase Dashboard → Storage → avatars**: upload each file into the `avatars` bucket.

## 3. Run the mapping migration

In **Supabase → SQL Editor**, run the contents of:

**`supabase/migrations/map_avatars_firstname_example_com_pattern.sql`**

That migration sets `alumni.avatar_url` to `/avatars/<filename>` for each person when a matching file exists in storage (e.g. `jared_example.com-*.png` → Jared McCain, `joshua_example.com-*.png` → Joshua Bell-Bay, chapter advisors, etc.).

## 4. If nothing changed – run the diagnostic

In **Supabase → SQL Editor**, run (one at a time) the queries in **`supabase/migrations/diagnose_avatars.sql`**:

- **Query 1:** Lists files in the `avatars` bucket. If you get 0 rows, uploads went to a different bucket or the bucket name is wrong.
- **Query 2:** Shows `full_name` and `avatar_url` for sample alumni. If `avatar_url` is still null after the mapping migration, the migration didn’t match.
- **Query 3:** Counts how many alumni have `avatar_url` set.

Fix any mismatch and run the mapping migration again.

## 5. Reload the app

Do a **hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac). Avatars use the path as-is so filenames like `firstname_example.com-xxx.png` load correctly.

---

**Note:** Michael Singleton’s file may be named `micheal.singleton_example.com-*.png` (typo). The migration supports both `michael_example.com-%` and `micheal.singleton_example.com-%`.
