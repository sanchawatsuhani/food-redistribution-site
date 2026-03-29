import cron from 'node-cron';
import db from '../config/database.js';

/**
 * Start the expiry automation cron job.
 * Runs every 5 minutes and marks food listings older than 2 hours as "Expired".
 */
export function startExpiryService(io) {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    try {
      const expiredListings = db.prepare(`
        SELECT id FROM food_listings 
        WHERE status = 'Available' AND createdAt < datetime('now', '-2 hours')
      `).all();

      if (expiredListings.length > 0) {
        db.prepare(`
          UPDATE food_listings 
          SET status = 'Expired' 
          WHERE status = 'Available' AND createdAt < datetime('now', '-2 hours')
        `).run();

        console.log(`⏰ [Expiry Service] Marked ${expiredListings.length} listing(s) as expired.`);

        // Emit real-time events for each expired listing
        if (io) {
          expiredListings.forEach(listing => {
            io.emit('food:expired', { foodId: listing.id });
          });
        }
      }
    } catch (err) {
      console.error('Expiry service error:', err);
    }
  });

  console.log('⏰ Expiry service started (runs every 5 minutes)');
}
