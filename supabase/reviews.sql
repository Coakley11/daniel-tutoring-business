-- Run this once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  reviewer_type text check (reviewer_type is null or reviewer_type in ('student', 'parent')),
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(btrim(review_text)) between 10 and 600),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists reviews_public_order_idx
  on public.reviews (approved_at desc, created_at desc)
  where status = 'approved';

alter table public.reviews enable row level security;

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews"
  on public.reviews for select
  to anon
  using (status = 'approved');

drop policy if exists "Public can submit pending reviews" on public.reviews;
create policy "Public can submit pending reviews"
  on public.reviews for insert
  to anon
  with check (status = 'pending' and approved_at is null);

-- PostgREST requires table-level privileges. RLS remains the authorization
-- boundary: anonymous reads see approved rows only, and anonymous inserts must
-- satisfy the pending/null-approved_at policy above.
revoke all on table public.reviews from anon;
grant select, insert on table public.reviews to anon;

create or replace function public.set_review_approved_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.approved_at = now();
  elsif new.status <> 'approved' then
    new.approved_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists set_review_approved_at on public.reviews;
create trigger set_review_approved_at
before update of status on public.reviews
for each row execute function public.set_review_approved_at();
