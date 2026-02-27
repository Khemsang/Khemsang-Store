import { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useMessages } from "../../context/MessageContext";
import { Loading } from "../../components/ui/loading";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
} from "../../components/ui/dialog";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import {
  Send,
  Trash2,
  Reply,
  Inbox as InboxIcon,
  Plus,
  RefreshCw,
  Search,
  Star,
  Archive,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Menu,
  Edit3,
  RotateCcw,
  Filter,
  X,
  Paperclip,
  Download,
  FileText,
} from "lucide-react";

interface Message {
  _id: string;
  sender: { _id: string; name: string; email: string };
  recipient: { _id: string; name: string; email: string };
  subject: string;
  message: string;
  isRead: boolean;
  isStarred: boolean;
  isDraft: boolean;
  isReplied?: boolean;
  readAt?: string;
  createdAt: string;
  replies?: Message[];
  attachments?: { url: string; filename: string }[];
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

type ViewType = "inbox" | "starred" | "sent" | "drafts" | "trash";

const AdminInbox = () => {
  const { unreadCount: contextUnreadCount, refreshUnreadCount, decrementUnreadCount } = useMessages();
  const [allMessages, setAllMessages] = useState<{
    inbox: Message[];
    starred: Message[];
    sent: Message[];
    drafts: Message[];
    trash: Message[];
  }>({
    inbox: [],
    starred: [],
    sent: [],
    drafts: [],
    trash: [],
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("inbox");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Calculate unread counts for each view
  const unreadCounts = {
    inbox: contextUnreadCount,
    starred: allMessages.starred?.filter(m => !m.isRead).length || 0,
    sent: 0, // Sent messages don't have unread count
    drafts: 0, // Drafts don't have unread count
    trash: allMessages.trash?.filter(m => !m.isRead).length || 0,
  };
  const [showReplySection, setShowReplySection] = useState(false);
  const [filters, setFilters] = useState({
    readStatus: "all", // all, read, unread
    dateFrom: "",
    dateTo: "",
    sender: "",
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    variant?: "default" | "danger" | "success" | "warning";
    confirmText?: string;
  }>({
    open: false,
    title: "",
    onConfirm: () => {},
  });
  const [composeForm, setComposeForm] = useState({
    recipientId: "",
    recipientName: "",
    subject: "",
    message: "",
    draftId: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const { success, error } = useToast();
  const recipientDropdownRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);

  // Get admin email from localStorage or API
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAdminEmail(user.email || "");
        } else {
          // Fetch from API if not in localStorage
          const { data } = await api.get("/auth/me");
          setAdminEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to get user email:", err);
      }
    };
    getUserEmail();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recipientDropdownRef.current && !recipientDropdownRef.current.contains(event.target as Node)) {
        setShowRecipientDropdown(false);
      }
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAllMessages();
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Filter messages when view changes
    setMessages(allMessages[currentView] || []);
  }, [currentView, allMessages]);

  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch all message types in parallel
      const [inboxRes, starredRes, sentRes, draftsRes, trashRes] = await Promise.all([
        api.get("/messages/inbox"),
        api.get("/messages/starred"),
        api.get("/messages/sent"),
        api.get("/messages/drafts"),
        api.get("/messages/trash"),
      ]);

      setAllMessages({
        inbox: inboxRes.data,
        starred: starredRes.data,
        sent: sentRes.data,
        drafts: draftsRes.data,
        trash: trashRes.data,
      });
      
