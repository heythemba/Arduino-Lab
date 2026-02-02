-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (Public user data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  school_name text,
  role text check (role in ('admin', 'leader')) default 'leader',
  updated_at timestamp with time zone
);

-- RLS for profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger for creating profile on signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- PROJECTS TABLE
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.profiles(id) not null,
  slug text unique not null,
  category text not null,
  
  -- I18n Fields (JSONB: {en: "...", fr: "...", ar: "..."})
  title jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  
  hero_image_url text,
  is_published boolean default false
);

-- RLS for projects
alter table public.projects enable row level security;
create policy "Published projects are viewable by everyone." on public.projects for select using (is_published = true);
create policy "Authors can see all their projects." on public.projects for select using (auth.uid() = author_id);
create policy "Authors can insert projects." on public.projects for insert with check (auth.uid() = author_id);
create policy "Authors can update their projects." on public.projects for update using (auth.uid() = author_id);


-- PROJECT STEPS TABLE
create table public.project_steps (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  step_number int not null,
  
  -- Content
  content jsonb not null default '{}'::jsonb, -- {en: "Step desc...", ...}
  code_snippet text, -- Optional code for this step
  image_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for steps
alter table public.project_steps enable row level security;
create policy "Steps are viewable by everyone if project is published." 
  on public.project_steps for select 
  using (exists (select 1 from public.projects where id = project_steps.project_id and is_published = true));
create policy "Authors can manage steps." 
  on public.project_steps for all 
  using (exists (select 1 from public.projects where id = project_steps.project_id and author_id = auth.uid()));


-- STORAGE BUCKETS (Need to be created in Storage section too, but policies here)
-- Buckets: 'project-images', 'project-files'

-- (Policies for storage objects handle via Supabase UI or storage.objects policies, 
-- but conceptually: Public read, Author write)
