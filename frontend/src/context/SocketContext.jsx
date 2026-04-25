import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast, fetchNotifications } = useNotifications();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (user && accessToken) {
      const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');
      const newSocket = io(socketUrl, {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket Connected');
      });

      newSocket.on('notification', (notification) => {
        addToast(notification.type === 'error' ? 'error' : 'info', notification.title, notification.message);
        fetchNotifications();
      });

      newSocket.on('new_message', ({ chatId, message }) => {
        addToast('info', 'New Support Message', message.text.slice(0, 50) + '...');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