      // Refresh context unread count
      await refreshUnreadCount();
    } catch (err) {
      error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/stats/users");
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get("/messages/unread/count");
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchMessages = async () => {
    // Refresh all messages
    await fetchAllMessages();
  };

  const handleViewMessage = async (message: Message) => {
    try {
      const { data } = await api.get(`/messages/${message._id}`);
      setSelectedMessage(data);
      setShowReplySection(false);
      setReplyText("");
      
      const wasUnread = !message.isRead;
      
      // Update read status in allMessages for ALL views where this message might appear
      setAllMessages(prev => {
        const updated = { ...prev };
        // Update in all views - IMPORTANT: use map to preserve all messages
        Object.keys(updated).forEach(view => {
          updated[view as ViewType] = updated[view as ViewType].map((m) => 
            m._id === message._id ? { ...m, isRead: true, readAt: data.readAt } : m
          );
        });
        return updated;
      });
      
      // Update messages list (current view) - IMPORTANT: use map to preserve all messages
      setMessages(prev => prev.map(m => 
        m._id === message._id ? { ...m, isRead: true, readAt: data.readAt } : m
      ));
      
      // Update unread count in context if message was unread and in inbox
      if (wasUnread && currentView === "inbox") {
        decrementUnreadCount();
      }
      
      // For other views (starred, trash), the unread count is calculated from allMessages
      // so it will update automatically when we update allMessages above
    } catch (err) {
      error("Failed to load message");
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    setConfirmDialog({
      open: true,
      title: "Send Reply",
      description: "Are you sure you want to send this reply?",
      variant: "default",
      confirmText: "Send",
      onConfirm: async () => {
        try {
          setSending(true);
          
          const formData = new FormData();
          formData.append("recipientId", selectedMessage.sender._id);
          formData.append("subject", `Re: ${selectedMessage.subject}`);
          formData.append("message", replyText);
          formData.append("parentMessageId", selectedMessage._id);
          
          // Add attachments if any
          attachments.forEach((file) => {
            formData.append("attachments", file);
          });
          
          await api.post("/messages", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          
          success("Reply sent successfully");
          setReplyText("");
          setAttachments([]);
          setShowReplySection(false);
          setSelectedMessage(null);
          fetchMessages();
        } catch (err) {
          error("Failed to send reply");
        } finally {
          setSending(false);
        }
      },
    });
  };

  const handleSendNewMessage = async () => {
    if (!composeForm.recipientId || !composeForm.subject.trim() || !composeForm.message.trim()) {
      error("Please fill all fields");
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: "Send Message",
      description: `Send message to ${composeForm.recipientName}?`,
      variant: "default",
      confirmText: "Send",
      onConfirm: async () => {
        try {
          setSending(true);
          
          const formData = new FormData();
          formData.append("recipientId", composeForm.recipientId);
          formData.append("subject", composeForm.subject);
          formData.append("message", composeForm.message);
          
          // Add attachments
          attachments.forEach((file) => {
            formData.append("attachments", file);
          });
          
          if (composeForm.draftId) {
            await api.post("/messages", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            await api.delete(`/messages/${composeForm.draftId}/permanent`);
            success("Draft sent successfully");
          } else {
            await api.post("/messages", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            success("Message sent successfully");
          }
          
          setComposeForm({ recipientId: "", recipientName: "", subject: "", message: "", draftId: "" });
          setRecipientSearch("");
          setAttachments([]);
          setShowCompose(false);
          fetchMessages();
        } catch (err) {
          error("Failed to send message");
        } finally {
          setSending(false);
        }
      },
    });
  };

  const handleSaveDraft = async () => {
    if (!composeForm.recipientId && !composeForm.subject.trim() && !composeForm.message.trim()) {
      // Empty draft - don't save
      return;
    }
    try {
      await api.post("/messages/draft", {
        recipientId: composeForm.recipientId,
        subject: composeForm.subject || "(No Subject)",
        message: composeForm.message,
        draftId: composeForm.draftId || undefined,
      });
      if (currentView === "drafts") {
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const handleCloseCompose = async (autoSave = false) => {
    // Auto-save if there's content and autoSave is true
    if (autoSave && (composeForm.recipientId || composeForm.subject.trim() || composeForm.message.trim())) {
      await handleSaveDraft();
    }
    
    setShowCompose(false);
    setComposeForm({ recipientId: "", recipientName: "", subject: "", message: "", draftId: "" });
    setRecipientSearch("");
    setShowRecipientDropdown(false);
    setAttachments([]);
  };

  const handleCancelCompose = () => {
    // Cancel without saving
    setShowCompose(false);
    setComposeForm({ recipientId: "", recipientName: "", subject: "", message: "", draftId: "" });
    setRecipientSearch("");
    setShowRecipientDropdown(false);
    setAttachments([]);
  };

  const handleEditDraft = (draft: Message) => {
    setComposeForm({
      recipientId: draft.recipient._id,
      recipientName: `${draft.recipient.name} (${draft.recipient.email})`,
      subject: draft.subject,
      message: draft.message,
      draftId: draft._id,
    });
    setRecipientSearch(`${draft.recipient.name} (${draft.recipient.email})`);
    setShowCompose(true);
  };

  const handleSelectRecipient = (customer: Customer) => {
    setComposeForm({
      ...composeForm,
      recipientId: customer._id,
      recipientName: `${customer.name} (${customer.email})`,
    });
    setRecipientSearch(`${customer.name} (${customer.email})`);
    setShowRecipientDropdown(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const handleDelete = async (messageId: string) => {
    const isTrash = currentView === "trash";
    
    setConfirmDialog({
      open: true,
      title: isTrash ? "Delete Forever" : "Move to Trash",
      description: isTrash 
        ? "This message will be permanently deleted and cannot be recovered." 
        : "This message will be moved to trash.",
      variant: "danger",
      confirmText: isTrash ? "Delete Forever" : "Move to Trash",
      onConfirm: async () => {
        try {
          if (isTrash) {
            await api.delete(`/messages/${messageId}/permanent`);
            success("Message permanently deleted");
          } else {
            await api.delete(`/messages/${messageId}`);
            success("Message moved to trash");
          }
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
          if (selectedMessage?._id === messageId) {
            setSelectedMessage(null);
          }
          
          // Refresh unread count from context
          await refreshUnreadCount();
        } catch (err) {
          error("Failed to delete message");
        }
      },
    });
  };

  const handleToggleStar = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const message = messages.find(m => m._id === messageId);
    const action = message?.isStarred ? "Unstar" : "Star";
    
    setConfirmDialog({
      open: true,
      title: `${action} Message`,
      description: `${action} this message?`,
      variant: "warning",
      confirmText: action,
      onConfirm: async () => {
        try {
          const { data } = await api.put(`/messages/${messageId}/star`);
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId ? { ...m, isStarred: data.isStarred } : m
            )
          );
          if (selectedMessage?._id === messageId) {
            setSelectedMessage({ ...selectedMessage, isStarred: data.isStarred });
          }
          success(`Message ${action.toLowerCase()}red`);
        } catch (err) {
          error(`Failed to ${action.toLowerCase()} message`);
        }
      },
    });
  };

  const handleRestore = async (messageId: string) => {
    setConfirmDialog({
      open: true,
      title: "Restore Message",
      description: "Restore this message from trash?",
      variant: "success",
      confirmText: "Restore",
      onConfirm: async () => {
        try {
          await api.put(`/messages/${messageId}/restore`);
          success("Message restored");
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
          if (selectedMessage?._id === messageId) {
            setSelectedMessage(null);
          }
          
          // Refresh unread count from context
          await refreshUnreadCount();
        } catch (err) {
          error("Failed to restore message");
        }
      },
    });
  };

  // Checkbox selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMessages(filteredMessages.map(m => m._id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (messageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedMessages(prev => [...prev, messageId]);
    } else {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: "Delete Messages",
      description: `Delete ${selectedMessages.length} message(s)?`,
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await Promise.all(selectedMessages.map(id => api.delete(`/messages/${id}`)));
          success(`${selectedMessages.length} message(s) deleted`);
          setMessages(prev => prev.filter(m => !selectedMessages.includes(m._id)));
          setSelectedMessages([]);
        } catch (err) {
          error("Failed to delete messages");
        }
      },
    });
  };

  const handleBulkStar = async () => {
    if (selectedMessages.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: "Star Messages",
      description: `Star ${selectedMessages.length} message(s)?`,
      variant: "warning",
      confirmText: "Star",
      onConfirm: async () => {
        try {
          await Promise.all(selectedMessages.map(id => api.put(`/messages/${id}/star`)));
          success(`${selectedMessages.length} message(s) starred`);
          fetchMessages();
          setSelectedMessages([]);
        } catch (err) {
          error("Failed to star messages");
        }
      },
    });
  };

  const filteredMessages = messages.filter((m) => {
    // Search filter
    const matchesSearch =
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    // Read status filter
    const matchesReadStatus =
      filters.readStatus === "all" ||
      (filters.readStatus === "read" && m.isRead) ||
      (filters.readStatus === "unread" && !m.isRead);

    // Date from filter
    const matchesDateFrom =
      !filters.dateFrom ||
      new Date(m.createdAt) >= new Date(filters.dateFrom);

    // Date to filter
    const matchesDateTo =
      !filters.dateTo ||
      new Date(m.createdAt) <= new Date(filters.dateTo + "T23:59:59");

    // Sender filter
    const matchesSender =
      !filters.sender ||
      m.sender.name.toLowerCase().includes(filters.sender.toLowerCase()) ||
      m.sender.email.toLowerCase().includes(filters.sender.toLowerCase());

    return (
      matchesSearch &&
      matchesReadStatus &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesSender
    );
  });

  const clearFilters = () => {
    setFilters({
      readStatus: "all",
      dateFrom: "",
      dateTo: "",
      sender: "",
    });
  };

  if (loading) return <Loading message="Loading inbox..." fullScreen={true} />;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
      {/* Mail Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <InboxIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Mail</span>
              <div className="flex items-center gap-1">
                {unreadCounts[currentView] > 0 && (
                  <span className="flex items-center justify-center min-w-[28px] h-7 px-2 text-sm font-bold bg-red-500 text-white rounded-full">
                    {unreadCounts[currentView] > 99 ? '99+' : unreadCounts[currentView]}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({allMessages[currentView]?.length || 0})
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mail"
              className="w-full pl-12 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button onClick={fetchMessages} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-2 transition-all duration-200">
            <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-3 px-6 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-full mb-4 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Compose</span>
          </button>

          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentView("inbox");
                setSelectedMessage(null); // Close current message
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200 ease-in-out ${
                currentView === "inbox"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <InboxIcon className="w-5 h-5" />
              <span className="font-medium flex-1 text-left">Inbox</span>
              {unreadCounts.inbox > 0 && (
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{unreadCounts.inbox}</span>
              )}
              <span className="text-xs text-gray-500">({allMessages.inbox?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("starred");
                setSelectedMessage(null); // Close current message
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200 ease-in-out ${
                currentView === "starred"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="text-left flex-1">Starred</span>
              {unreadCounts.starred > 0 && (
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{unreadCounts.starred}</span>
              )}
              <span className="text-xs text-gray-500">({allMessages.starred?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("sent");
                setSelectedMessage(null); // Close current message
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200 ease-in-out ${
                currentView === "sent"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Send className="w-5 h-5" />
              <span className="text-left flex-1">Sent</span>
              <span className="text-xs text-gray-500">({allMessages.sent?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("drafts");
                setSelectedMessage(null); // Close current message
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200 ease-in-out ${
                currentView === "drafts"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-left flex-1">Drafts</span>
              <span className="text-xs text-gray-500">({allMessages.drafts?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                setCurrentView("trash");
                setSelectedMessage(null); // Close current message
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-r-full transition-all duration-200 ease-in-out ${
                currentView === "trash"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-left flex-1">Trash</span>
              {unreadCounts.trash > 0 && (
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{unreadCounts.trash}</span>
              )}
              <span className="text-xs text-gray-500">({allMessages.trash?.length || 0})</span>
            </button>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedMessage ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer"
                    checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                    onChange={handleSelectAll}
                  />
                  {selectedMessages.length > 0 && (
                    <>
                      <button 
                        onClick={handleBulkDelete}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="Delete selected"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleBulkStar}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="Star selected"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {selectedMessages.length} selected
                      </span>
                    </>
                  )}
                  <button onClick={fetchMessages} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${showFilters ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                    title="Filters"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>1-{filteredMessages.length} of {messages.length}</span>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.readStatus}
                        onChange={(e) => setFilters({ ...filters, readStatus: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sender
                      </label>
                      <input
                        type="text"
                        value={filters.sender}
                        onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
                        placeholder="Filter by sender..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                    >
                      Clear Filters
                    </button>
                    <span className="text-xs text-gray-500">
                      Showing {filteredMessages.length} of {messages.length} messages
                    </span>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <InboxIcon className="w-20 h-20 mb-4" />
                    <p>{searchQuery ? "No messages found" : `No messages in ${currentView}`}</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:shadow-md cursor-pointer transition-all duration-200 ease-in-out ${
                        selectedMessage?._id === message._id 
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" 
                          : !message.isRead && currentView === "inbox" 
                            ? "bg-white dark:bg-gray-900 font-bold" 
                            : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 cursor-pointer" 
                        checked={selectedMessages.includes(message._id)}
                        onChange={(e) => handleSelectMessage(message._id, e)}
                      />
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(message._id, e);
                      }} className="p-1">
                        <Star className={`w-4 h-4 ${message.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`} />
                      </button>
                      <div 
                        onClick={() => handleViewMessage(message)}
                        className="flex-1 flex items-center gap-4 min-w-0"
                      >
                        <span className={`w-48 truncate ${!message.isRead && currentView === "inbox" ? "font-bold" : ""}`}>
                          {currentView === "sent" ? message.recipient.name : message.sender.name}
                        </span>
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <span className={`truncate ${!message.isRead && currentView === "inbox" ? "font-bold" : ""}`}>
                            {message.subject}
                          </span>
                          <span className="text-gray-500 text-sm truncate">
                            - {message.message.substring(0, 100)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.isReplied && currentView === "sent" && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                              <Reply className="w-3 h-3" />
                              Replied
                            </span>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              {message.attachments.length}
                            </span>
                          )}
                          {message.isDraft && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Draft</span>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="relative" ref={showMessageMenu === message._id ? messageMenuRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMessageMenu(showMessageMenu === message._id ? null : message._id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMessageMenu === message._id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewMessage(message);
                                setShowMessageMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <InboxIcon className="w-4 h-4" />
                              Open
                            </button>
                            {message.isDraft && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDraft(message);
                                  setShowMessageMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit3 className="w-4 h-4" />
                                Edit Draft
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(message._id, e);
                                setShowMessageMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Star className="w-4 h-4" />
                              {message.isStarred ? "Unstar" : "Star"}
                            </button>
                            {currentView === "trash" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestore(message._id);
                                  setShowMessageMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Restore
                              </button>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(message._id);
                                setShowMessageMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              {currentView === "trash" ? "Delete Forever" : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Message Detail View */
            <div key={selectedMessage._id} className="flex-1 flex flex-col overflow-hidden transition-opacity duration-200">
              <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Archive className="w-5 h-5" />
                </button>
                {currentView === "trash" ? (
                  <button onClick={() => handleRestore(selectedMessage._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                ) : currentView === "drafts" ? (
                  <button onClick={() => handleEditDraft(selectedMessage)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <Edit3 className="w-5 h-5" />
                  </button>
                ) : null}
                <button onClick={() => handleDelete(selectedMessage._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={(e) => handleToggleStar(selectedMessage._id, e)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Star className={`w-5 h-5 ${selectedMessage.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <h1 className="text-2xl font-normal mb-6">{selectedMessage.subject}</h1>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {selectedMessage.sender.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-medium">{selectedMessage.sender.name}</span>
                        <span className="text-gray-500 text-sm ml-2">&lt;{selectedMessage.sender.email}&gt;</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(selectedMessage.createdAt).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">to {selectedMessage.recipient.name}</div>
                  </div>
                </div>

                <div className="mb-8 text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>

                {/* Attachments */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments ({selectedMessage.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                        >
                          <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">Click to download</p>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="space-y-6 mb-8">
                    {selectedMessage.replies.map((reply) => (
                      <div key={reply._id} className="border-l-4 border-gray-300 pl-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                            {reply.sender.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{reply.sender.name}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(reply.createdAt).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                          {reply.message}
                        </div>
                        {/* Reply Attachments */}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {reply.attachments.map((attachment, index) => (
                                <a
                                  key={index}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate max-w-[200px]">{attachment.filename}</span>
                                  <Download className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!selectedMessage.isDraft && currentView !== "trash" && (
                  <div className="border-t pt-6">
                    <button
                      onClick={() => setShowReplySection(!showReplySection)}
                      className="flex items-center gap-2 mb-4 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Reply className="w-5 h-5" />
                      <span className="font-medium">Reply</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${showReplySection ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showReplySection && (
                      <div className="mt-4">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          rows={6}
                          className="mb-4"
                        />
                        
                        {/* Attachment Upload for Reply */}
                        <div className="mb-4">
                          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer w-fit transition-colors">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">Attach Files</span>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) {
                                  setAttachments(Array.from(e.target.files));
                                }
                              }}
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                            />
                          </label>
                          {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {attachments.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                                  <FileText className="w-4 h-4" />
                                  <span className="flex-1 truncate">{file.name}</span>
                                  <button
                                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={handleSendReply}
                            disabled={sending || !replyText.trim()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sending ? "Sending..." : "Send"}
                          </button>
                          <button 
                            onClick={() => {
                              setReplyText("");
                              setAttachments([]);
                              setShowReplySection(false);
                            }} 
                            className="px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog - Clean Shadcn Design */}
      <Dialog open={showCompose} onOpenChange={(open) => {
        if (!open) {
          // Dialog closing - auto-save draft
          handleCloseCompose(true);
        }
      }}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] p-0 overflow-hidden gap-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {composeForm.draftId ? "Edit Draft" : "New Message"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compose and send a message to your customer
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 bg-gray-50 dark:bg-gray-900">
            {/* Recipient Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Recipient
              </Label>
              <div className="relative" ref={recipientDropdownRef}>
                <Input
                  type="text"
                  value={recipientSearch}
                  onChange={(e) => {
                    setRecipientSearch(e.target.value);
                    setShowRecipientDropdown(true);
                    if (!e.target.value) {
                      setComposeForm({ ...composeForm, recipientId: "", recipientName: "" });
                    }
                  }}
                  onFocus={() => setShowRecipientDropdown(true)}
                  placeholder="Search customer by name or email..."
                  className="h-11 text-sm px-4 bg-white dark:bg-gray-800 border-2 rounded-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Dropdown with filtered customers */}
                {showRecipientDropdown && recipientSearch && filteredCustomers.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => handleSelectRecipient(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {customer.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message */}
                {showRecipientDropdown && recipientSearch && filteredCustomers.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No customers found matching "{recipientSearch}"
                  </div>
                )}
              </div>
              {composeForm.recipientId && (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Selected: {composeForm.recipientName}</span>
                </div>
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Subject
              </Label>
              <Input
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="Enter message subject..."
                className="h-11 text-sm px-4 bg-white dark:bg-gray-800 border-2 rounded-lg"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Message
              </Label>
              <Textarea
                value={composeForm.message}
                onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                placeholder="Type your message here..."
                rows={10}
                className="text-sm px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg resize-none"
              />
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{composeForm.message.length} characters</span>
                <span>Be clear and professional in your message</span>
              </div>
            </div>

            {/* Attachments Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Attachments
              </Label>
              <label className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to attach files (max 5 files, 10MB each)
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      if (attachments.length + newFiles.length > 5) {
                        error("Maximum 5 files allowed");
                        return;
                      }
                      setAttachments([...attachments, ...newFiles]);
                    }
                  }}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                />
              </label>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer with Action Buttons */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSendNewMessage}
                disabled={sending || !composeForm.recipientId || !composeForm.subject.trim() || !composeForm.message.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCancelCompose}
              className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  );
};

export default AdminInbox;
