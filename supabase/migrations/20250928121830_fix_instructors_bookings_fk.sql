-- Fix relationship between bookings and instructors so nested selects work
-- Context: The admin instructors page selects bookings:bookings(count) from instructors.
-- For PostgREST to resolve that relationship, bookings.instructor_id must reference instructors.id
-- (currently it references profiles.id in earlier migrations).

-- Safely swap the foreign key to point to public.instructors(id)
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_instructor_id_fkey;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_instructor_id_fkey
  FOREIGN KEY (instructor_id)
  REFERENCES public.instructors(id)
  ON DELETE SET NULL;