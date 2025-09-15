-- Fix schema inconsistencies and add RLS policies
-- This migration addresses:
-- 1. Missing tables and fields
-- 2. Schema inconsistencies 
-- 3. Row Level Security policies
-- 4. Profile creation trigger

-- First, update the profiles table to match the expected structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_pic_url text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update the bookings table to match the expected structure
ALTER TABLE public.bookings
DROP COLUMN IF EXISTS lesson_date,
DROP COLUMN IF EXISTS lesson_time,
ADD COLUMN IF NOT EXISTS instructor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lesson_slot_id uuid,
ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Create instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
  id uuid references public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio text,
  lesson_price numeric,
  rating numeric CHECK (rating >= 0 AND rating <= 5)
);

-- Create instructor_reviews table  
CREATE TABLE IF NOT EXISTS public.instructor_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  instructor_id uuid references public.instructors(id) ON DELETE CASCADE NOT NULL,
  client_id uuid references public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text text
);

-- Enable RLS on new tables
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_reviews ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES FOR PROFILES TABLE
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow everyone to read basic instructor profiles (for public instructor list)
CREATE POLICY "Public can read instructor profiles" ON public.profiles
  FOR SELECT USING (role = 'instructor');

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR BOOKINGS TABLE
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Instructors can read their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

-- Allow users to read their own bookings
CREATE POLICY "Users can read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own bookings
CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own bookings
CREATE POLICY "Users can delete own bookings" ON public.bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Allow instructors to read bookings assigned to them
CREATE POLICY "Instructors can read their bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = instructor_id);

-- Allow admins to manage all bookings
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR INSTRUCTORS TABLE
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read instructors" ON public.instructors;
DROP POLICY IF EXISTS "Instructors can update own profile" ON public.instructors;
DROP POLICY IF EXISTS "Admins can manage instructors" ON public.instructors;

-- Allow everyone to read instructor profiles (for public instructor list)
CREATE POLICY "Public can read instructors" ON public.instructors
  FOR SELECT TO authenticated, anon USING (true);

-- Allow instructors to update their own instructor profile
CREATE POLICY "Instructors can update own profile" ON public.instructors
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to manage all instructors
CREATE POLICY "Admins can manage instructors" ON public.instructors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR INSTRUCTOR_REVIEWS TABLE
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.instructor_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.instructor_reviews;

-- Allow everyone to read reviews (for public instructor ratings)
CREATE POLICY "Public can read reviews" ON public.instructor_reviews
  FOR SELECT TO authenticated, anon USING (true);

-- Allow authenticated users to create reviews
CREATE POLICY "Users can create reviews" ON public.instructor_reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update own reviews" ON public.instructor_reviews
  FOR UPDATE USING (auth.uid() = client_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.instructor_reviews
  FOR DELETE USING (auth.uid() = client_id);

-- Allow admins to manage all reviews
CREATE POLICY "Admins can manage all reviews" ON public.instructor_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_instructor_id ON public.bookings(instructor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_instructor_id ON public.instructor_reviews(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_client_id ON public.instructor_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);