const pool = require('../config/db');
const mockStore = require('../services/mockStore');

/**
 * Get all theatres with optional city filter
 */
exports.getAllTheatres = async (req, res, next) => {
    try {
        if (pool.isVercelFallback && pool.isVercelFallback()) {
            const theatres = mockStore.getTheatres(req.query);
            return res.json({ success: true, count: theatres.length, data: theatres, is_fallback: true });
        }

        const { city } = req.query;
        let query = 'SELECT * FROM theatres WHERE 1=1';
        const params = [];

        if (city && city.trim() && city.toLowerCase() !== 'all') {
            query += ' AND city = ?';
            params.push(city.trim());
        }

        query += ' ORDER BY city ASC, name ASC';

        const [theatres] = await pool.query(query, params);
        res.json({ success: true, count: theatres.length, data: theatres });
    } catch (err) {
        if (mockStore.isConnectionError(err) || err.message === 'DATABASE_OFFLINE') {
            console.warn('⚡ Using Seed Fallback for getAllTheatres');
            const theatres = mockStore.getTheatres(req.query);
            return res.json({ success: true, count: theatres.length, data: theatres, is_fallback: true });
        }
        next(err);
    }
};

/**
 * Get distinct cities where theatres exist
 */
exports.getCities = async (req, res, next) => {
    try {
        if (pool.isVercelFallback && pool.isVercelFallback()) {
            return res.json({ success: true, data: mockStore.getCities(), is_fallback: true });
        }

        const [rows] = await pool.query('SELECT DISTINCT city FROM theatres ORDER BY city ASC');
        const cities = rows.map(r => r.city);
        res.json({ success: true, data: cities });
    } catch (err) {
        if (mockStore.isConnectionError(err) || err.message === 'DATABASE_OFFLINE') {
            console.warn('⚡ Using Seed Fallback for getCities');
            return res.json({ success: true, data: mockStore.getCities(), is_fallback: true });
        }
        next(err);
    }
};

/**
 * Get single theatre details with screens
 */
exports.getTheatreById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (pool.isVercelFallback && pool.isVercelFallback()) {
            const theatre = mockStore.getTheatreById(id);
            if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
            return res.json({ success: true, data: theatre, is_fallback: true });
        }

        const [theatres] = await pool.query('SELECT * FROM theatres WHERE theatre_id = ?', [id]);
        if (theatres.length === 0) {
            return res.status(404).json({ success: false, message: 'Theatre not found' });
        }

        const [screens] = await pool.query(
            'SELECT * FROM screens WHERE theatre_id = ? ORDER BY screen_number ASC',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...theatres[0],
                screens
            }
        });
    } catch (err) {
        if (mockStore.isConnectionError(err) || err.message === 'DATABASE_OFFLINE') {
            console.warn(`⚡ Using Seed Fallback for getTheatreById(${req.params.id})`);
            const theatre = mockStore.getTheatreById(req.params.id);
            if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
            return res.json({ success: true, data: theatre, is_fallback: true });
        }
        next(err);
    }
};

/**
 * Add a new theatre
 */
exports.addTheatre = async (req, res, next) => {
    try {
        const { name, city, address, total_screens = 1 } = req.body;
        if (!name || !city || !address) {
            return res.status(400).json({ success: false, message: 'Name, city, and address are required' });
        }

        if (pool.isVercelFallback && pool.isVercelFallback()) {
            return res.status(201).json({
                success: true,
                message: 'Theatre added successfully (demo mode)',
                data: { theatre_id: Date.now(), name, city }
            });
        }

        const [result] = await pool.query(
            'INSERT INTO theatres (name, city, address, total_screens) VALUES (?, ?, ?, ?)',
            [name.trim(), city.trim(), address.trim(), parseInt(total_screens, 10) || 1]
        );

        res.status(201).json({
            success: true,
            message: 'Theatre added successfully',
            data: { theatre_id: result.insertId, name, city }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Edit a theatre
 */
exports.updateTheatre = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, city, address, total_screens } = req.body;

        if (pool.isVercelFallback && pool.isVercelFallback()) {
            return res.json({ success: true, message: 'Theatre updated successfully' });
        }

        await pool.query(
            'UPDATE theatres SET name = COALESCE(?, name), city = COALESCE(?, city), address = COALESCE(?, address), total_screens = COALESCE(?, total_screens) WHERE theatre_id = ?',
            [name, city, address, total_screens, id]
        );

        res.json({ success: true, message: 'Theatre updated successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a theatre safely
 */
exports.deleteTheatre = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (pool.isVercelFallback && pool.isVercelFallback()) {
            return res.json({ success: true, message: 'Theatre deleted successfully' });
        }

        // Check if shows exist for this theatre
        const [shows] = await pool.query('SELECT COUNT(*) AS count FROM shows WHERE theatre_id = ?', [id]);
        if (shows[0].count > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete theatre: ${shows[0].count} scheduled show(s) exist for this venue.`
            });
        }

        await pool.query('DELETE FROM theatres WHERE theatre_id = ?', [id]);
        res.json({ success: true, message: 'Theatre deleted successfully' });
    } catch (err) {
        next(err);
    }
};
