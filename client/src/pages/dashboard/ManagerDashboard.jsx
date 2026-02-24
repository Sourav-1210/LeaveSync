import { useEffect, useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { FileText, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// ─── Fintech Emerald Color Tokens ────────────────────────────────────────────
const CHART_BAR_COLORS = [
    '#10B981', // emerald-500
    '#14B8A6', // teal-500
    '#34D399', // emerald-400
    '#2DD4BF', // teal-400
    '#6EE7B7', // emerald-300
];

const DOUGHNUT_COLORS = {
    approved: '#14B8A6',   // teal-500
    pending: '#FFB33F',    // Warm Amber (user specified)
    rejected: '#FA4032',   // Vibrant Red (user specified)
};

const FILTER_STATUS = ['', 'pending', 'approved', 'rejected'];

export default function ManagerDashboard() {
    const { leaveList, loading, fetchLeaves, fetchLeaveStats, leaveStats, approveLeave, rejectLeave } = useLeave();
    const [filter, setFilter] = useState('pending');
    const [actionModal, setActionModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchLeaves();
        fetchLeaveStats();
    }, []);

    const stats = {
        total: leaveList.length,
        pending: leaveList.filter(l => l.status === 'pending').length,
        approved: leaveList.filter(l => l.status === 'approved').length,
        rejected: leaveList.filter(l => l.status === 'rejected').length,
    };

    const handleAction = async () => {
        if (!actionModal) return;
        setProcessing(true);
        try {
            if (actionModal.type === 'approve') await approveLeave(actionModal.leave._id, comment);
            else await rejectLeave(actionModal.leave._id, comment);
            setActionModal(null);
            setComment('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    const filtered = filter ? leaveList.filter(l => l.status === filter) : leaveList;

    const COLUMNS = [
        {
            key: 'employeeId', label: 'Employee', render: (v) => (
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{v?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{v?.department}</p>
                </div>
            )
        },
        { key: 'leaveType', label: 'Type', render: (v) => <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{v}</span> },
        { key: 'startDate', label: 'From', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        { key: 'endDate', label: 'To', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        { key: 'totalDays', label: 'Days', render: (v) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{v}</span> },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        {
            key: '_id', label: 'Actions', render: (id, row) => (
                <div className="flex gap-2">
                    <button onClick={() => setViewModal(row)} className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all" title="View Reason">
                        <FileText size={12} /> Reason
                    </button>
                    {row.status === 'pending' && (
                        <>
                            <button onClick={() => setActionModal({ type: 'approve', leave: row })}
                                className="btn-success text-xs px-3 py-1.5">Approve</button>
                            <button onClick={() => setActionModal({ type: 'reject', leave: row })}
                                className="btn-danger  text-xs px-3 py-1.5">Reject</button>
                        </>
                    )}
                </div>
            )
        },
    ];

    // ─── Chart Configs ──────────────────────────────────────────────────────
    const byType = leaveStats?.byType || [];
    const byStatus = leaveStats?.byStatus || [];

    const barData = {
        labels: byType.map(t => t._id),
        datasets: [{
            label: 'Leaves by Type',
            data: byType.map(t => t.count),
            backgroundColor: CHART_BAR_COLORS,
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const doughnutData = {
        labels: byStatus.map(s => s._id),
        datasets: [{
            data: byStatus.map(s => s.count),
            backgroundColor: byStatus.map(s => DOUGHNUT_COLORS[s._id] || '#94a3b8'),
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#34d399',
                bodyColor: '#cbd5e1',
                cornerRadius: 8,
                padding: 10,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(16,185,129,0.08)' },
                ticks: { color: '#64748b', font: { size: 11 } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } },
            },
        },
    };


    const doughnutOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#64748b', padding: 18, font: { size: 12, weight: '500' } },
            },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#34d399',
                bodyColor: '#cbd5e1',
                cornerRadius: 8,
                padding: 10,
            },
        },
        cutout: '70%',
    };

    // ─── Filter pill active styles ──────────────────────────────────────────
    const FILTER_ACTIVE = {
        '': 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-500/20',
        'pending': 'bg-[#FFB33F] dark:bg-amber-500 text-white border-[#FFB33F] dark:border-amber-500 shadow-md shadow-amber-500/20',
        'approved': 'bg-teal-500 dark:bg-teal-400 text-white border-teal-500 dark:border-teal-400 shadow-md shadow-teal-500/20',
        'rejected': 'bg-rose-500 dark:bg-rose-500 text-white border-rose-500 dark:border-rose-500 shadow-md shadow-rose-500/20',
    };
    const FILTER_HOVER = {
        '': 'hover:border-emerald-500 hover:text-emerald-600',
        'pending': 'hover:border-amber-400 hover:text-amber-500',
        'approved': 'hover:border-teal-500 hover:text-teal-600',
        'rejected': 'hover:border-rose-500 hover:text-rose-500',
    };

    return (
        <DashboardLayout>

            {/* ── Fintech Hero Header ──────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl mb-8 px-7 py-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-950/40 border border-emerald-400/20">
                {/* premium glass blur decorations */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-8 left-1/4 w-32 h-32 rounded-full bg-teal-300/20 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/10 dark:bg-emerald-400/5 backdrop-blur-[2px] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-emerald-50 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-90">
                            Operations Control
                        </p>
                        <h2 className="text-2xl font-black text-white tracking-tight">Manager Dashboard</h2>
                        <p className="text-white/80 text-sm mt-0.5 font-medium">
                            Review and manage leave requests from your team
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/15 dark:bg-black/20 border border-white/25 dark:border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
                        <Users size={16} className="text-white" />
                        <span className="text-white text-sm font-bold">{stats.total} Requests</span>
                    </div>
                </div>
            </div>

            {/* ── Summary Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total — Emerald */}
                <DashboardCard
                    title="Total Requests"
                    value={stats.total}
                    icon={FileText}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                {/* Pending — Amber */}
                <DashboardCard
                    title="Pending Review"
                    value={stats.pending}
                    icon={Clock}
                    gradient="bg-gradient-to-br from-[#FFB33F] to-[#F59E0B]"
                />
                {/* Approved — Teal/Emerald */}
                <DashboardCard
                    title="Approved"
                    value={stats.approved}
                    icon={CheckCircle}
                    gradient="bg-gradient-to-br from-teal-500 to-emerald-500"
                />
                {/* Rejected — Rose */}
                <DashboardCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={XCircle}
                    gradient="bg-gradient-to-br from-[#FA4032] to-[#D73523]"
                />
            </div>


            <div className="grid lg:grid-cols-3 gap-6 mb-8">

                {/* Bar Chart — glass card */}
                <div className="lg:col-span-2 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all duration-300 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 inline-block" />
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                            Leaves by Type
                        </h3>
                    </div>
                    <Bar data={barData} options={barOptions} />
                </div>

                {/* Doughnut Chart — glass card */}
                <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl dark:hover:shadow-amber-900/10 transition-all duration-300 rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-400 inline-block" />
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                            Status Overview
                        </h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div style={{ maxWidth: 220, width: '100%' }}>
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>
            </div>


            {/* ── Leave Requests Table ─────────────────────────────────── */}
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl dark:hover:shadow-white/5 transition-all duration-300 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 italic">
                            Leave Requests
                        </h3>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 flex-wrap">
                        {FILTER_STATUS.map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                                    ${filter === s
                                        ? FILTER_ACTIVE[s]
                                        : `border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 ${FILTER_HOVER[s]}`
                                    }`}
                            >
                                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                {s === 'pending' && stats.pending > 0 && (
                                    <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/25 text-white">
                                        {stats.pending}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <DataTable columns={COLUMNS} data={filtered} loading={loading} emptyMessage="No leave requests found" />
            </div>

            {/* View Reason Modal */}
            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Leave Application Details" size="sm">
                {viewModal && (
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white leading-tight">{viewModal.employeeId?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{viewModal.leaveType} Leave</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Reason</label>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-1">
                                        "{viewModal.reason}"
                                    </p>
                                </div>

                                {viewModal.approverComment && (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Your Comment</label>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold italic mt-1">
                                            "{viewModal.approverComment}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-end pt-2">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status</label>
                                        <StatusBadge status={viewModal.status} />
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Duration</label>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{viewModal.totalDays} Days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setViewModal(null)} className="btn-primary w-full py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none">
                            Done
                        </button>
                    </div>
                )}
            </Modal>

            {/* ── Approve / Reject Modal ───────────────────────────────── */}
            <Modal
                isOpen={!!actionModal}
                onClose={() => { setActionModal(null); setComment(''); }}
                title={actionModal?.type === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}
                size="sm"
            >
                {actionModal && (
                    <div className="space-y-4">
                        <div
                            className="p-4 rounded-xl text-sm space-y-1.5 border"
                            style={{
                                background: actionModal.type === 'approve'
                                    ? 'linear-gradient(135deg,#f0fdf4,#ecfdf5)'
                                    : 'linear-gradient(135deg,#fff1f2,#fef2f2)',
                                borderColor: actionModal.type === 'approve' ? '#bbf7d0' : '#fecaca',
                            }}
                        >
                            <p className="text-slate-700"><span className="font-semibold">Employee:</span> {actionModal.leave.employeeId?.name}</p>
                            <p className="text-slate-700"><span className="font-semibold">Type:</span> <span className="capitalize">{actionModal.leave.leaveType}</span> Leave</p>
                            <p className="text-slate-700"><span className="font-semibold">Duration:</span> {actionModal.leave.totalDays} days</p>
                            <p className="text-slate-700"><span className="font-semibold">Reason:</span> {actionModal.leave.reason}</p>
                        </div>

                        <div>
                            <label className="label">Comment (optional)</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={2}
                                placeholder="Add a comment..."
                                className="input resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setActionModal(null); setComment(''); }}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl transition-all text-white"
                                style={{
                                    background: actionModal.type === 'approve'
                                        ? 'linear-gradient(135deg,#10b981,#059669)'
                                        : 'linear-gradient(135deg,#f43f5e,#ef4444)',
                                    boxShadow: actionModal.type === 'approve'
                                        ? '0 4px 14px rgba(16,185,129,0.35)'
                                        : '0 4px 14px rgba(239,68,68,0.3)',
                                    opacity: processing ? 0.7 : 1,
                                }}
                            >
                                {processing
                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : (actionModal.type === 'approve' ? 'Approve' : 'Reject')
                                }
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
