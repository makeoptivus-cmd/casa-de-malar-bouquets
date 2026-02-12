# Supabase Setup Guide - Casa De Malar Bouquets

## Quick Start

This guide will help you set up Supabase for your Casa De Malar website with Portfolio Items and Reviews management.

---

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Sign Up" and create an account
3. Create a new project (choose a region closest to you)
4. Wait for the project to be created

---

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (VITE_SUPABASE_URL)
3. Copy your **Anon Key** (VITE_SUPABASE_ANON_KEY)
4. Add these to your `.env.local` file:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ADMIN_PASSWORD=your_secure_password_here
```

---

## Step 3: Create Database Tables

### 1. Create `portfolio_items` Table

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Paste this SQL and run it:

```sql
CREATE TABLE portfolio_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Enable read access for all users" ON portfolio_items
  FOR SELECT USING (true);

-- Allow anyone to insert (without authentication)
CREATE POLICY "Enable insert for all users" ON portfolio_items
  FOR INSERT WITH CHECK (true);

-- Allow delete
CREATE POLICY "Enable delete for all users" ON portfolio_items
  FOR DELETE USING (true);
```

### 2. Create `reviews` Table

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Paste this SQL and run it:

```sql
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "Enable read access for all users" ON reviews
  FOR SELECT USING (true);

-- Allow anyone to insert reviews
CREATE POLICY "Enable insert for all users" ON reviews
  FOR INSERT WITH CHECK (true);
```

---

## Step 4: Update .env.local

Fill in your credentials in the `.env.local` file:

```env
# Get these from Supabase Settings → API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Create a strong admin password (min 6 characters, use letters and numbers)
VITE_ADMIN_PASSWORD=MySecurePassword123
```

**Save the file and restart your development server!**

---

## Step 5: Access the Admin Panel

1. Start your app: `npm run dev`
2. Go to: `http://localhost:5173/admin`
3. Enter your admin password (VITE_ADMIN_PASSWORD)
4. Add portfolio items with:
   - **Image URL**: Full URL to the image (e.g., https://example.com/image.jpg)
   - **Name**: Bouquet name (e.g., "Romantic Red Roses")
   - **Description**: Brief description

---

## Features Implemented

### ✅ Portfolio Management
- **Homepage**: Shows first 3 portfolio items in preview section
- **Previous Work Page**: Shows all portfolio items in a beautiful timeline
- **Admin Panel** (`/admin`): 
  - Password-protected
  - Add new portfolio items
  - View all items
  - Delete items
  - Image preview

### ✅ Reviews System
- **Write Review Section**: Authenticated review submission
- **Reviews Section**: Displays all reviews dynamically
- **Data Storage**: All reviews stored in Supabase
- **Star Rating**: 1-5 star ratings for each review

---

## File Structure

```
src/
├── lib/
│   └── supabase.ts          ← Supabase client & functions
├── pages/
│   ├── AdminPanel.tsx       ← Admin interface (/admin)
│   ├── PreviousWorkPage.tsx ← Updated with dynamic data
│   └── HomePage.tsx
├── components/
│   ├── PortfolioPreviewSection.tsx  ← Updated with dynamic data
│   ├── ReviewsSection.tsx           ← Updated with Supabase
│   └── WriteReviewSection.tsx       ← Updated with Supabase
└── App.tsx                  ← Updated with /admin route
```

---

## Testing Your Setup

### 1. Test Portfolio Items
1. Go to `/admin`
2. Login with your password
3. Add a test portfolio item
4. Go to home page - should see it in preview
5. Go to `/previous-work` - should see all items

### 2. Test Reviews
1. Scroll to "Write a Review" section
2. Fill in: Name, Email, Rating (stars), Message
3. Click "Submit Review"
4. Scroll up to see your review in the reviews section

---

## Troubleshooting

### ❌ "Error loading portfolio items"
- Check if `.env.local` has correct Supabase credentials
- Verify the `portfolio_items` table exists in Supabase
- Check browser console for specific errors

### ❌ "Wrong password" on Admin Panel
- Make sure `VITE_ADMIN_PASSWORD` in `.env.local` is correct
- Password is case-sensitive
- Restart dev server after changing `.env.local`

### ❌ Images not showing
- Verify image URL is correct and accessible
- Check if the image server allows cross-origin requests
- Use absolute URLs, not relative paths

### ❌ Reviews not saving
- Check if `reviews` table exists
- Verify RLS policies are created
- Check browser console for error messages

---

## Security Notes

- ⚠️ **Keep VITE_ADMIN_PASSWORD strong** - Anyone with this can manage your portfolio
- ⚠️ **VITE_SUPABASE_ANON_KEY is public** - It's exposed in the frontend, which is normal
- ⚠️ **Use RLS policies** - Already set up in the SQL scripts above
- ⚠️ **Validate image URLs** - Admin should verify images are appropriate before adding

---

## Common Image URL Sources

For testing, you can use:
- **Unsplash**: https://unsplash.com → Copy image URL
- **Pexels**: https://www.pexels.com → Copy image URL
- **Your own server**: Upload to your hosting and use the URL
- **Cloud storage**: AWS S3, Google Cloud Storage, etc.

---

## Next Steps

1. ✅ Install Supabase (`@supabase/supabase-js`) - Done
2. ✅ Create environment variables - Done
3. ✅ Create database tables - Do this now
4. ✅ Update environment file - Do this now
5. ✅ Test the admin panel - Do this next
6. ✅ Add portfolio items - Do this next
7. ✅ Share `/admin` link with admin users only - Security measure

---

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Check Supabase's SQL error logs
3. Verify all table names match exactly (case-sensitive)
4. Make sure all RLS policies are created

Good luck with your Casa De Malar portfolio! 🌸
