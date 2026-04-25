const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.user.name} (${socket.id})`);

    // Join a room based on userId for private notifications
    socket.join(socket.user._id.toString());

    // If admin, join admin room
    if (socket.user.role === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};

module.exports = { socketHandler };