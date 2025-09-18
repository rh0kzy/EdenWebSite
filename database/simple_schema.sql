-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR

-- Create brands table
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create perfumes table
CREATE TABLE perfumes (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(100),
    gender VARCHAR(20) CHECK (gender IN ('Men', 'Women', 'Unisex')),
    description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_perfumes_brand_id ON perfumes(brand_id);
CREATE INDEX idx_perfumes_gender ON perfumes(gender);
CREATE INDEX idx_perfumes_reference ON perfumes(reference);
CREATE INDEX idx_perfumes_name ON perfumes(name);
CREATE INDEX idx_brands_name ON brands(name);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON perfumes FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_perfumes_updated_at BEFORE UPDATE ON perfumes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();