import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket, WebSocketMessage } from './useWebSocket';

export interface ChatMessage {
  id: number;
  type: 'client' | 'supervisor' | 'system';
  message: string;
  time: string;
  senderName?: string;
}

export interface UseClientChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  isConnected: boolean;
  sessionId: string | null;
  disconnect: () => void;
  connect: () => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export const useClientChat = (): UseClientChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCounter, setMessageCounter] = useState(0);
  const [shouldConnect, setShouldConnect] = useState(false);
  const hasWelcomeMessage = useRef(false);

  const handleMessage = useCallback((wsMessage: WebSocketMessage) => {
    console.log('Received message:', wsMessage);

    switch (wsMessage.type) {
      case 'CONNECT': {
        if (wsMessage.payload?.sessionId) {
          setSessionId(wsMessage.payload.sessionId as string);
          if (!hasWelcomeMessage.current) {
            hasWelcomeMessage.current = true;
            const welcomeMessage: ChatMessage = {
              id: Date.now(),
              type: 'system',
              message: 'Bem-vindo ao suporte Opty! Em que posso ajudar?',
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, welcomeMessage]);
          }
        } else if (wsMessage.payload?.message?.includes('Supervisor')) {
          const systemMessage: ChatMessage = {
            id: Date.now(),
            type: 'system',
            message: wsMessage.payload.message as string,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, systemMessage]);
        }
        break;
      }
      case 'MESSAGE': {
        if (wsMessage.from === 'SUPERVISOR' && wsMessage.payload?.text) {
          const newMessage: ChatMessage = {
            id: Date.now(),
            type: 'supervisor',
            message: wsMessage.payload.text as string,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            senderName: 'Supervisor',
          };
          setMessages((prev) => [...prev, newMessage]);
        }
        break;
      }
      case 'DISCONNECT': {
        const disconnectMessage: ChatMessage = {
          id: Date.now(),
          type: 'system',
          message: 'O supervisor saiu da conversa',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, disconnectMessage]);
        break;
      }
      case 'ERROR': {
        const errorMessage: ChatMessage = {
          id: Date.now(),
          type: 'system',
          message: `Erro: ${wsMessage.payload?.error || 'Erro desconhecido'}`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        break;
      }
    }
  }, []);

  const handleOpen = useCallback(() => {
    console.log('Client connected to WebSocket');
  }, []);

  const handleClose = useCallback(() => {
    console.log('Client disconnected from WebSocket');
  }, []);

  const handleError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
  }, []);

  const { sendMessage: wsSendMessage, isConnected, disconnect } = useWebSocket({
    url: `${WS_URL}/ws/client`,
    shouldConnect,
    onMessage: handleMessage,
    onOpen: handleOpen,
    onClose: handleClose,
    onError: handleError,
  });

  const connect = useCallback(() => {
    setShouldConnect(true);
    setSessionId((prev) => prev || (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)));
    if (!hasWelcomeMessage.current) {
      hasWelcomeMessage.current = true;
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        type: 'system',
        message: 'Bem-vindo ao suporte Opty! Em que posso ajudar?',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
    }
    setTimeout(() => {
      setSessionId((sid) => {
        if (!sid) return sid;
        try {
          const key = 'optySessions';
          const existing: Array<{
            sessionId: string;
            paired?: boolean;
            createdAt?: string;
            waitingTimeMinutes?: number;
            waitingTimeSeconds?: number;
          }> = JSON.parse(localStorage.getItem(key) || '[]') || [];
          const now = new Date();
          const session = {
            sessionId: sid,
            paired: false,
            createdAt: now.toISOString(),
            waitingTimeMinutes: 0,
            waitingTimeSeconds: 0,
          };
          const updated = [session, ...existing.filter((s) => s.sessionId !== sid)];
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          void e;
        }
        return sid;
      });
    }, 100);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!sessionId) {
        console.warn('Cannot send message: No sessionId');
        return;
      }

      if (!text.trim()) {
        return;
      }

      // Add message to local state immediately
      const newMessage: ChatMessage = {
        id: messageCounter,
        type: 'client',
        message: text,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        senderName: 'Você',
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessageCounter((prev) => prev + 1);

      // Send via WebSocket
      const wsMessage: WebSocketMessage = {
        sessionId,
        from: 'CLIENT',
        type: 'MESSAGE',
        payload: {
          text,
          timestamp: new Date().toISOString(),
        },
      };
      wsSendMessage(wsMessage);
    },
    [sessionId, wsSendMessage, messageCounter]
  );

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('Client chat hook unmounting, disconnecting...');
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    sendMessage,
    isConnected,
    sessionId,
    disconnect,
    connect,
  };
};
