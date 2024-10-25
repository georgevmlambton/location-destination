import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth } from '../firebase';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let cancel = false;

    const initializeSocket = async () => {
      const token = await auth.currentUser?.getIdToken();

      if (cancel) {
        return;
      }

      const socket = io(import.meta.env.VITE_API_URL, {
        extraHeaders: { Authorization: `Bearer ${token}` },
      });

      setSocket(socket);
    };

    if (!socket) {
      initializeSocket();
    }

    return () => {
      cancel = true;
      socket?.disconnect();
    };
  }, [socket]);

  return socket;
}
