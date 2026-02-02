-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR

-- 1. Add the missing 'title' column to project_steps
ALTER TABLE public.project_steps 
ADD COLUMN IF NOT EXISTS title jsonb not null default '{}'::jsonb;

-- 2. Reload the schema cache
-- (You usually have to do this via the "API" settings in the dashboard, 
-- but running a schema change often triggers it automatically).

-- 3. Verify it exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_steps';
