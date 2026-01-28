# Demo Access Guide

## Option 1: Local Network Access (For Quick Testing)

Your dev server is configured to accept network connections.

### Steps:

1. **Find your Mac's local IP address:**
   ```bash
   ipconfig getifaddr en0
   ```
   Example output: `192.168.1.100`

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Access from phone:**
   - Ensure phone is on same WiFi network as your Mac
   - Open browser on phone
   - Navigate to: `http://YOUR_IP:8080` (replace YOUR_IP with your actual IP)
   - Example: `http://192.168.1.100:8080`

4. **Create QR Code:**
   - Use https://qr.io or https://www.qr-code-generator.com
   - Enter your URL: `http://YOUR_IP:8080`
   - Save/print the QR code
   - Others can scan to access the demo

### Limitations:
- Only works on same WiFi network
- Dev server must be running
- IP may change if you reconnect to WiFi

---

## Option 2: Vercel Deployment (Recommended for Demos)

Your app is deployed to Vercel with a permanent URL.

### Steps:

1. **Find your Vercel URL:**
   - Go to https://vercel.com/dashboard
   - Find your `kappakonnect` project
   - Copy the production URL (e.g., `https://kappakonnect.vercel.app`)

2. **Create QR Code:**
   - Use https://qr.io or https://www.qr-code-generator.com
   - Enter your Vercel URL
   - Save/print the QR code

3. **Share:**
   - Anyone with the QR code can access the demo
   - Works from anywhere with internet
   - No need for local server

### Advantages:
- Works from anywhere
- Always available
- Professional URL
- Automatic HTTPS
- Better performance

---

## Demo Login Credentials

Make sure to provide demo users with login credentials:

**Admin Account:**
- Email: (your admin email)
- Password: (your admin password)

**Demo Users:**
- Create demo accounts in Supabase or
- Share test credentials with demo users

---

## Troubleshooting

### Local Network Access Not Working:

1. **Check firewall:**
   ```bash
   # macOS: Allow incoming connections
   System Settings → Network → Firewall → Firewall Options
   # Allow Node/Vite through firewall
   ```

2. **Verify server is bound to all interfaces:**
   - Check `vite.config.ts`: should have `host: "::"`
   - Restart dev server

3. **Check WiFi network:**
   - Phone and Mac on same network?
   - Some corporate/school WiFi blocks device-to-device communication

### Vercel Deployment Issues:

1. **Push latest changes:**
   ```bash
   git push origin main
   ```
   Vercel auto-deploys on push

2. **Check build logs:**
   - Visit Vercel dashboard
   - Check deployment logs for errors

3. **Environment variables:**
   - Ensure Supabase keys are set in Vercel
   - Go to: Project Settings → Environment Variables

---

## Best Practice for Demos

**Use Vercel deployment + QR code:**
1. Push latest changes to GitHub
2. Wait for Vercel deployment (1-2 minutes)
3. Generate QR code with Vercel URL
4. Test on your phone first
5. Share QR code for demo

This ensures:
- Professional presentation
- No dependency on local network
- Better performance
- HTTPS security
