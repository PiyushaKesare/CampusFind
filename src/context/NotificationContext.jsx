import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getStoredNotifications,
  markNotificationAsRead,
  addInAppNotification,
  subscribeToNotifications
} from "../services/dataService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const refreshNotifications = () => {
    const list = getStoredNotifications();
    setNotifications(list);
  };

  // With Firebase, the feed is live from Firestore; otherwise it uses local storage.
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(currentUser?.id, setNotifications);
    if (unsubscribe) return unsubscribe;
    refreshNotifications();

    const handleRefresh = () => refreshNotifications();
    window.addEventListener("campus-notifications-updated", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    return () => {
      window.removeEventListener("campus-notifications-updated", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
    };
  }, [currentUser?.id]);

  // Notifications are addressed to a specific student where applicable. Keep
  // generic campus notices visible to everyone, but never leak another user's
  // match/claim alerts into this account's bell.
  const visibleNotifications = notifications.filter(
    (notification) => !notification.targetUserId || notification.targetUserId === currentUser?.id
  );

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleAddNotification = (notif) => {
    const added = addInAppNotification(notif);
    refreshNotifications();
    return added;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: visibleNotifications,
        unreadCount,
        markAsRead: handleMarkAsRead,
        addNotification: handleAddNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
