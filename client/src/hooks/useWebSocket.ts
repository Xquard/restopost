import { useEffect, useState, useRef, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(tenantId: number | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!tenantId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
      
      // Authenticate with tenantId
      if (tenantId) {
        socket.send(JSON.stringify({
          type: 'auth',
          tenantId: tenantId
        }));
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [tenantId]);

  // Function to send messages
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  // Function to update table status
  const updateTableStatus = useCallback((tableId: number, status: string) => {
    sendMessage({
      type: 'table_update',
      tableId,
      status
    });
  }, [sendMessage]);

  // Function to update order status
  const updateOrderStatus = useCallback((orderId: number, status: string) => {
    sendMessage({
      type: 'order_update',
      orderId,
      status
    });
  }, [sendMessage]);

  // Function to update order item status
  const updateOrderItemStatus = useCallback((orderItemId: number, status: string) => {
    sendMessage({
      type: 'order_item_update',
      orderItemId,
      status
    });
  }, [sendMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    updateTableStatus,
    updateOrderStatus,
    updateOrderItemStatus
  };
}
