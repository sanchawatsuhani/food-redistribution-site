import { Router } from 'express';
import db from '../config/database.js';

const router = Router();

// Impact stats
router.get('/impact', (req, res) => {
  try {
    const totalListings = db.prepare('SELECT COUNT(*) as count FROM food_listings').get().count;
    const claimedListings = db.prepare("SELECT COUNT(*) as count FROM food_listings WHERE status = 'Claimed'").get().count;
    const completedPickups = db.prepare("SELECT COUNT(*) as count FROM pickups WHERE status = 'Completed'").get().count;
    const activeDonors = db.prepare("SELECT COUNT(DISTINCT donorId) as count FROM food_listings").get().count;
    const activeNGOs = db.prepare("SELECT COUNT(DISTINCT ngoId) as count FROM pickups").get().count;
    const totalMealsSaved = db.prepare(
      "SELECT COALESCE(SUM(CASE WHEN quantity GLOB '[0-9]*' THEN CAST(quantity AS INTEGER) ELSE 1 END), 0) as total FROM food_listings WHERE status IN ('Claimed')"
    ).get().total;

    res.json({
      stats: {
        totalListings,
        claimedListings,
        completedPickups,
        activeDonors,
        activeNGOs,
        totalMealsSaved
      }
    });
  } catch (err) {
    console.error('Impact stats error:', err);
    res.status(500).json({ error: 'Failed to get impact stats.' });
  }
});

// Leaderboard - top donors
router.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = db.prepare(`
      SELECT 
        u.displayName as name,
        u.area,
        COUNT(f.id) as totalDonations,
        SUM(CASE WHEN f.status = 'Claimed' THEN 1 ELSE 0 END) as claimedCount
      FROM users u
      JOIN food_listings f ON u.id = f.donorId
      WHERE u.role = 'donor'
      GROUP BY u.id
      ORDER BY totalDonations DESC
      LIMIT 10
    `).all();

    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to get leaderboard.' });
  }
});

// Get all areas (for filter dropdowns)
router.get('/areas', (req, res) => {
  try {
    const areas = db.prepare('SELECT DISTINCT area FROM users ORDER BY area').all();
    res.json({ areas: areas.map(a => a.area) });
  } catch (err) {
    console.error('Areas error:', err);
    res.status(500).json({ error: 'Failed to get areas.' });
  }
});

export default router;
