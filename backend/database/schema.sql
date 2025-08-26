-- Eden Parfum Database Schema

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    description TEXT,
    country VARCHAR(50),
    founded_year INT,
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand_name (name)
);

-- Create perfume categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create perfumes table
CREATE TABLE IF NOT EXISTS perfumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand_id INT NOT NULL,
    category_id INT,
    description TEXT,
    notes_top TEXT,
    notes_middle TEXT,
    notes_base TEXT,
    concentration VARCHAR(50), -- EDT, EDP, Parfum, etc.
    gender ENUM('Men', 'Women', 'Unisex') DEFAULT 'Unisex',
    launch_year INT,
    perfumer VARCHAR(100),
    price_range VARCHAR(50),
    availability ENUM('Available', 'Out of Stock', 'Discontinued') DEFAULT 'Available',
    image_url VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_perfume_name (name),
    INDEX idx_perfume_brand (brand_id),
    INDEX idx_perfume_gender (gender),
    INDEX idx_perfume_availability (availability)
);

-- Create perfume sizes table
CREATE TABLE IF NOT EXISTS perfume_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perfume_id INT NOT NULL,
    size_ml INT NOT NULL,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE,
    INDEX idx_size_perfume (perfume_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perfume_id INT NOT NULL,
    reviewer_name VARCHAR(100),
    email VARCHAR(150),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (perfume_id) REFERENCES perfumes(id) ON DELETE CASCADE,
    INDEX idx_review_perfume (perfume_id),
    INDEX idx_review_rating (rating)
);

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_term VARCHAR(255) NOT NULL,
    results_count INT DEFAULT 0,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_search_term (search_term),
    INDEX idx_search_date (created_at)
);

-- Insert default categories
INSERT IGNORE INTO categories (name, description) VALUES
('Floral', 'Fragrances with predominantly floral notes'),
('Oriental', 'Warm, spicy, and exotic fragrances'),
('Fresh', 'Light, clean, and refreshing fragrances'),
('Woody', 'Fragrances with wood-based notes'),
('Citrus', 'Bright and zesty citrus-based fragrances'),
('Aquatic', 'Fresh, marine-inspired fragrances'),
('Gourmand', 'Edible, sweet, and dessert-like fragrances'),
('Chypre', 'Classic sophisticated fragrances'),
('Fougère', 'Fresh, herbaceous fragrances'),
('Aromatic', 'Herb and lavender-based fragrances');
