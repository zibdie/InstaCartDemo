# InstaCart MVP Implementation Plan

## 🚀 ONE-DAY MVP PRIORITY (START HERE)

### MVP Scope (8 Hours Implementation)
**Goal**: Fully functional local InstaCart system running entirely in Docker containers without internet dependency.

#### MVP Features (Minimal but Complete)
1. **Basic Authentication**: Username/password login (no registration needed - pre-seeded users)
2. **Single Store**: One demo store with 10-15 products
3. **Customer Interface**: Browse products, add to cart, place order
4. **Store Panel**: View orders, mark as "preparing" → "ready"  
5. **Driver Panel**: View ready orders, mark as "out for delivery" → "delivered"
6. **Basic Order Tracking**: Simple status updates (no real-time, just refresh)
7. **Payment**: Cash only (skip credit card for MVP)
8. **Single Language**: English only (Arabic can be added later)

#### MVP Implementation Order (8 Hours)
```
Hour 1: Docker setup + Database schema + seed data
Hour 2: Basic Express API with auth endpoints
Hour 3: Customer API endpoints (products, orders)
Hour 4: Store/Driver API endpoints  
Hour 5: Basic React frontend structure + routing
Hour 6: Customer interface (product list, cart, checkout)
Hour 7: Store panel (order management) + Driver panel
Hour 8: Integration testing + Docker compose finalization
```

#### MVP Docker Architecture
```
docker-compose.yml:
- postgres:13 (database)
- phpmyadmin (database GUI)
- backend (Express API on port 3000)
- frontend (Vite dev server on port 5173)
```

#### MVP Database (Simplified)
```sql
-- Only essential tables for MVP
users (id, username, password_hash, role)
products (id, name, price, stock, description)
orders (id, customer_id, status, total, items_json, created_at)
```

#### MVP API Endpoints (Essential Only)
```
POST /api/login
GET /api/products
POST /api/orders
GET /api/orders (filtered by role)
PUT /api/orders/:id/status
```

#### MVP File Structure (Minimal)
```
InstaCartDemo/
├── docker-compose.yml
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── app.js (single file with all routes)
│       └── init.sql (database schema + seed data)
├── frontend/
│   ├── package.json  
│   ├── Dockerfile
│   └── src/
│       ├── App.jsx (main router)
│       ├── Login.jsx
│       ├── Customer.jsx  
│       ├── Store.jsx
│       └── Driver.jsx
└── .env (database credentials)
```

#### MVP Success Criteria
- [ ] All services run with single `docker-compose up` command
- [ ] Customer can login, browse products, place order
- [ ] Store can see orders and update status  
- [ ] Driver can see ready orders and mark delivered
- [ ] Works completely offline (no external API calls)
- [ ] phpMyAdmin accessible for database inspection

#### For AI Agents Continuing This Work

**Current State**: MVP plan completed, ready for implementation

**Next Steps for Implementation**:
1. **Start Here**: Begin with `docker-compose.yml` and `.env` file setup
2. **Follow Hour-by-Hour Plan**: Implement in the exact order specified above
3. **Test Users**: Create these accounts in seed data:
   - customer1/password123 (role: customer)
   - store1/password123 (role: store)  
   - driver1/password123 (role: driver)
4. **Port Access**: 
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - phpMyAdmin: http://localhost:8080
5. **Critical Files to Create First**:
   - `docker-compose.yml` (orchestration)
   - `backend/src/init.sql` (database schema + seed data)
   - `backend/src/app.js` (all API endpoints)
   - `frontend/src/App.jsx` (main router with role-based navigation)

**Key Implementation Notes**:
- Keep it simple - single files where possible
- No external dependencies (all npm packages should work offline)
- Use localStorage for basic state management
- Focus on functionality over styling
- Test each component works before moving to next hour

**After MVP Completion**: Reference the full comprehensive plan below for adding advanced features like real-time updates, internationalization, and enhanced UI.

