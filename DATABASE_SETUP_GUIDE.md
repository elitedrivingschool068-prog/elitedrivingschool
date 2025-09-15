# Database Setup and Fix Guide

This guide explains the database issues found and how to fix them.

## Issues Identified

1. **Critical: Missing RLS Policies** - Tables had RLS enabled but no policies defined
2. **Schema Inconsistencies** - Database types didn't match actual schema
3. **Missing Tables** - `instructors` and `instructor_reviews` tables were missing
4. **Missing Fields** - Bookings table was missing key fields
5. **No Profile Creation Trigger** - Users weren't getting profiles created automatically

## Fix Applied

A comprehensive migration has been created: `20250914171416_fix_schema_and_add_rls_policies.sql`

### What the Migration Does:

1. **Updates Profiles Table:**
   - Adds `profile_pic_url` field
   - Adds `role` field (default: 'user')

2. **Updates Bookings Table:**
   - Removes old `lesson_date` and `lesson_time` fields
   - Adds `instructor_id`, `lesson_slot_id`, `start_time`, and `status` fields

3. **Creates Missing Tables:**
   - `instructors` table for instructor-specific data
   - `instructor_reviews` table for ratings and reviews

4. **Adds Comprehensive RLS Policies:**
   - Users can read/update their own profiles
   - Public can read instructor profiles
   - Users can manage their own bookings
   - Instructors can see their assigned bookings
   - Admins can manage everything
   - Public access to instructor reviews

5. **Creates Profile Trigger:**
   - Automatically creates a profile when a user signs up

6. **Performance Indexes:**
   - Added indexes on commonly queried fields

## How to Apply the Fix

### Step 1: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Run the Migration

You have several options:

#### Option A: Using Supabase CLI (Recommended)
```bash
# If you have Supabase CLI installed
supabase db push
```

#### Option B: Manual SQL Execution
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250914171416_fix_schema_and_add_rls_policies.sql`
4. Execute the SQL

#### Option C: Using Migration Files
```bash
# If using local development
supabase migration up
```

### Step 3: Regenerate Database Types

After running the migration, regenerate your database types:

```bash
# Using Supabase CLI
supabase gen types typescript --local > src/lib/database.types.ts

# Or for remote database
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

### Step 4: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test these key functions:
   - User signup (should create profile automatically)
   - User login
   - Booking creation (via `/book-lesson?instructorId=some-id`)
   - Profile updates
   - Admin functions (if you have admin access)

## Post-Migration Verification

### Check RLS Policies
Run this query in Supabase SQL editor to verify policies exist:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Tables and Columns
```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

### Test Basic Operations
Try these operations to ensure everything works:

1. **Sign up a new user** - Should create profile automatically
2. **Create a booking** - Should work with instructor selection
3. **View dashboard** - Should show user's bookings
4. **Admin panel** - Should work for admin users

## Troubleshooting

### Issue: "relation does not exist" errors
- Make sure the migration has been applied successfully
- Check that all tables exist in your database

### Issue: "insufficient privileges" errors
- Verify RLS policies have been created
- Check that your user has the correct role

### Issue: Type errors in TypeScript
- Regenerate database types after migration
- Make sure new fields are reflected in types

### Issue: Booking form doesn't work
- Use `/book-lesson?instructorId=INSTRUCTOR_ID` instead of generic BookingForm
- The BookLessonClientPage component is properly implemented

## Migration Summary

### Tables Created/Updated:
- ✅ `profiles` - Updated with role and profile_pic_url
- ✅ `bookings` - Updated structure, added status and proper time fields  
- ✅ `instructors` - New table for instructor data
- ✅ `instructor_reviews` - New table for reviews

### RLS Policies Added:
- ✅ 4 policies for `profiles` table
- ✅ 6 policies for `bookings` table  
- ✅ 3 policies for `instructors` table
- ✅ 5 policies for `instructor_reviews` table

### Functions & Triggers:
- ✅ `handle_new_user()` function
- ✅ `on_auth_user_created` trigger

### Indexes Added:
- ✅ 6 performance indexes on commonly queried fields

The database should now be fully functional with proper security and all necessary features!