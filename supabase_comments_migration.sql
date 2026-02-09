-- Create comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null check (length(content) > 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create comment_likes table
create table comment_likes (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references comments(id) on delete cascade not null,
  visitor_id text not null, -- Stores client-generated ID for public users
  created_at timestamptz default now() not null,
  unique (comment_id, visitor_id) -- Prevent double likes
);

-- Enable RLS
alter table comments enable row level security;
alter table comment_likes enable row level security;

-- Policies for Comments

-- 1. Everyone can view comments
create policy "Comments are public"
  on comments for select
  using ( true );

-- 2. Authenticated users can insert comments
create policy "Authenticated users can comment"
  on comments for insert
  with check ( auth.uid() = user_id );

-- 3. Users can delete/update their own comments
create policy "Users can delete own comments"
  on comments for delete
  using ( auth.uid() = user_id );

create policy "Users can update own comments"
  on comments for update
  using ( auth.uid() = user_id );

-- 4. Admins can delete any comment
create policy "Admins can delete any comment"
  on comments for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policies for Comment Likes

-- 1. Everyone can view likes
create policy "Likes are public"
  on comment_likes for select
  using ( true );

-- 2. Everyone can insert likes (public feature)
create policy "Everyone can like"
  on comment_likes for insert
  with check ( true );

-- 3. Everyone can delete likes (un-like)
create policy "Everyone can unlike"
  on comment_likes for delete
  using ( true );
