-- Fix gender constraint to include Mixte
ALTER TABLE perfumes DROP CONSTRAINT perfumes_gender_check;
ALTER TABLE perfumes ADD CONSTRAINT perfumes_gender_check CHECK (gender IN ('Men', 'Women', 'Unisex', 'Mixte'));