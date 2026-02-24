import { useEffect, useState } from 'react';
import { userService } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Mail, Building2, ShieldCheck, ToggleLeft, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    employee: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const loadUsers = () => {
        setLoading(true);
        userService.getAll()
            .then(({ data }) => setUsers(data.users || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadUsers(); }, []);

    const handleRoleChange = async (id, role) => {
        try {
            await userService.updateRole(id, role);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
            toast.success('Role updated');
        } catch { toast.error('Failed to update role'); }
    };

    const handleToggleStatus = async (id) => {
        try {
            const { data } = await userService.toggleStatus(id);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
            toast.success('Status updated');
        } catch { toast.error('Failed to update status'); }
    };

    const filtered = users
        .filter(u => roleFilter ? u.role === roleFilter : true)
        .filter(u => search ? (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) : true);

    const counts = {
        total: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        employee: users.filter(u => u.role === 'employee').length,
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Users</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage all users, roles, and access levels</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: counts.total, color: 'from-blue-500 to-blue-700' },
                    { label: 'Admins', value: counts.admin, color: 'from-purple-500 to-purple-700' },
                    { label: 'Managers', value: counts.manager, color: 'from-blue-400 to-blue-600' },
                    { label: 'Employees', value: counts.employee, color: 'from-teal-500 to-emerald-700' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="card flex items-center gap-4">
                        <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-8 py-1.5 text-sm w-full" />
                    </div>
                    <div className="flex gap-2">
                        {['', 'admin', 'manager', 'employee'].map(r => (
                            <button key={r} onClick={() => setRoleFilter(r)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${roleFilter === r ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-400'}`}>
                                {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* User table */}
            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="text-left font-semibold text-gray-500 dark:text-gray-400 pb-3 pr-4">User</th>
                            <th className="text-left font-semibold text-gray-500 dark:text-gray-400 pb-3 pr-4">Department</th>
                            <th className="text-left font-semibold text-gray-500 dark:text-gray-400 pb-3 pr-4">Role</th>
                            <th className="text-left font-semibold text-gray-500 dark:text-gray-400 pb-3 pr-4">Status</th>
                            <th className="text-left font-semibold text-gray-500 dark:text-gray-400 pb-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i}><td colSpan={5} className="py-3"><div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /></td></tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-gray-400">No users found</td></tr>
                        ) : filtered.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-sm">{user.name?.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                                    <span className="flex items-center gap-1"><Building2 size={13} className="text-gray-400" /> {user.department || 'General'}</span>
                                </td>
                                <td className="py-3 pr-4">
                                    <select
                                        value={user.role}
                                        onChange={e => handleRoleChange(user._id, e.target.value)}
                                        className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${ROLE_BADGE[user.role]}`}
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 pr-4">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <button onClick={() => handleToggleStatus(user._id)}
                                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <ToggleLeft size={13} />
                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
