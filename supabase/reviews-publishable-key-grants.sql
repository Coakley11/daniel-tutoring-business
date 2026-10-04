-- Run this once if supabase/reviews.sql was applied before the site was
-- connected with an sb_publishable_* key. It is safe to run more than once.
-- Row-level security policies continue to enforce approved-only public reads
-- and pending-only anonymous submissions.

revoke all on table public.reviews from anon;
grant select, insert on table public.reviews to anon;
