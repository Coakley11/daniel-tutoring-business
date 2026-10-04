# Daniel Cohen Tutoring — MVP Website

Lean static site for private online Math & Statistics tutoring at **$100/hour**.

No auth, database, custom scheduling, or custom payments—just HTML/CSS/JS plus Calendly + Stripe + email.

## Local project path

`C:\Users\danie\Documents\GitHub\daniel-tutoring-business`

## Run locally

From this folder, any of:

```bash
npx --yes serve .
```

```bash
python -m http.server 8080
```

Then open `http://localhost:3000` (serve) or `http://localhost:8080` (Python).

## Edit account details (minutes)

Open **`config.js`** and replace:

| Key | What to put |
|-----|-------------|
| `calendlyUrl` | Your Calendly 60-minute event URL |
| `stripeUrl` | Your Stripe Payment Link for $100 |
| `contactEmail` | Professional email address |
| `videoPlatform` | `"Google Meet"`, `"Zoom"`, or `"Google Meet or Zoom"` |
| `supabaseUrl` | Supabase **Project URL** (only needed for reviews) |
| `supabaseAnonKey` | Supabase **anon/public** key (never use the service-role key) |

All booking, payment, and email links on the page read from that file.

## Payment-first booking flow

`config.js` is the single source of truth for both booking URLs:

- `stripeUrl` — the hosted Stripe Payment Link used by every paid-booking CTA.
- `calendlyUrl` — the 60-minute Calendly event used as Stripe’s post-payment redirect.

The current `stripeUrl` is a **TEST / SANDBOX Payment Link**. It must be replaced
with a separately verified live Payment Link before production launch. Confirm that
the live Stripe success redirect points to the configured Calendly event. Never add
Stripe secret keys or other private credentials to this static site.

## Set up reviews (one time)

1. Create a Supabase project at <https://supabase.com>.
2. Open **SQL Editor**, paste the contents of `supabase/reviews.sql`, and run it.
3. In **Project Settings → API**, copy the Project URL and the `anon` public key
   into `config.js`.
4. Deploy the site normally.

The anonymous browser role can only submit `display_name`, `reviewer_type`,
`rating`, and `review_text`. Every submission receives the database default status
`pending`. Row-level security exposes only `approved` rows and prevents browser
clients from changing review status or deleting reviews.

### Moderate reviews

Sign in to the Supabase dashboard and open **Table Editor → reviews**. Review each
pending entry, then change `status` to `approved` or `rejected`. Approved reviews
appear publicly on the next page load; rejected and pending reviews remain private.
The `approved_at` timestamp is maintained automatically.

Do not place a Supabase service-role key, database password, or any other private
credential in `config.js` or other frontend files.

If `supabase/reviews.sql` was run before the site was connected with a new-format
`sb_publishable_*` key, also run `supabase/reviews-publishable-key-grants.sql` once.
This supplies the table-level privileges required by PostgREST; the existing RLS
policies still restrict public reads to approved rows and inserts to pending rows.

## Deploy (recommended: Vercel)

1. Create a free Vercel account and import this GitHub repo (or drag-and-drop the folder).
2. Framework preset: **Other** / static. Root directory: project root.
3. Deploy. Optionally attach a custom domain.

Alternatives: Netlify Drop, or GitHub Pages (serve root).

**Do not deploy until placeholders in `config.js` are filled.**

## What’s in the site

- Hero / value proposition
- Subjects
- Why work with Daniel (+ approach)
- $100/hour pricing
- How online tutoring works
- Booking CTA (Calendly + Stripe)
- FAQ (including Meet/Zoom)
- Contact

## Ops docs (not part of the live site)

See `docs/` for launch checklist, outreach copy, intake questions, and client tracker.

## Recurring software cost (typical MVP)

| Tool | Typical cost |
|------|----------------|
| Vercel / Netlify / GitHub Pages | $0 for a simple static site |
| Calendly | Free tier often enough to start; paid plans optional |
| Stripe | No monthly fee; per-transaction fees only |
| Google Meet | $0 with a Google account |
| Domain + email | ~$10–20/year domain; email via Google Workspace (~$6–7/user/mo) or free forwarding |

Estimated software spend to launch: **~$0–15/month** depending on email/domain choices.
