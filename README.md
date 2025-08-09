# InstaCart MVP - Grocery Delivery Service

A complete grocery delivery service with customer, store, and driver interfaces supporting English and Arabic languages.

## 🚀 Quick Start

1. **Prerequisites**
   - Docker and Docker Compose installed
   - Ports 3000, 5173, 5432, and 8080 available

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the services**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000/api
   - **phpMyAdmin**: http://localhost:8080

## 👥 Demo Users

All users use password: `password123`

- **Customer**: `customer1` - Browse products, place orders
- **Store Manager**: `store1` - Manage orders, update status  
- **Driver**: `driver1` - Accept deliveries, mark as delivered

## 🌍 Language Support

- **English** (default)
- **Arabic** with RTL support
- Toggle between languages using the button in the top-right corner

## 📱 Features

### Customer Interface
- Browse bilingual products (English/Arabic)
- Shopping cart with quantity management
- Order placement with cash payment
- Real-time order status tracking
- Order history

### Store Management Panel
- View orders by status (New, Confirmed, Preparing, Ready)
- Update order status through workflow
- Order details with customer information
- Auto-refresh every 30 seconds

### Driver Panel
- View available orders (Ready status)
- Accept orders for delivery
- Mark orders as delivered
- View delivery history and earnings

## 🔄 Order Workflow

1. **Customer** places order → Status: `placed`
2. **Store** confirms order → Status: `confirmed`
3. **Store** starts preparing → Status: `preparing`
4. **Store** marks ready → Status: `ready`
5. **Driver** accepts delivery → Status: `out_for_delivery`
6. **Driver** completes delivery → Status: `delivered`

## 🗃️ Database Schema

- **users**: Authentication and roles
- **products**: Bilingual product catalog
- **orders**: Order management with status tracking

### Sample Products (Bilingual)
- Apples / تفاح
- Bananas / موز
- Milk / حليب
- Bread / خبز
- And 11 more products...

## 🐳 Docker Services

- **postgres**: Database server
- **phpmyadmin**: Database administration
- **backend**: Express.js API
- **frontend**: React with Vite

## 🔧 Development

### Backend Structure
```
backend/
├── src/
│   ├── app.js          # Main Express server
│   └── init.sql        # Database schema + seed data
├── package.json
└── Dockerfile
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.jsx         # Main router
│   ├── Login.jsx       # Authentication
│   ├── Customer.jsx    # Customer interface
│   ├── Store.jsx       # Store management
│   ├── Driver.jsx      # Driver panel
│   └── i18n/           # Internationalization
├── package.json
└── Dockerfile
```

## 🌐 API Endpoints

- `POST /api/login` - User authentication
- `GET /api/products` - Get all products
- `POST /api/orders` - Create order (customers only)
- `GET /api/orders` - Get orders (role-filtered)
- `PUT /api/orders/:id/status` - Update order status

## 🚨 Troubleshooting

1. **Port conflicts**: Stop other services using ports 3000, 5173, 5432, 8080
2. **Database issues**: Delete volumes: `docker-compose down -v`
3. **Container rebuild**: `docker-compose up --build --force-recreate`

## ✅ Testing Workflow

1. Login as customer1, browse products, add to cart, place order
2. Login as store1, view new order, progress through statuses  
3. Login as driver1, accept ready order, mark as delivered
4. Toggle between English/Arabic to test bilingual support

The system runs completely offline with no external dependencies.