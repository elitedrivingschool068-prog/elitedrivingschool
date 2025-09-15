-- Rollback problematic changes and apply minimal fix
-- This addresses the core issue while maintaining existing functionality

-- Step 1: Remove all the policies that might be blocking access
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can read instructor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Instructors can read their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

-- Drop policies on new tables if they exist
DROP POLICY IF EXISTS "Public can read instructors" ON public.instructors;
DROP POLICY IF EXISTS "Instructors can update own profile" ON public.instructors;
DROP POLICY IF EXISTS "Admins can manage instructors" ON public.instructors;

DROP POLICY IF EXISTS "Public can read reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.instructor_reviews;

-- Step 2: Temporarily disable RLS to allow existing functionality
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on new tables if they exist
ALTER TABLE IF EXISTS public.instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.instructor_reviews DISABLE ROW LEVEL SECURITY;

-- Step 3: Ensure existing profiles have the role field (but don't break existing data)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS profile_pic_url text;

-- Update existing profiles to have default role if NULL
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Step 4: Add new fields to bookings table BUT keep old fields for backward compatibility
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS instructor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lesson_slot_id uuid,
ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Step 5: Create instructors table for future use (but don't enforce relationships yet)
CREATE TABLE IF NOT EXISTS public.instructors (
  id uuid references public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio text,
  lesson_price numeric,
  rating numeric CHECK (rating >= 0 AND rating <= 5)
);

-- Step 6: Create instructor_reviews table for future use
CREATE TABLE IF NOT EXISTS public.instructor_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  instructor_id uuid references public.instructors(id) ON DELETE CASCADE NOT NULL,
  client_id uuid references public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text text
);

-- Step 7: Add minimal, permissive RLS policies that don't break existing functionality

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_reviews ENABLE ROW LEVEL SECURITY;

-- Very permissive policies to maintain existing functionality
CREATE POLICY "Allow all authenticated access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all authenticated access to bookings" ON public.bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to instructors" ON public.instructors
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to instructor_reviews" ON public.instructor_reviews
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Step 8: Create profile creation trigger (but make it safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING; -- Don't overwrite existing profiles
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Add a function to migrate old booking data to new format (optional)
CREATE OR REPLACE FUNCTION migrate_booking_data()
RETURNS void AS $$
BEGIN
  -- Update bookings that have old format to new format
  UPDATE public.bookings 
  SET start_time = (lesson_date::text || ' ' || lesson_time::text)::timestamp
  WHERE start_time IS NULL 
    AND lesson_date IS NOT NULL 
    AND lesson_time IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_booking_data();

-- Add indexes for performance (safe to add)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_instructor_id ON public.bookings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_lesson_date ON public.bookings(lesson_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);