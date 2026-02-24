import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
    return ctx;
};

const STORAGE_KEY = 'leavesync_notifications';

const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
};

const save = (list) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch { }
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(load);

    const update = useCallback((list) => {
        setNotifications(list);
        save(list);
    }, []);

    const addNotification = useCallback(({ type = 'info', title, message }) => {
        const entry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type,   // 'success' | 'warning' | 'error' | 'info'
            title,
            message,
            read: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications(prev => {
            const updated = [entry, ...prev].slice(0, 50); // max 50
            save(updated);
            return updated;
        });
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            save(updated);
            return updated;
        });
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            save(updated);
            return updated;
        });
    }, []);

    const clearAll = useCallback(() => {
        update([]);
    }, [update]);

    const deleteOne = useCallback((id) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== id);
            save(updated);
            return updated;
        });
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount,
            addNotification, markAsRead, markAllRead, clearAll, deleteOne,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
