# Supabase Database Setup Guide

## Complete Database Schema for KappaKonnect

This guide will help you set up all required tables in Supabase for the KappaKonnect application.

---

## 📋 Required Tables

The application uses the following tables:

1. **profiles** - User profile information
2. **user_roles** - User role assignments (admin, officer, member, etc.)
3. **events** - Chapter events and meetings
4. **tasks** - Task management
5. **attendance** - Event attendance tracking
6. **rsvps** - Event RSVPs
7. **channels** - Chat channels
8. **messages** - Chat messages
9. **direct_messages** - Direct messages between users
10. **documents** - Document storage
11. **document_folders** - Document organization
12. **document_signatures** - Document signature tracking
13. **alumni** - Alumni information

---

## 🚀 Quick Setup

### Option 1: Run Complete Migration (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to **SQL Editor**

2. **Run the Complete Setup Migration**:
   - Open `supabase/migrations/000_complete_setup.sql`
   - Copy the entire file
   - Paste into SQL Editor
   - Click **Run**

This single file creates all tables, functions, triggers, and RLS policies.

### Option 2: Run Migrations in Order

If you prefer to run migrations individually:

1. `20260113013210_remix_migration_from_pg_dump.sql` (main schema)
2. `20260113023130_8c674232-3cf4-4b5f-b86a-a25d8eb40dc3.sql` (chat & documents)
3. `add_meeting_link_to_events.sql` (add meeting_link column)
4. `rename_user_roles.sql` (update role enum)
5. `allow_all_users_create_tasks.sql` (task permissions)
6. `restrict_task_assignment.sql` (task assignment restrictions)

---

## 🔍 Verify Tables Exist

After running migrations, verify all tables exist:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- ✅ alumni
- ✅ attendance
- ✅ channels
- ✅ direct_messages
- ✅ document_folders
- ✅ document_signatures
- ✅ documents
- ✅ events
- ✅ messages
- ✅ profiles
- ✅ rsvps
- ✅ tasks
- ✅ user_roles

---

## 🔐 Verify RLS Policies

Check that Row Level Security is enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

---

## ✅ Test Database Connection

After setup, test the connection:

1. **Go to Supabase Dashboard** → **Table Editor**
2. **Verify tables appear** in the sidebar
3. **Check RLS policies** in **Authentication** → **Policies**
4. **Test a query** in SQL Editor:

```sql
-- Test query
SELECT * FROM profiles LIMIT 1;
```

---

## 🎯 Create Your First Admin User

After setting up the database:

1. **Sign up** through the app (creates a profile automatically)
2. **Get your user ID** from Supabase Dashboard → **Authentication** → **Users**
3. **Assign admin role**:

```sql
-- Replace 'your-user-id' with your actual user ID
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'your-user-id';

-- Or insert if no role exists
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 🐛 Troubleshooting

### Issue: Tables don't exist
**Solution**: Run `000_complete_setup.sql` in SQL Editor. Check for errors.

### Issue: RLS policies missing
**Solution**: Re-run the complete setup migration.

### Issue: Functions not found
**Solution**: Ensure `has_role()` and `handle_new_user()` functions exist in SQL Editor.

### Issue: Enum type errors
**Solution**: The complete setup migration includes the correct enum type.

---

## 📊 Table Relationships

```
auth.users
  ├── profiles (1:1)
  ├── user_roles (1:many)
  ├── events.created_by
  ├── tasks.created_by
  ├── tasks.assigned_to
  ├── attendance.user_id
  └── rsvps.user_id

events
  ├── attendance.event_id
  └── rsvps.event_id

channels
  └── messages.channel_id

documents
  ├── document_folders (via folder_id)
  └── document_signatures.document_id
```

---

## 🎯 Next Steps

After database setup:

1. ✅ **Set up environment variables** in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. ✅ **Create your first admin user** (see above)

3. ✅ **Test the application**:
   - Login as admin
   - Create events, tasks, etc.
   - Verify all features work

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

**Your database is now ready!** 🎉
