# ⚡ Quick Setup for Photo Uploads to Work

## The Problem
Your Supabase storage bucket needs to be set to **PUBLIC** so uploaded photos can be viewed.

## The Solution (5 minutes)

### Step 1: Open Supabase Dashboard
```
👉 Go to: https://supabase.com/dashboard
```

### Step 2: Select Your Project
- Click on your project name (you should see "hqjhnwsvgygexfxkcmdt" in the URL)

### Step 3: Enable Public Storage Bucket
1. In the **left sidebar**, click **"Storage"**
2. You'll see a list of buckets
3. Find **"portfolio_images"** bucket
4. Click the **three dots (⋯)** on the right of that bucket
5. Click **"Make public"**
6. **Confirm** when prompted

### Step 4: Done! 🎉
Your bucket is now public. Photo uploads will work immediately!

---

## How It Works Now

1. **Go to admin panel**: http://localhost:8086/admin
2. **Login**: Password is `CasaDeMalar123`
3. **Click "Upload File"** button
4. **Select photo** from your gallery
5. **Add name & description**
6. **Click "Add Portfolio Item"**
7. ✅ Photo uploads to Supabase and displays automatically!

---

## Verify It's Working

After making bucket public:
1. Delete all old items (the ones that fail to load)
2. Upload a new photo using the "Upload File" button
3. Go to homepage → you should see the photo!
4. Go to /previous-work → scroll down and see photo with parallax animation

---

## Troubleshooting

**If photos still don't show:**
1. Open browser console (F12)
2. Look for error messages
3. Screenshot the error and show me

**If you can't find the bucket:**
- Make sure you're in the correct Supabase project
- Check the project URL contains: `hqjhnwsvgygexfxkcmdt`

---

## What You Need
- Supabase Dashboard access (you already have this)
- 2 clicks to make bucket public
- That's it!

