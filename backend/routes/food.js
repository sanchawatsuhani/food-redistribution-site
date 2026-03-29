import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { notifyNGOsInArea, notifyDonor } from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  }
});

const router = Router();

// Create food listing (Donor only)
router.post('/', authenticate, requireRole('donor'), upload.single('image'), (req, res) => {
  try {
    const { foodItem, quantity, location, area, pickupTime } = req.body;

    if (!foodItem || !quantity || !location || !area || !pickupTime) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const result = db.prepare(`
      INSERT INTO food_listings (foodItem, quantity, location, area, pickupTime, donorId, donorName, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(foodItem, quantity, location, area, pickupTime, req.user.id, req.user.displayName, imageUrl);

    const listing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(result.lastInsertRowid);

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('food:created', listing);
    }

    // Notify NGOs in the same area
    notifyNGOsInArea(area, listing);

    res.status(201).json({ listing });
  } catch (err) {
    console.error('Create food error:', err);
    res.status(500).json({ error: 'Failed to create food listing.' });
  }
});

// Get all available food listings (with optional area filter)
router.get('/', (req, res) => {
  try {
    const { area, status } = req.query;
    let query = 'SELECT * FROM food_listings';
    const params = [];
    const conditions = [];

    if (area) {
      conditions.push('area = ?');
      params.push(area);
    }
    if (status) {
      // Treat NULL/legacy rows as Available so NGOs still see valid donations
      conditions.push("COALESCE(status, 'Available') = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';

    const listings = db.prepare(query).all(...params);
    res.json({ listings });
  } catch (err) {
    console.error('Get food error:', err);
    res.status(500).json({ error: 'Failed to get food listings.' });
  }
});

// Get current donor's listings
router.get('/mine', authenticate, (req, res) => {
  try {
    const listings = db.prepare(
      'SELECT * FROM food_listings WHERE donorId = ? ORDER BY createdAt DESC'
    ).all(req.user.id);
    res.json({ listings });
  } catch (err) {
    console.error('Get my listings error:', err);
    res.status(500).json({ error: 'Failed to get your listings.' });
  }
});

// Claim food (NGO only)
router.put('/:id/claim', authenticate, requireRole('ngo'), (req, res) => {
  try {
    const { id } = req.params;
    const listing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(id);

    if (!listing) {
      return res.status(404).json({ error: 'Food listing not found.' });
    }

    const effectiveStatus = listing.status || 'Available';
    if (effectiveStatus !== 'Available') {
      return res.status(400).json({ error: `Food is already ${effectiveStatus.toLowerCase()}.` });
    }

    // Update listing status
    db.prepare(`
      UPDATE food_listings SET status = 'Claimed', claimedBy = ?, claimedByName = ? WHERE id = ?
    `).run(req.user.id, req.user.displayName, id);

    // Create pickup record
    db.prepare(`
      INSERT INTO pickups (foodId, ngoId, ngoName, donorId, foodItem, scheduledTime)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, req.user.displayName, listing.donorId, listing.foodItem, listing.pickupTime);

    const updatedListing = db.prepare('SELECT * FROM food_listings WHERE id = ?').get(id);

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('food:claimed', {
        listing: updatedListing,
        claimedBy: { id: req.user.id, name: req.user.displayName }
      });
    }

    // Notify donor
    notifyDonor(listing.donorId, listing, req.user.displayName);

    res.json({ listing: updatedListing });
  } catch (err) {
    console.error('Claim food error:', err);
    res.status(500).json({ error: 'Failed to claim food.' });
  }
});

export default router;
