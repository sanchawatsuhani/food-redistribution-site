import db from '../config/database.js';

let ioInstance;

export const setIoInstance = (io) => {
  ioInstance = io;
};

// Internal helper to create DB notification and emit via Socket.IO
export const createNotification = ({ userId, title, message, type = 'info' }) => {
  try {
    const result = db.prepare(`
      INSERT INTO notifications (userId, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(userId, title, message, type);

    const notificationId = result.lastInsertRowid;
    
    const notification = db.prepare(`
      SELECT * FROM notifications WHERE id = ?
    `).get(notificationId);
    
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Notify all NGOs in the given area about a new food listing.
 */
export function notifyNGOsInArea(area, listing) {
  const ngos = db.prepare(
    "SELECT * FROM users WHERE role = 'ngo' AND area = ? AND availability = 1"
  ).all(area);

  if (ngos.length === 0) return;

  const title = `New Food in ${area}`;
  const message = `${listing.foodItem} (${listing.quantity}) by ${listing.donorName}`;

  ngos.forEach(ngo => {
    createNotification({
      userId: ngo.id,
      title,
      message,
      type: 'info'
    });
  });
}

/**
 * Notify a donor that their food has been claimed.
 */
export function notifyDonor(donorId, listing, ngoName) {
  const donor = db.prepare('SELECT * FROM users WHERE id = ?').get(donorId);
  if (!donor) return;

  createNotification({
    userId: donor.id,
    title: 'Food Claimed!',
    message: `Your listing for "${listing.foodItem}" was claimed by ${ngoName}.`,
    type: 'success'
  });
}
