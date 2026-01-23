# Adding Demo Members to Members Page

If you don't see any members on the Members page, follow these steps:

## Step 1: Create Auth Users

Go to **Supabase Dashboard → Authentication → Users → Add User** and create these users:

### Core 6 Users (Required):
1. **admin@example.com** / Password: `DemoAdmin123!`
2. **eboard@example.com** / Password: `DemoEBoard123!`
3. **chair@example.com** / Password: `DemoChair123!`
4. **member1@example.com** / Password: `DemoMember123!`
5. **member2@example.com** / Password: `DemoMember123!`
6. **alumni@example.com** / Password: `DemoAlumni123!`

### Additional Members (Optional - for 18 total members):
7-18. **member3@example.com** through **member18@example.com** / Password: `DemoMember123!`

**Note:** When creating users, you can:
- Uncheck "Auto Confirm User" if you want to test email confirmation
- Or check it to skip email confirmation (recommended for demo)

## Step 2: Run the Seed Script

1. Go to **Supabase Dashboard → SQL Editor**
2. Open the file: `supabase/migrations/seed_demo_data.sql`
3. Copy and paste the entire contents into the SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

The script will:
- Create profiles for all auth users that exist
- Assign roles (admin, e_board, committee_chairman, member, alumni)
- Create demo events, tasks, documents, channels, and notifications

## Step 3: Verify Data Was Created

Run these queries in the SQL Editor to verify:

```sql
-- Check total profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- View all profiles with roles
SELECT 
  p.full_name,
  p.email,
  ur.role,
  p.committee
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
ORDER BY p.full_name;

-- Check role distribution
SELECT 
  ur.role,
  COUNT(*) as count
FROM public.user_roles ur
GROUP BY ur.role
ORDER BY count DESC;
```

You should see:
- **6 profiles** if you only created the core 6 users
- **18 profiles** if you created all additional members

## Step 4: Check the Members Page

1. **Make sure you're logged in** to the app (RLS policies require authentication)
2. Navigate to the **Members** page
3. You should now see all the demo members!

## Troubleshooting

### Still don't see members?

1. **Check if you're logged in:**
   - The Members page requires authentication
   - Make sure you're signed in with one of the demo accounts

2. **Verify profiles exist:**
   - Run the verification queries above
   - If count is 0, the seed script didn't run or auth users don't exist

3. **Check browser console:**
   - Open DevTools (F12 or Cmd+Option+I)
   - Check the Console tab for any errors
   - Check the Network tab to see if the API call to fetch profiles is failing

4. **Verify RLS policies:**
   - Make sure you're logged in as an authenticated user
   - RLS policy allows: `auth.uid() IS NOT NULL` for SELECT on profiles

5. **Check Supabase connection:**
   - Verify your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Make sure you're pointing to the correct Supabase project (demo vs production)

## Quick Test

To quickly test if everything is working:

1. Log in as `admin@example.com` / `DemoAdmin123!`
2. Go to Members page
3. You should see at least 6 members (the core demo users)

If you see members, everything is working! If not, check the troubleshooting steps above.
