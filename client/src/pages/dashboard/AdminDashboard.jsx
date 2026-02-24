import { useEffect, useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { useReimbursement } from '../../context/ReimbursementContext';
import { userService } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Users, FileText, CheckCircle, Activity, Banknote, Clock, TrendingUp } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, BarElement,
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, BarElement);

const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    employee: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
    const { leaveList, loading: leaveLoading, fetchLeaves, leaveStats, fetchLeaveStats } = useLeave();
    const { reimbursementStats, fetchReimbursementStats } = useReimbursement();
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [tab, setTab] = useState('users');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchLeaves();
        fetchLeaveStats();
        fetchReimbursementStats();
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setUserLoading(true);
        try {
            const [usersRes, statsRes] = await Promise.all([userService.getAll(), userService.getStats()]);
            setUsers(usersRes.data.users);
            setUserStats(statsRes.data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setUserLoading(false);
        }
    };

    const handleRoleChange = async (id, role) => {
        setUpdatingId(id);
        try {
            await userService.updateRole(id, role);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
            toast.success('Role updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleToggleStatus = async (id) => {
        setUpdatingId(id);
        try {
            const { data } = await userService.toggleStatus(id);
            setUsers(prev => prev.map(u => u._id === id ? data.user : u));
            toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const totalLeaves = leaveList.length;
    const pendingLeaves = leaveList.filter(l => l.status === 'pending').length;
    const approvedLeaves = leaveList.filter(l => l.status === 'approved').length;

    // Monthly chart
    const monthly = leaveStats?.monthly || [];
    const isSingleMonthLeave = monthly.length <= 1;
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const leaveBarData = {
        labels: monthly.map(m => MONTHS[m._id.month - 1]),
        datasets: [{
            label: 'Leave Requests',
            data: monthly.map(m => m.count),
            backgroundColor: '#F59E0B',
            borderRadius: 8,
            barThickness: 40,
        }],
    };

    const lineData = {
        labels: monthly.map(m => MONTHS[m._id.month - 1]),
        datasets: [{
            label: 'Leave Requests',
            data: monthly.map(m => m.count),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#22c55e',
        }],
    };

    // Reimbursement Monthly Trend
    const rMonthly = reimbursementStats?.monthly || [];
    const isSingleMonth = rMonthly.length <= 1;

    const rBarData = {
        labels: rMonthly.map(m => MONTHS[m._id.month - 1]),
        datasets: [{
            label: 'Claimed Amount',
            data: rMonthly.map(m => m.totalAmount),
            backgroundColor: '#F59E0B',
            borderRadius: 8,
            barThickness: 40,
        }],
    };

    const rLineData = {
        labels: rMonthly.map(m => MONTHS[m._id.month - 1]),
        datasets: [{
            label: 'Claimed Amount',
            data: rMonthly.map(m => m.totalAmount),
            borderColor: '#14B8A6',
            borderWidth: 3,
            backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(20, 184, 166, 0.35)');
                gradient.addColorStop(1, 'rgba(20, 184, 166, 0.02)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#14B8A6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        }],
    };

    const USER_COLUMNS = [
        {
            key: 'name', label: 'Employee', render: (v, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">{v?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{v}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                    </div>
                </div>
            )
        },
        { key: 'department', label: 'Dept', render: (v) => <span className="text-gray-600 dark:text-gray-400">{v || '—'}</span> },
        {
            key: 'role', label: 'Role', render: (v, row) => (
                <select
                    value={v}
                    onChange={e => handleRoleChange(row._id, e.target.value)}
                    disabled={updatingId === row._id}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 ${ROLE_COLORS[v]} capitalize`}
                >
                    {['admin', 'manager', 'employee'].map(r => <option key={r} value={r} className="bg-white text-gray-900">{r}</option>)}
                </select>
            )
        },
        {
            key: 'isActive', label: 'Status', render: (v, row) => (
                <button
                    onClick={() => handleToggleStatus(row._id)}
                    disabled={updatingId === row._id}
                    className={`py-1 px-3 rounded-full text-xs font-bold transition-all ${v ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } disabled:opacity-50`}
                >
                    {updatingId === row._id ? '...' : v ? 'Active' : 'Inactive'}
                </button>
            )
        },
        { key: 'createdAt', label: 'Joined', render: (v) => new Date(v).toLocaleDateString('en-GB') },
    ];

    const LEAVE_COLUMNS = [
        { key: 'employeeId', label: 'Employee', render: (v) => <div><p className="font-semibold">{v?.name}</p><p className="text-xs text-gray-400">{v?.email}</p></div> },
        { key: 'leaveType', label: 'Type', render: (v) => <span className="capitalize">{v}</span> },
        { key: 'startDate', label: 'From', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        { key: 'totalDays', label: 'Days', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'approvedBy', label: 'Reviewed By', render: (v) => v?.name || '—' },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Admin Panel</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Complete overview of users, roles, and leave activity</p>
            </div>

            {/* Leave Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <DashboardCard title="Total Users" value={userStats?.totalUsers || 0} icon={Users} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${userStats?.activeUsers || 0} active`} />
                <DashboardCard title="Total Leaves" value={totalLeaves} icon={FileText} gradient="bg-gradient-to-br from-teal-500 to-emerald-500" />
                <DashboardCard title="Pending" value={pendingLeaves} icon={Activity} gradient="bg-gradient-to-br from-[#FFB33F] to-[#F59E0B]" />
                <DashboardCard title="Approved" value={approvedLeaves} icon={CheckCircle} gradient="bg-gradient-to-br from-teal-500 to-emerald-500" />
            </div>

            {/* Reimbursement Stats */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                        <Banknote size={14} className="text-emerald-500" /> Financial Overview (Reimbursements)
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DashboardCard
                        title="Total Claimed"
                        value={`₹${(reimbursementStats?.byStatus?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0).toLocaleString('en-IN')}`}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-cyan-500 to-teal-500"
                        subtitle="All employees"
                    />
                    <DashboardCard
                        title="Approved Amount"
                        value={`₹${(reimbursementStats?.byStatus?.find(s => s._id === 'approved')?.totalAmount || 0).toLocaleString('en-IN')}`}
                        icon={CheckCircle}
                        gradient="bg-gradient-to-br from-cyan-500 to-teal-500"
                        subtitle="Verified expenses"
                    />
                    <DashboardCard
                        title="Pending Amount"
                        value={`₹${(reimbursementStats?.byStatus?.find(s => s._id === 'pending')?.totalAmount || 0).toLocaleString('en-IN')}`}
                        icon={Clock}
                        gradient="bg-gradient-to-br from-[#FFB33F] to-[#F59E0B]"
                        subtitle="Awaiting review"
                    />
                </div>
                {/* Reimbursement Monthly Trend */}
                <div className="mt-6 card p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-5 bg-teal-500 rounded-full" />
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Monthly Financial Trends</h3>
                    </div>
                    <div className="h-[200px] relative">
                        {rMonthly.length > 0 ? (
                            isSingleMonth ? (
                                <Bar data={rBarData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { backgroundColor: '#0f172a', cornerRadius: 8 }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                                        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                                    }
                                }} />
                            ) : (
                                <Line data={rLineData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: '#0f172a',
                                            padding: 10,
                                            cornerRadius: 8
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                                            ticks: { color: '#64748b', font: { size: 10 } }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: '#64748b', font: { size: 10 } }
                                        }
                                    }
                                }} />
                            )
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-[10px] font-medium text-slate-400">No expense data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart */}
            {monthly.length > 0 && (
                <div className="card mb-8 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-5 bg-teal-500 rounded-full" />
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Monthly Leave Trends</h3>
                    </div>
                    <div className="h-[300px]">
                        {isSingleMonthLeave ? (
                            <Bar data={leaveBarData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: { backgroundColor: '#0f172a', cornerRadius: 8 }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                                        ticks: { color: '#64748b', font: { size: 10 } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: '#64748b', font: { size: 10 } }
                                    }
                                }
                            }} />
                        ) : (
                            <Line data={lineData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: { backgroundColor: '#0f172a', cornerRadius: 8 }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                                        ticks: { color: '#64748b', font: { size: 10 } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: '#64748b', font: { size: 10 } }
                                    }
                                }
                            }} />
                        )}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                {['users', 'leaves'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        {t === 'users' ? `Users (${users.length})` : `Leaves (${totalLeaves})`}
                    </button>
                ))}
            </div>

            {tab === 'users' ? (
                <div className="card">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">All Users</h3>
                        {userStats && (
                            <div className="flex gap-3 text-xs">
                                {userStats.byRole?.map(r => (
                                    <span key={r._id} className={`px-2.5 py-1 rounded-full font-semibold capitalize ${ROLE_COLORS[r._id]}`}>
                                        {r._id}: {r.count}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <DataTable columns={USER_COLUMNS} data={users} loading={userLoading} emptyMessage="No users found" />
                </div>
            ) : (
                <div className="card">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">All Leave Records</h3>
                    <DataTable columns={LEAVE_COLUMNS} data={leaveList} loading={leaveLoading} emptyMessage="No leave records found" />
                </div>
            )}
        </DashboardLayout>
    );
}
