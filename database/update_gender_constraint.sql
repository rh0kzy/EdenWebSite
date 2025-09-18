-- Update gender constraint to use Mixte instead of Unisex
-- Run this in your Supabase SQL Editor

ALTER TABLE perfumes DROP CONSTRAINT perfumes_gender_check;
ALTER TABLE perfumes ADD CONSTRAINT perfumes_gender_check CHECK (gender IN ('Men', 'Women', 'Mixte'));