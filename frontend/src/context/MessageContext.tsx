import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../services/api";

interface MessageContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const { data } = await api.get("/messages/unread/count");
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    refreshUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MessageContext.Provider value={{ unreadCount, refreshUnreadCount, decrementUnreadCount }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
