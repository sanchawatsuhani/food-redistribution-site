import { Router } from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = Router();

// Get pickups for current user
router.get('/', authenticate, (req, res) => {
  try {
    let pickups;
    if (req.user.role === 'ngo') {
      pickups = db.prepare(
        'SELECT p.*, f.location, f.area, f.quantity, f.imageUrl FROM pickups p JOIN food_listings f ON p.foodId = f.id WHERE p.ngoId = ? ORDER BY p.createdAt DESC'
      ).all(req.user.id);
    } else {
      pickups = db.prepare(
        'SELECT p.*, f.location, f.area, f.quantity, f.imageUrl FROM pickups p JOIN food_listings f ON p.foodId = f.id WHERE p.donorId = ? ORDER BY p.createdAt DESC'
      ).all(req.user.id);
    }
    res.json({ pickups });
  } catch (err) {
    console.error('Get pickups error:', err);
    res.status(500).json({ error: 'Failed to get pickups.' });
  }
});

// Complete a pickup
router.put('/:id/complete', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const pickup = db.prepare('SELECT * FROM pickups WHERE id = ?').get(id);

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found.' });
    }

    if (pickup.ngoId !== req.user.id && pickup.donorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    db.prepare('UPDATE pickups SET status = ? WHERE id = ?').run('Completed', id);

    const updatedPickup = db.prepare(
      'SELECT p.*, f.location, f.area, f.quantity, f.imageUrl FROM pickups p JOIN food_listings f ON p.foodId = f.id WHERE p.id = ?'
    ).get(id);

    const io = req.app.get('io');
    if (io) {
      io.emit('pickup:completed', updatedPickup);
    }

    const targetUserId = req.user.role === 'ngo' ? updatedPickup.donorId : updatedPickup.ngoId;
    createNotification({
      userId: targetUserId,
      title: 'Pickup Completed',
      message: `Pickup for ${updatedPickup.foodItem} has been marked as completed.`,
      type: 'success'
    });

    res.json({ pickup: updatedPickup });
  } catch (err) {
    console.error('Complete pickup error:', err);
    res.status(500).json({ error: 'Failed to complete pickup.' });
  }
});

// Cancel a pickup
router.put('/:id/cancel', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const pickup = db.prepare('SELECT * FROM pickups WHERE id = ?').get(id);

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found.' });
    }

    db.prepare('UPDATE pickups SET status = ? WHERE id = ?').run('Cancelled', id);
    // Release the food listing back to Available
    db.prepare("UPDATE food_listings SET status = 'Available', claimedBy = NULL, claimedByName = '' WHERE id = ?").run(pickup.foodId);

    const io = req.app.get('io');
    if (io) {
      io.emit('pickup:cancelled', { pickupId: pickup.id, foodId: pickup.foodId });
    }

    const targetUserId = req.user.role === 'ngo' ? pickup.donorId : pickup.ngoId;
    createNotification({
      userId: targetUserId,
      title: 'Pickup Cancelled',
      message: `Pickup for ${pickup.foodItem} has been cancelled.`,
      type: 'warning'
    });

    res.json({ message: 'Pickup cancelled.' });
  } catch (err) {
    console.error('Cancel pickup error:', err);
    res.status(500).json({ error: 'Failed to cancel pickup.' });
  }
});

export default router;
