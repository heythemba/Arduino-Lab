-- Add foreign key reference to profiles to enable PostgREST joins
alter table comments
add constraint comments_user_id_fkey_profiles
foreign key (user_id)
references profiles(id)
on delete cascade;
