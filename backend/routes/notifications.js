import { Router } from 'express';
import db from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all notifications for the current user
router.get('/', authenticate, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT 50
    `).all(req.user.id);

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// Mark a specific notification as read
router.put('/:id/read', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure it belongs to the user
    const result = db.prepare(`
      UPDATE notifications 
      SET isRead = 1 
      WHERE id = ? AND userId = ?
    `).run(id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notification not found or unauthorized.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, (req, res) => {
  try {
    db.prepare(`
      UPDATE notifications 
      SET isRead = 1 
      WHERE userId = ?
    `).run(req.user.id);

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

export default router;
