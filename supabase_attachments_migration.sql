-- Create project_attachments table
create table if not exists project_attachments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  file_type text check (file_type in ('stl', 'ino', 'image', 'other')) not null,
  file_name text not null,
  file_url text not null,
  file_size bigint, -- in bytes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table project_attachments enable row level security;

-- Policies for project_attachments
-- Public read access
create policy "Public projects attachments are viewable by everyone"
  on project_attachments for select
  using ( true );

-- Authenticated users can insert/update/delete (assuming admin-only app for now, or check project owner)
-- For simplicity in this Admin Dashboard context, we allow authenticated users (Admins) to manage all.
create policy "Admins can insert attachments"
  on project_attachments for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update attachments"
  on project_attachments for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete attachments"
  on project_attachments for delete
  using ( auth.role() = 'authenticated' );

-- STORAGE POLICIES (Assuming bucket 'project-files' exists)
-- You must create the bucket 'project-files' in the Supabase Dashboard -> Storage -> New Bucket
-- Make it PUBLIC.

-- storage.objects policies
-- Note: You might need to adjust these if your bucket is private, but for public assets, public read is good.

-- Public Read
create policy "Public Access to Project Files"
on storage.objects for select
using ( bucket_id = 'project-files' );

-- Authenticated Upload
create policy "Admins can upload Project Files"
on storage.objects for insert
with check ( bucket_id = 'project-files' and auth.role() = 'authenticated' );

-- Authenticated Update/Delete
create policy "Admins can update Project Files"
on storage.objects for update
using ( bucket_id = 'project-files' and auth.role() = 'authenticated' );

create policy "Admins can delete Project Files"
on storage.objects for delete
using ( bucket_id = 'project-files' and auth.role() = 'authenticated' );
