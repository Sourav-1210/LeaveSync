import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

/* ── Helpers ── */
function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const TYPE_CONFIG = {
    success: { icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    error: { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    info: { icon: Info, bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400', dot: 'bg-teal-500' },
};

/* ── Notification Panel ── */
function NotificationPanel() {
    const { notifications, unreadCount, markAsRead, markAllRead, clearAll, deleteOne } = useNotification();

    return (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs font-bold bg-teal-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            title="Mark all as read"
                            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                        >
                            <CheckCheck size={13} /> All read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            title="Clear all"
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Bell size={32} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">No notifications yet</p>
                        <p className="text-xs mt-1">Actions you take will appear here</p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={n.id}
                                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${!n.read ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}
                            >
                                {/* Type icon */}
                                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${cfg.bg}`}>
                                    <Icon size={15} className={cfg.text} />
                                </div>

                                {/* Content — click body to mark as read */}
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    className="flex-1 min-w-0 text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs font-bold truncate ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {n.title}
                                        </p>
                                        {!n.read && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                                </button>

                                {/* Per-item: Read + Delete buttons */}
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            title="Mark as read"
                                            className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                                        >
                                            <CheckCheck size={12} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteOne(n.id)}
                                        title="Delete"
                                        className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

/* ── Main Navbar ── */
const Navbar = ({ onMenuClick }) => {
    const { user, avatar } = useAuth();
    const { dark, toggle } = useTheme();
    const { unreadCount } = useNotification();
    const [panelOpen, setPanelOpen] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const PAGE_TITLE = {
        admin: 'Admin Panel',
        manager: 'Manager Dashboard',
        employee: 'Employee Dashboard',
    };

    const PROFILE_ROUTE = {
        admin: '/dashboard/admin/profile',
        manager: '/dashboard/manager/profile',
        employee: '/dashboard/employee/profile',
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setPanelOpen(false);
            }
        };
        if (panelOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [panelOpen]);

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                        {PAGE_TITLE[user?.role]}
                    </h1>
                    <p className="text-xs text-gray-400 hidden sm:block">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                {/* Notification bell */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={() => setPanelOpen(prev => !prev)}
                        className={`p-2 rounded-xl transition-colors relative ${panelOpen ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {panelOpen && <NotificationPanel />}
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggle}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                </button>

                {/* Clickable Profile Avatar */}
                <button
                    onClick={() => navigate(PROFILE_ROUTE[user?.role] || '/dashboard/employee/profile')}
                    title="View Profile"
                    className="flex items-center gap-2.5 ml-1 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-teal-500/40 group-hover:ring-teal-500 transition-all flex-shrink-0">
                        {avatar ? (
                            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
