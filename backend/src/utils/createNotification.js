const Notification = require('../models/Notification');

const createNotification = async (userId, type, title, message, link = '/') => {
  try {
    if (!userId) return; // Cannot notify if no user ID
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    });

    if (global.io && userId) {
      global.io.to(userId.toString()).emit('notification', notification);
    }
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

<<<<<<< HEAD
module.exports = createNotification;
=======
module.exports = createNotification;
>>>>>>> 5bbf7a6 (add utils)