---

## Project Overview
InstaCart is a grocery delivery service with three distinct user interfaces:
1. **Customer App** - Browse stores, manage cart, place orders, track deliveries
2. **Store Management Panel** - Inventory management, order fulfillment
3. **Driver Panel** - Order acceptance, delivery management

## Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Architecture**: Lambda-style microservices
- **Database**: PostgreSQL with Docker container
- **Admin Panel**: phpMyAdmin for database management
- **Authentication**: JWT tokens with role-based access
- **Real-time**: Socket.io for live order updates

### Frontend
- **Framework**: React with Vite bundler
- **Styling**: CSS Modules or Tailwind CSS
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **Real-time**: Socket.io client
- **Internationalization**: react-i18next for English/Arabic

### Development Environment
- **Containerization**: Docker & Docker Compose
- **Database GUI**: phpMyAdmin
- **Environment**: Node.js 18+
- **Package Manager**: npm

## Project Structure
```
InstaCartDemo/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── i18n/
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
├── GOAL.md
└── PLAN.md
```

## Database Schema

### Core Tables
```sql
-- Users table with role-based access
Users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'store', 'driver') NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
Stores (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES Users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  opening_hours JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
Products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES Stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(50),
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
Orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES Users(id),
  store_id INTEGER REFERENCES Stores(id),
  status ENUM('placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'placed',
  total DECIMAL(10,2) NOT NULL,
  payment_method ENUM('credit_card', 'cash') NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
OrderItems (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES Orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES Products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Deliveries table
Deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES Orders(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES Users(id),
  status ENUM('assigned', 'picked_up', 'in_transit', 'delivered') DEFAULT 'assigned',
  pickup_time TIMESTAMP,
  delivery_time TIMESTAMP,
  driver_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication Routes
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
```

### Customer Routes
```
GET /api/stores - List all active stores
GET /api/stores/:id - Get store details
GET /api/stores/:id/products - Get store products
GET /api/products/search - Search products
POST /api/orders - Create new order
GET /api/orders - Get user's orders
GET /api/orders/:id - Get order details
PUT /api/orders/:id/cancel - Cancel order
```

### Store Routes
```
GET /api/store/orders - Get store's orders
PUT /api/store/orders/:id/status - Update order status
GET /api/store/products - Get store's products
POST /api/store/products - Add new product
PUT /api/store/products/:id - Update product
DELETE /api/store/products/:id - Delete product
GET /api/store/dashboard - Store analytics
```

### Driver Routes
```
GET /api/driver/orders - Get available/assigned orders
PUT /api/driver/orders/:id/accept - Accept delivery
PUT /api/driver/orders/:id/status - Update delivery status
GET /api/driver/deliveries - Get driver's delivery history
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Loading.jsx
│   │   └── LanguageToggle.jsx
│   ├── customer/
│   │   ├── StoreList.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── OrderTracking.jsx
│   ├── store/
│   │   ├── Dashboard.jsx
│   │   ├── OrderList.jsx
│   │   ├── ProductManager.jsx
│   │   └── OrderDetails.jsx
│   └── driver/
│       ├── AvailableOrders.jsx
│       ├── ActiveDelivery.jsx
│       └── DeliveryHistory.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── CustomerApp.jsx
│   ├── StorePanel.jsx
│   └── DriverPanel.jsx
├── contexts/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── SocketContext.jsx
└── i18n/
    ├── en.json
    └── ar.json
```

### Key Features Implementation

#### 1. Authentication System
- JWT token storage in localStorage
- Protected routes with role-based access
- Automatic token refresh
- Login/Register forms with validation

#### 2. Shopping Cart
- Persistent cart state (localStorage)
- Add/remove items functionality
- Quantity adjustment
- Total calculation with tax

