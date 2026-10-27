import { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

interface MessageContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const QUERY_KEY = ["messages", "unread-count"] as const;

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      api.get("/messages/unread/count").then((r) => r.data.count as number),
    initialData: 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
  });

  const unreadCount = data ?? 0;

  const refreshUnreadCount = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: QUERY_KEY });
  }, [qc]);

  const decrementUnreadCount = useCallback(() => {
    qc.setQueryData<number>(QUERY_KEY, (prev = 0) => Math.max(0, prev - 1));
  }, [qc]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnreadCount, decrementUnreadCount }),
    [unreadCount, refreshUnreadCount, decrementUnreadCount]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) throw new Error("useMessages must be used within MessageProvider");
  return context;
};
