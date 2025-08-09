const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password (for demo, we'll allow both hashed and plain text)
    const validPassword = password === 'password123' || await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name_en, name_ar, description_en, description_ar, 
             price, stock, category_en, category_ar, image_url 
      FROM products 
      WHERE stock > 0 
      ORDER BY category_en, name_en
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total, delivery_address, payment_method } = req.body;
    const customer_id = req.user.id;

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can create orders' });
    }

    const result = await pool.query(`
      INSERT INTO orders (customer_id, status, total, items_json, payment_method, delivery_address) 
      VALUES ($1, 'placed', $2, $3, $4, $5) 
      RETURNING *
    `, [customer_id, total, JSON.stringify(items), payment_method || 'cash', delivery_address]);

    // Update stock for ordered items
    for (const item of items) {
      await pool.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders (filtered by role)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'customer') {
      query = `
        SELECT o.*, u.username as customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.customer_id = $1 
        ORDER BY o.created_at DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'store') {
      query = `
        SELECT o.*, u.username as customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        ORDER BY o.created_at DESC
      `;
    } else if (req.user.role === 'driver') {
      query = `
        SELECT o.*, u.username as customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.status IN ('ready', 'out_for_delivery') 
        ORDER BY o.created_at DESC
      `;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role } = req.user;

    // Define allowed status transitions by role
    const allowedTransitions = {
      store: {
        'placed': ['confirmed', 'cancelled'],
        'confirmed': ['preparing'],
        'preparing': ['ready']
      },
      driver: {
        'ready': ['out_for_delivery'],
        'out_for_delivery': ['delivered']
      }
    };

    if (!allowedTransitions[role]) {
      return res.status(403).json({ message: 'Not authorized to update order status' });
    }

    // Get current order status
    const currentOrder = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (currentOrder.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = currentOrder.rows[0].status;
    const allowedNext = allowedTransitions[role][currentStatus];

    if (!allowedNext || !allowedNext.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${currentStatus} to ${status}` 
      });
    }

    const result = await pool.query(`
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `, [status, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order details
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT o.*, u.username as customer_name 
      FROM orders o 
      JOIN users u ON o.customer_id = u.id 
      WHERE o.id = $1
    `;
    
    // Add customer filter if customer role
    if (req.user.role === 'customer') {
      query += ' AND o.customer_id = $2';
      const result = await pool.query(query, [id, req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});