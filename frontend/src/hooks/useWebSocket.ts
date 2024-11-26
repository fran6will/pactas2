// src/hooks/useWebSocket.ts
import { useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket;

export const useWebSocket = (questionId: string, onUpdate: (data: any) => void) => {
  useEffect(() => {
    socket = io('https://pactas2.onrender.com/');

    socket.on(`question:${questionId}:update`, onUpdate);

    return () => {
      socket.off(`question:${questionId}:update`);
      socket.close();
    };
  }, [questionId, onUpdate]);

  const emitBet = useCallback((data: any) => {
    socket.emit('placeBet', data);
  }, []);

  return { emitBet };
};