#### 3. Order Tracking System
Status progression:
1. **Placed** - Order submitted by customer
2. **Confirmed** - Store accepts the order
3. **Preparing** - Store is preparing items
4. **Ready** - Order ready for pickup
5. **Out for Delivery** - Driver picked up order
6. **Delivered** - Order completed

#### 4. Payment System
- **Credit Card**: Accept only `4111-1111-1111-1111` as valid
- **Cash**: Allow cash on delivery option
- Basic form validation for payment details

#### 5. Real-time Updates
- Socket.io connection for live order status
- Notifications for status changes
- Driver location updates (mock data)

#### 6. Internationalization
- English (default) and Arabic support
- RTL layout for Arabic
- Currency formatting (USD/local currency)
- Date/time localization

## User Roles & Permissions

### Customer
- Browse stores and products
- Add items to cart
- Place orders with payment
- Track order status
- View order history

### Store Owner
- Manage product inventory
- View incoming orders
- Update order status
- Add/edit/delete products
- View sales analytics

### Delivery Driver
- View available delivery orders
- Accept delivery assignments
- Update delivery status
- View delivery history
- Mark orders as delivered

## Development Workflow

### Phase 1: Foundation (Days 1-2)
1. Set up project structure
2. Initialize backend with Express
3. Initialize frontend with Vite + React
4. Configure Docker containers (PostgreSQL + phpMyAdmin)
5. Create database schema and seed data

### Phase 2: Authentication & Core Backend (Days 3-4)
1. Implement JWT authentication
2. Create user registration/login
3. Set up role-based middleware
4. Implement core API endpoints
5. Add input validation and error handling

### Phase 3: Customer Interface (Days 5-6)
1. Create store listing and product browsing
2. Implement shopping cart functionality
3. Build checkout process with payment options
4. Add order placement and confirmation

### Phase 4: Store & Driver Panels (Days 7-8)
1. Build store management interface
2. Implement order fulfillment workflow
3. Create driver assignment system
4. Add delivery status updates

### Phase 5: Real-time & Internationalization (Days 9-10)
1. Integrate Socket.io for real-time updates
2. Implement order tracking with status progression
3. Add i18n support for English/Arabic
4. Test all user flows and edge cases

### Phase 6: Polish & Testing (Days 11-12)
1. Add error handling and loading states
2. Implement responsive design
3. Add basic analytics and reporting
4. Performance optimization
5. End-to-end testing

## Sample Data

### Demo Stores
1. **Fresh Market** - Fruits, vegetables, dairy
2. **Corner Grocery** - Snacks, beverages, household items
3. **Organic Plus** - Organic produce, health foods

### Sample Products per Store
- Fresh Market: Apples ($2.99/lb), Bananas ($1.49/lb), Milk ($3.99/gal)
- Corner Grocery: Chips ($2.49), Soda ($1.99), Bread ($2.79)
- Organic Plus: Organic Apples ($4.99/lb), Almond Milk ($5.49), Quinoa ($8.99)

### Test Users
```
Customer: username: "customer1", password: "password123"
Store Owner: username: "store1", password: "password123"
Driver: username: "driver1", password: "password123"
```

## Docker Configuration

### docker-compose.yml Services
1. **PostgreSQL** - Database server
2. **phpMyAdmin** - Database administration
3. **Backend API** - Express.js server
4. **Frontend** - React application (development mode)

### Environment Variables
```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=instacart_db
DB_USER=postgres
DB_PASSWORD=password123
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Security Considerations
- Password hashing with bcrypt
- JWT token expiration (24 hours)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting on sensitive endpoints

## Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Component testing for React components
- End-to-end testing with Playwright (if needed)
- Manual testing of user workflows

## Deployment Notes
- Environment-specific configuration
- Database migrations
- Static file serving
- Production build optimization
- Health check endpoints
- Logging and monitoring setup

This plan provides a comprehensive roadmap for building the InstaCart MVP with all requested features including multi-language support, role-based interfaces, and real-time order tracking.