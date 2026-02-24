import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, LogOut, X, ChevronRight, UserCircle2, Banknote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = {
    employee: [
        { to: '/dashboard/employee', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/dashboard/employee/leaves', icon: FileText, label: 'My Leaves' },
        { to: '/dashboard/employee/reimbursements', icon: Banknote, label: 'Reimbursements' },
        { to: '/dashboard/employee/profile', icon: UserCircle2, label: 'My Profile' },
    ],
    manager: [
        { to: '/dashboard/manager', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/dashboard/manager/leaves', icon: FileText, label: 'Leave Requests' },
        { to: '/dashboard/manager/reimbursements', icon: Banknote, label: 'Reimbursements' },
        { to: '/dashboard/manager/team', icon: Users, label: 'My Team' },
        { to: '/dashboard/manager/profile', icon: UserCircle2, label: 'My Profile' },
    ],
    admin: [
        { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/dashboard/admin/users', icon: Users, label: 'Users' },
        { to: '/dashboard/admin/leaves', icon: FileText, label: 'All Leaves' },
        { to: '/dashboard/admin/reimbursements', icon: Banknote, label: 'Reimbursements' },
        { to: '/dashboard/admin/profile', icon: UserCircle2, label: 'My Profile' },
    ],
};

const ROLE_BADGE = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    employee: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const Sidebar = ({ open, onClose }) => {
    const { user, logout } = useAuth();
    const items = NAV_ITEMS[user?.role] || [];

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
          shadow-xl transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.8" />
                                <path d="M3 9h18" stroke="white" strokeWidth="1.8" />
                                <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.8" />
                                <path d="M8.5 14.5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">LeaveSync</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 lg:hidden text-gray-400 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${ROLE_BADGE[user?.role]}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {items.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to.split('/').length <= 3}
                            onClick={onClose}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            <span className="flex-1">{label}</span>
                            <ChevronRight size={14} className="opacity-30" />
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
