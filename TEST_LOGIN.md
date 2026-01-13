# How to Test Login with Email, Username, or Phone Number

## Testing Setup

### 1. Ensure You Have Test Users

Make sure you have at least one user in your database with:
- Email address
- Full name (username)
- Phone number (if testing phone login)
- Password

### 2. Check Your Test User Data

You can check your user data in Supabase:
1. Go to Supabase Dashboard → Your Project → Table Editor
2. Check the `profiles` table to see:
   - `email` - for email login
   - `full_name` - for username login
   - `phone` - for phone number login

---

## Testing Methods

### Method 1: Test with Email (Original Method)

1. **Open your app** (locally: `http://localhost:8080` or your deployed URL)
2. **Go to the login screen** (`/auth`)
3. **Enter email address:**
   - Example: `user@example.com`
4. **Enter password**
5. **Click "Sign In"**
6. **Expected Result:** ✅ Should log in successfully

---

### Method 2: Test with Username (Full Name)

1. **Open your app**
2. **Go to the login screen** (`/auth`)
3. **Enter full name (username):**
   - Use the exact `full_name` from the `profiles` table
   - Example: `John Doe` or `Jane Smith`
   - **Note:** Matching is case-insensitive
4. **Enter password**
5. **Click "Sign In"**
6. **Expected Result:** ✅ Should log in successfully

**Testing Different Cases:**
- `John Doe` (exact match)
- `john doe` (lowercase - should work)
- `JOHN DOE` (uppercase - should work)
- `john` (partial match - should NOT work, requires exact full name)

---

### Method 3: Test with Phone Number

1. **Ensure your test user has a phone number** in the `profiles` table
2. **Open your app**
3. **Go to the login screen** (`/auth`)
4. **Enter phone number:**
   - Can include formatting: `+1 (555) 123-4567`
   - Or just digits: `15551234567`
   - Or with spaces: `1 555 123 4567`
   - **Note:** Must have at least 10 digits
5. **Enter password**
6. **Click "Sign In"**
7. **Expected Result:** ✅ Should log in successfully

**Testing Different Phone Formats:**
- `+1 (555) 123-4567` (with formatting)
- `15551234567` (digits only)
- `555-123-4567` (dash format)
- `5551234567` (no formatting)
- `1 555 123 4567` (with spaces)

---

## Testing Error Cases

### 1. Invalid Email/Username/Phone

1. **Enter invalid identifier:**
   - Example: `nonexistent@email.com`
   - Or: `Fake Name`
   - Or: `1234567890` (phone that doesn't exist)
2. **Enter any password**
3. **Click "Sign In"**
4. **Expected Result:** ❌ Should show error: "Invalid credentials. Please check your email, username, phone number, or password."

---

### 2. Wrong Password

1. **Enter valid email/username/phone**
2. **Enter wrong password**
3. **Click "Sign In"**
4. **Expected Result:** ❌ Should show error about invalid credentials

---

### 3. Missing Phone Number (for phone login)

1. **Use a user that doesn't have a phone number** in the profiles table
2. **Try to login with phone number**
3. **Expected Result:** ❌ Should show error (user not found)

---

## Quick Test Script

### Check Your Test User Data

Run this SQL in Supabase SQL Editor to see your test users:

```sql
SELECT 
  email,
  full_name,
  phone
FROM profiles
LIMIT 10;
```

### Test Data Checklist

- [ ] User has `email` set
- [ ] User has `full_name` set (for username login)
- [ ] User has `phone` set (for phone login)
- [ ] User knows their password

---

## Testing Locally

### 1. Start Development Server

```bash
npm run dev
```

### 2. Open Browser

Go to: `http://localhost:8080/auth`

### 3. Test Each Login Method

Try logging in with:
1. ✅ Email: `your-email@example.com`
2. ✅ Username: `Your Full Name`
3. ✅ Phone: `+1 (555) 123-4567`

---

## Testing in Production

### 1. Deploy Changes

```bash
git add src/pages/Auth.tsx src/contexts/AuthContext.tsx
git commit -m "Add login with email, username, or phone number"
git push origin main
```

### 2. Wait for Deployment

Wait 2-3 minutes for Vercel to deploy

### 3. Test on Deployed Site

Go to your deployed URL: `https://kappaconnect.vercel.app/auth`

Test all three login methods

---

## Common Issues

### Issue: Username login not working

**Solution:**
- Check that `full_name` in profiles table matches exactly (case-insensitive)
- Verify the user exists in the `profiles` table
- Check browser console for errors

### Issue: Phone login not working

**Solution:**
- Ensure user has a `phone` value in the `profiles` table
- Try different phone formats (with/without formatting)
- Phone must have at least 10 digits
- Check browser console for errors

### Issue: All logins failing

**Solution:**
- Verify user exists in `auth.users` table
- Check that profile exists in `profiles` table
- Verify password is correct
- Check browser console for detailed errors
- Check Supabase logs for database errors

---

## Debugging Tips

### 1. Check Browser Console

Open Developer Tools (F12) → Console tab
- Look for error messages
- Check network requests to Supabase

### 2. Check Supabase Logs

1. Go to Supabase Dashboard → Your Project → Logs
2. Look for:
   - Authentication errors
   - Database query errors
   - RLS policy violations

### 3. Verify Database Queries

The login function queries:
- `profiles` table by `phone` (for phone login)
- `profiles` table by `full_name` (for username login)

Make sure:
- RLS policies allow reading profiles
- Data exists in the profiles table
- Queries are working correctly

---

## Expected Behavior Summary

| Input Type | Detection | Lookup Method | Expected Result |
|-----------|-----------|---------------|-----------------|
| Email (contains `@`) | Direct email | None (uses directly) | ✅ Login with email |
| Phone (10+ digits) | Phone number | Query `profiles` by `phone` | ✅ Lookup email, then login |
| Text (no `@`, not phone) | Username | Query `profiles` by `full_name` | ✅ Lookup email, then login |
| Invalid | Not found | - | ❌ Show error message |

---

## Success Criteria

✅ **Email login works** - Can login with email address  
✅ **Username login works** - Can login with full name  
✅ **Phone login works** - Can login with phone number  
✅ **Error handling works** - Shows appropriate error messages  
✅ **Case insensitive** - Username matching works regardless of case  
✅ **Format flexible** - Phone numbers work with various formats  

---

## Next Steps

After testing:
1. ✅ Verify all three methods work
2. ✅ Test error cases
3. ✅ Check browser console for any issues
4. ✅ Deploy to production if everything works
5. ✅ Test on production deployment

Good luck testing! 🚀
