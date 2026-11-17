const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * Register a new user account
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [normalizedEmail]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert into users table
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), normalizedEmail, passwordHash, phone || null, 'CUSTOMER']
        );

        const userId = result.insertId;

        // Also ensure customer record exists for backward compatibility
        await pool.query(
            'INSERT INTO customers (customer_name, email) VALUES (?, ?) ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name)',
            [name.trim(), normalizedEmail]
        );

        // Generate JWT token
        const token = jwt.sign(
            { user_id: userId, name: name.trim(), email: normalizedEmail, role: 'CUSTOMER' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to CinePass.',
            token,
            user: {
                user_id: userId,
                name: name.trim(),
                email: normalizedEmail,
                phone: phone || null,
                role: 'CUSTOMER'
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Query user by email
        const [users] = await pool.query(
            'SELECT user_id, name, email, password_hash, phone, role FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { user_id: user.user_id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get logged in user profile
 */
exports.getMe = async (req, res, next) => {
    try {
        const [users] = await pool.query(
            'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        res.json({ success: true, user: users[0] });
    } catch (err) {
        next(err);
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        }

        await pool.query(
            'UPDATE users SET name = ?, phone = ? WHERE user_id = ?',
            [name.trim(), phone || null, req.user.user_id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: { user_id: req.user.user_id, name: name.trim(), phone }
        });
    } catch (err) {
        next(err);
    }
};
