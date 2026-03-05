# Casa De Malar — Bouquets

Simple portfolio site for Casa De Malar — bouquets and client reviews.

## Development

1. Install dependencies:

```bash
npm install
```

2. Add Supabase credentials in `.env.local` (see `SUPABASE_SETUP.md`).

3. Start dev server:

```bash
npm run dev
```

## Supabase

This app uses Supabase for data (portfolio items, reviews, and image storage). See `SUPABASE_SETUP.md` for setup and SQL.

For the upgraded Admin panel fields (unique 4-digit code, price, key feature, up to 4 images, optional video), run `SUPABASE_PORTFOLIO_UPGRADE.sql` in your Supabase SQL editor.

## Deployment

Deploy to Vercel or Netlify — this is a standard Vite React app. Update environment variables in your deployment platform to match `.env.local`.

---

If you originally connected this repository to the Lovable service, that external integration has been removed from the repo files. To fully disconnect on Lovable's side, sign in to https://lovable.dev and remove the project or repository connection there.
