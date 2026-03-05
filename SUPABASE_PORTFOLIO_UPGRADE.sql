-- Run this in Supabase SQL editor before using the upgraded Admin panel
-- Adds support for: 4-digit item code, price, key feature, multiple images, optional video

ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS item_code TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS key_feature TEXT,
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Backfill existing rows so old data keeps working with new UI
UPDATE portfolio_items
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Optional: ensure a 4-digit code pattern when present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'portfolio_items_item_code_format_check'
  ) THEN
    ALTER TABLE portfolio_items
    ADD CONSTRAINT portfolio_items_item_code_format_check
    CHECK (item_code IS NULL OR item_code ~ '^[0-9]{4}$');
  END IF;
END
$$;

-- Optional: index for faster item code lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_items_item_code ON portfolio_items (item_code);
