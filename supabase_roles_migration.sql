-- Migration: Replace 'leader' role with 'volunteer_facilitator' and 'teacher'
-- Run this in your Supabase SQL Editor
-- Date: 2026-02-23

-- ============================================================
-- 1. Drop the old check constraint on profiles.role
-- ============================================================
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ============================================================
-- 2. Add the updated check constraint with new role values
--    'leader' is kept temporarily for backward compatibility
--    with any existing rows (there are none besides admin, but
--    keeping it makes the migration safe to run at any time).
-- ============================================================
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'volunteer_facilitator', 'teacher'));

-- If you are 100% sure there are no 'leader' rows (only admin exists),
-- use this stricter version instead (comment out the one above):
-- ALTER TABLE public.profiles
--     ADD CONSTRAINT profiles_role_check
--     CHECK (role IN ('admin', 'volunteer_facilitator', 'teacher'));

-- ============================================================
-- 3. Update the default value for new users
-- ============================================================
ALTER TABLE public.profiles
    ALTER COLUMN role SET DEFAULT 'volunteer_facilitator';

-- ============================================================
-- 4. Update the trigger to read role from user_metadata
--    so the correct role is saved when an admin creates a user
--    via the "Add New Member" form.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Read role from user_metadata, default to 'volunteer_facilitator'
    user_role := COALESCE(
        new.raw_user_meta_data->>'role',
        'volunteer_facilitator'
    );

    -- Validate role to prevent injection of arbitrary values
    IF user_role NOT IN ('admin', 'volunteer_facilitator', 'teacher') THEN
        user_role := 'volunteer_facilitator';
    END IF;

    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        user_role
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: The trigger itself (on_auth_user_created) does NOT need to be
-- recreated — it already points to handle_new_user(). Only the function
-- body was updated above using CREATE OR REPLACE.
