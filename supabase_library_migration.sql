-- Drop the existing constraint
ALTER TABLE project_attachments DROP CONSTRAINT IF EXISTS project_attachments_file_type_check;

-- Add the new constraint including 'zip' for Arduino Libraries
ALTER TABLE project_attachments ADD CONSTRAINT project_attachments_file_type_check 
CHECK (file_type in ('stl', 'ino', 'image', 'other', 'zip'));
