'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinFlight: (flightId: string) => void;
  leaveFlight: (flightId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinFlight: () => {},
  leaveFlight: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3011';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinFlight = (flightId: string) => {
    if (socket) {
      socket.emit('join:flight', flightId);
    }
  };

  const leaveFlight = (flightId: string) => {
    if (socket) {
      socket.emit('leave:flight', flightId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinFlight, leaveFlight }}>
      {children}
    </SocketContext.Provider>
  );
}
