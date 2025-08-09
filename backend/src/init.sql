-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'store', 'driver')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 100,
    category_en VARCHAR(50),
    category_ar VARCHAR(50),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
    total DECIMAL(10,2) NOT NULL,
    items_json TEXT NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card')),
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test users (passwords are hashed version of 'password123')
INSERT INTO users (username, password_hash, role) VALUES 
('customer1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('customer2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('store1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'store'),
('driver1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver'),
('driver2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver');

-- Insert bilingual products
INSERT INTO products (name_en, name_ar, description_en, description_ar, price, stock, category_en, category_ar) VALUES 
('Apples', 'تفاح', 'Fresh red apples from local farms', 'تفاح أحمر طازج من المزارع المحلية', 2.99, 50, 'Fruits', 'فواكه'),
('Bananas', 'موز', 'Ripe yellow bananas rich in potassium', 'موز أصفر ناضج غني بالبوتاسيوم', 1.49, 100, 'Fruits', 'فواكه'),
('Milk', 'حليب', 'Fresh whole milk 1 gallon', 'حليب كامل الدسم طازج 1 جالون', 3.99, 30, 'Dairy', 'ألبان'),
('Bread', 'خبز', 'Whole wheat bread loaf', 'رغيف خبز قمح كامل', 2.79, 25, 'Bakery', 'مخبوزات'),
('Chicken Breast', 'صدر دجاج', 'Boneless chicken breast per lb', 'صدر دجاج منزوع العظم للباوند', 5.99, 20, 'Meat', 'لحوم'),
('Rice', 'أرز', 'Long grain white rice 2lb bag', 'أرز أبيض طويل الحبة كيس 2 باوند', 3.49, 40, 'Grains', 'حبوب'),
('Tomatoes', 'طماطم', 'Fresh ripe tomatoes per lb', 'طماطم طازجة ناضجة للباوند', 2.49, 35, 'Vegetables', 'خضروات'),
('Olive Oil', 'زيت زيتون', 'Extra virgin olive oil 500ml', 'زيت زيتون بكر ممتاز 500 مل', 8.99, 15, 'Pantry', 'مؤن'),
('Yogurt', 'زبادي', 'Greek yogurt 32oz container', 'زبادي يوناني علبة 32 أونصة', 4.49, 20, 'Dairy', 'ألبان'),
('Orange Juice', 'عصير برتقال', 'Fresh squeezed orange juice 1L', 'عصير برتقال طازج معصور 1 لتر', 4.99, 25, 'Beverages', 'مشروبات'),
('Pasta', 'معكرونة', 'Italian pasta 500g pack', 'معكرونة إيطالية عبوة 500 جرام', 1.99, 50, 'Pantry', 'مؤن'),
('Cheese', 'جبن', 'Cheddar cheese block 8oz', 'جبن شيدر قطعة 8 أونصة', 3.99, 18, 'Dairy', 'ألبان'),
('Eggs', 'بيض', 'Farm fresh eggs dozen', 'بيض طازج من المزرعة دزينة', 2.99, 40, 'Dairy', 'ألبان'),
('Onions', 'بصل', 'Yellow onions 2lb bag', 'بصل أصفر كيس 2 باوند', 1.99, 30, 'Vegetables', 'خضروات'),
('Potatoes', 'بطاطس', 'Russet potatoes 5lb bag', 'بطاطس روسيت كيس 5 باوند', 3.99, 25, 'Vegetables', 'خضروات');