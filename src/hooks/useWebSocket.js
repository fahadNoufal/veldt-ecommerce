import { useRef, useEffect, useCallback } from 'react';

const WS_URL = 'ws://localhost:8080/ws';

/**
 * Persistent WebSocket that auto-reconnects.
 * onMessage(event) is called with a parsed JSON object on every inbound message.
 */
export function useWebSocket(onMessage) {
  const ws          = useRef(null);
  const onMsgRef    = useRef(onMessage);
  const reconnTimer = useRef(null);

  // Keep callback ref fresh without restarting the socket
  useEffect(() => { onMsgRef.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    const sock = new WebSocket(WS_URL);
    ws.current = sock;

    sock.onopen  = () => sock.__open = true;
    sock.onclose = () => {
      sock.__open = false;
      reconnTimer.current = setTimeout(connect, 3000);
    };
    sock.onerror = () => {};
    sock.onmessage = (e) => {
      try { onMsgRef.current(JSON.parse(e.data)); } catch {}
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  const isOpen = () => ws.current?.readyState === WebSocket.OPEN;

  const send = useCallback((payload) => {
    if (isOpen()) {
      ws.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  return { send, isOpen };
}
