-- Migration: Add image_upload_url column to site_settings
-- Run this in your Supabase SQL Editor
-- Date: 2026-02-24

-- Add the new column (nullable, so existing rows are unaffected)
ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS image_upload_url TEXT DEFAULT NULL;

-- Example: Set your preferred image host (edit URL as needed)
-- UPDATE public.site_settings SET image_upload_url = 'https://postimages.org' WHERE id = 1;
