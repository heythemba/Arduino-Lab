-- Add instructor_name and school_name columns to projects table if they don't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS instructor_name TEXT,
ADD COLUMN IF NOT EXISTS school_name TEXT;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects';
