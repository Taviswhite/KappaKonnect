# Create Auth Users - Complete Guide

## Quick Method: Supabase Dashboard

1. Go to **Supabase Dashboard → Authentication → Users → Add User**
2. For each user below, click "Add User" and enter:
   - **Email**: (from list below)
   - **Password**: (use the suggested password or your own)
   - **Check "Auto Confirm User"** ✅ (important!)

## Admin Account

1. **admin@example.com**
   - Password: `DemoAdmin123!`
   - Role: Admin

## E-Board Positions (7 members)

1. **jeremiah@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Strategist)

2. **bryce@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Polemarch)

3. **mael@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Vice Polemarch)

4. **doole@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Keeper of exchequer)

5. **don@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Keeper of Records)

6. **carsen@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Historian)

7. **grant@example.com**
   - Password: `DemoEBoard123!`
   - Role: E-Board (Lt. Strategist)

## Committee Chairs (5 members)

1. **malachi@example.com**
   - Password: `DemoChair123!`
   - Role: Committee Chair (Guide Right Chairman)

2. **jordan@example.com**
   - Password: `DemoChair123!`
   - Role: Committee Chair (Community Service Chairman)

3. **jared@example.com**
   - Password: `DemoChair123!`
   - Role: Committee Chair (Public Relations Chairman)

4. **skylar@example.com**
   - Password: `DemoChair123!`
   - Role: Committee Chair (Programming Chairman)

5. **kaden@example.com**
   - Password: `DemoChair123!`
   - Role: Committee Chair (Health & Wellness Chairman)

## Additional Members

1. **amir@example.com**
   - Password: `DemoMember123!`
   - Role: Member

2. **dylan@example.com**
   - Password: `DemoAlumni123!`
   - Role: Alumni

3. **ahmod@example.com**
   - Password: `DemoMember123!`
   - Role: Member
   - Name: Ahmod Newton

4. **brian@example.com**
   - Password: `DemoMember123!`
   - Role: Member

5. **kobe@example.com**
   - Password: `DemoMember123!`
   - Role: Member

6. **ahmad@example.com**
   - Password: `DemoAlumni123!`
   - Role: Alumni
   - Name: Ahmad Edwards

7. **gregory@example.com**
   - Password: `DemoMember123!`
   - Role: Member

8. **joseph@example.com**
   - Password: `DemoMember123!`
   - Role: Member

9. **khimarhi@example.com**
   - Password: `DemoMember123!`
   - Role: Member

10. **keith@example.com**
    - Password: `DemoMember123!`
    - Role: Member

11. **joshua@example.com**
    - Password: `DemoMember123!`
    - Role: Member

12. **chase@example.com**
    - Password: `DemoMember123!`
    - Role: Member

13. **daniel@example.com**
    - Password: `DemoMember123!`
    - Role: Member

14. **bryce.facey@example.com**
    - Password: `DemoMember123!`
    - Role: Member
    - Name: Brice Facey

15. **marshall@example.com**
    - Password: `DemoAlumni123!`
    - Role: Alumni

16. **brandon@example.com**
    - Password: `DemoMember123!`
    - Role: Member

17. **mory@example.com**
    - Password: `DemoMember123!`
    - Role: Member

18. **jordan.newsome@example.com**
    - Password: `DemoAlumni123!`
    - Role: Alumni

19. **andre@example.com**
    - Password: `DemoAlumni123!`
    - Role: Alumni

20. **reginald@example.com**
    - Password: `DemoMember123!`
    - Role: Member

## After Creating Auth Users

1. Run the diagnostic script to verify:
   ```sql
   -- Run: supabase/migrations/diagnose_profile_issue.sql
   ```

2. Then create profiles:
   ```sql
   -- Run: supabase/migrations/seed_demo_data.sql
   ```

## Verification Query

After creating auth users, run this to verify:

```sql
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email LIKE '%@example.com'
ORDER BY email;
```

You should see all users listed.
