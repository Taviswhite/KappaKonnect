# Vulnerability Scanner Integration

The admin panel can **run the vulnerability scanner** and show results under **Admin → Overview → System & upcoming issues**.

## 1. Add missing module to your scanner project

Your `main.py` imports `ScannerEngine` from `src.scanner_engine`. If that file is missing:

- Copy `scanner_engine.py` from this folder into your vulnerability-scanner project as **`src/scanner_engine.py`**.

## 2. Run the scanner as an HTTP server

From your **vulnerability-scanner** project root:

```bash
cd "/Users/Tavis/Downloads/OKComputer_Test Home Network & Scanner/projects/vulnerability-scanner"
pip install flask   # if needed
python /path/to/remix-of-crimson-connect/scripts/scanner-integration/http_server.py
```

Or pass the scanner path:

```bash
python /path/to/remix-of-crimson-connect/scripts/scanner-integration/http_server.py "/Users/Tavis/Downloads/OKComputer_Test Home Network & Scanner/projects/vulnerability-scanner"
```

The server listens on **http://0.0.0.0:5050**. It exposes:

- **POST /scan** – body: `{ "target": "192.168.1.1", "quick": true }` – runs a scan and returns JSON.
- **GET /health** – returns `{ "status": "ok" }`.

## 3. Expose the server to the internet (for Supabase Edge Function)

The Edge Function runs in the cloud and must be able to call your scanner. Options:

- **ngrok** (local testing): `ngrok http 5050` → use the HTTPS URL (e.g. `https://abc123.ngrok.io/scan`) as `SCANNER_URL`.
- **Deploy** the scanner server (e.g. Railway, Render, Fly) and use that app’s `/scan` URL.

## 4. Configure Supabase

1. **Run the migration** (if not already applied):
   - Apply `supabase/migrations/vulnerability_scan_results.sql` to your Supabase project.

2. **Deploy the Edge Function** (with `--no-verify-jwt` so the app can call it using the anon key; only admin/e_board see the Run scan button):
   ```bash
   supabase functions deploy run-vulnerability-scan --no-verify-jwt
   ```

3. **Set the scanner URL** in Supabase Dashboard → Edge Functions → run-vulnerability-scan → Secrets:
   - **SCANNER_URL** = full URL to your scanner’s `/scan` endpoint (e.g. `https://abc123.ngrok.io/scan`).

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set automatically for Edge Functions.

## 5. Use it in the app

1. Log in as admin or e_board.
2. Go to **Admin → Overview**.
3. Click **Run scan** in the “System & upcoming issues” card.
4. The app calls the Edge Function → Edge Function calls your scanner URL → results are saved and shown in the same card.

The latest scan replaces the previous one in the list.
