import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useReimbursement } from '../../context/ReimbursementContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Banknote, PlusCircle, Filter, PieChart, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, ArcElement, BarElement,
} from 'chart.js';
import ReimbursementFormModal from '../../components/dashboard/ReimbursementFormModal';
import toast from 'react-hot-toast';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler, ArcElement, BarElement);

const CATEGORIES = ['Travel', 'Food', 'Equipment', 'Medical', 'Other'];

export default function ReimbursementsPage() {
    const { user } = useAuth();
    const {
        reimbursementList, loading, fetchReimbursements,
        fetchReimbursementStats, reimbursementStats,
        approveReimbursement, rejectReimbursement
    } = useReimbursement();

    const [modalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [actionModal, setActionModal] = useState(null);
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchReimbursements();
        fetchReimbursementStats();
    }, [fetchReimbursements, fetchReimbursementStats]);

    const isEmployee = user?.role === 'employee';
    const canApprove = user?.role === 'manager' || user?.role === 'admin';

    const handleAction = async () => {
        if (!actionModal) return;
        setProcessing(true);
        try {
            if (actionModal.type === 'approve') {
                await approveReimbursement(actionModal.id, comment);
            } else {
                await rejectReimbursement(actionModal.id, comment);
            }
            setActionModal(null);
            setComment('');
            fetchReimbursementStats();
        } catch (err) {
            // Error handled in context
        } finally {
            setProcessing(false);
        }
    };

    const filtered = reimbursementList.filter(r => {
        const matchesStatus = filter ? r.status === filter : true;
        const matchesCategory = categoryFilter ? r.category === categoryFilter : true;
        return matchesStatus && matchesCategory;
    });

    const COLUMNS = [
        {
            key: 'employeeId', label: 'Employee', hidden: isEmployee, render: (v) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-[10px]">
                        {v?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{v?.name}</span>
                </div>
            )
        },
        { key: 'title', label: 'Title', render: (v) => <span className="font-semibold text-sm">{v}</span> },
        {
            key: 'amount', label: 'Amount', render: (v) => (
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                    ₹{v.toLocaleString('en-IN')}
                </span>
            )
        },
        {
            key: 'category', label: 'Category', render: (v) => (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md">
                    {v}
                </span>
            )
        },
        { key: 'expenseDate', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        {
            key: '_id', label: 'Actions', render: (id, row) => (
                <div className="flex gap-2">
                    {canApprove && row.status === 'pending' && (
                        <>
                            <button onClick={() => setActionModal({ type: 'approve', id })} className="btn-success text-[10px] px-2 py-1">Approve</button>
                            <button onClick={() => setActionModal({ type: 'reject', id })} className="btn-danger text-[10px] px-2 py-1">Reject</button>
                        </>
                    )}
                    {row.approverComment && (
                        <button onClick={() => toast.success(`Comment: ${row.approverComment}`, { icon: '💬' })} className="p-1 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded">
                            <Clock size={14} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const stats = reimbursementStats?.byStatus || [];
    const totalClaimed = stats.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const approvedAmount = stats.find(s => s._id === 'approved')?.totalAmount || 0;
    const pendingAmount = stats.find(s => s._id === 'pending')?.totalAmount || 0;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Banknote className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Claims & Reimbursements
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {isEmployee ? 'Manage your expense reports and track payment status' : 'Corporate finance control and expense verification hub'}
                    </p>
                </div>
                {isEmployee && (
                    <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 px-6 py-3 shadow-emerald-200 dark:shadow-none">
                        <PlusCircle size={18} /> New Expense Claim
                    </button>
                )}
            </div>

            {/* Performance Stats */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-5 bg-teal-500 rounded-full" />
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Financial Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DashboardCard
                        title="Total Claimed"
                        value={`₹${totalClaimed.toLocaleString('en-IN')}`}
                        icon={TrendingUp}
                        gradient="bg-gradient-to-br from-cyan-500 to-teal-500"
                        subtitle="Lifetime volume"
                    />
                    <DashboardCard
                        title="Approved Amount"
                        value={`₹${approvedAmount.toLocaleString('en-IN')}`}
                        icon={CheckCircle}
                        gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                        subtitle="Payouts processed"
                    />
                    <DashboardCard
                        title="Awaiting Review"
                        value={`₹${pendingAmount.toLocaleString('en-IN')}`}
                        icon={Clock}
                        gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                        subtitle="Queued claims"
                    />
                </div>
            </div>

            {/* Premium Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Monthly Trend - Gradient Area Chart (2/3) */}
                <div className="lg:col-span-2 card p-6 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-5 rounded-full bg-teal-500" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Expense Trends</h3>
                        </div>
                    </div>
                    <div className="h-[280px] relative">
                        {reimbursementStats?.monthly?.length > 0 ? (
                            (() => {
                                const monthlyData = reimbursementStats.monthly;
                                const isSingleMonth = monthlyData.length <= 1;
                                const labels = monthlyData.map(m => {
                                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    return months[m._id.month - 1];
                                });
                                const values = monthlyData.map(m => m.totalAmount);

                                if (isSingleMonth) {
                                    return (
                                        <Bar
                                            data={{
                                                labels,
                                                datasets: [{
                                                    label: 'Claimed Amount',
                                                    data: values,
                                                    backgroundColor: '#F59E0B',
                                                    borderRadius: 8,
                                                    barThickness: 40,
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: { backgroundColor: '#0f172a', cornerRadius: 8 }
                                                },
                                                scales: {
                                                    y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false }, ticks: { color: '#64748b' } },
                                                    x: { grid: { display: false }, ticks: { color: '#64748b' } }
                                                }
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <Line
                                        data={{
                                            labels,
                                            datasets: [{
                                                label: 'Claimed Amount',
                                                data: values,
                                                borderColor: '#14B8A6',
                                                borderWidth: 3,
                                                backgroundColor: (context) => {
                                                    const ctx = context.chart.ctx;
                                                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
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
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#0f172a',
                                                    padding: 12,
                                                    cornerRadius: 8,
                                                    displayColors: false
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                                                    ticks: { color: '#64748b', font: { size: 11 }, padding: 8 }
                                                },
                                                x: {
                                                    grid: { display: false },
                                                    ticks: { color: '#64748b', font: { size: 11 }, padding: 8 }
                                                }
                                            }
                                        }}
                                    />
                                );
                            })()
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-400">No expense data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Breakdown - Doughnut Chart (1/3) */}
                <div className="card p-6 hover:shadow-md transition-all duration-300 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1 h-5 rounded-full bg-teal-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Category Breakdown</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
                        {reimbursementStats?.byCategory?.length > 0 ? (
                            <div className="w-full max-w-[200px]">
                                <Doughnut
                                    data={{
                                        labels: reimbursementStats.byCategory.map(c => c._id),
                                        datasets: [{
                                            data: reimbursementStats.byCategory.map(c => c.totalAmount),
                                            backgroundColor: [
                                                '#14B8A6', // teal-500
                                                '#0D9488', // teal-600
                                                '#2DD4BF', // teal-400
                                                '#5EEAD4', // teal-300
                                                '#94A3B8', // slate-400
                                            ],
                                            borderWidth: 0,
                                            hoverOffset: 12
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        cutout: '75%',
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: '#0f172a',
                                                padding: 10,
                                                cornerRadius: 8
                                            }
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                                        ₹{(reimbursementStats.byCategory.reduce((acc, c) => acc + c.totalAmount, 0) / 1000).toFixed(1)}k
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-slate-400">No category data</p>
                            </div>
                        )}
                    </div>
                    {/* Tiny Legend */}
                    {reimbursementStats?.byCategory?.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {reimbursementStats.byCategory.slice(0, 3).map((c, i) => (
                                <div key={c._id} className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ['#14B8A6', '#0D9488', '#2DD4BF'][i] }} />
                                        <span className="text-slate-500 truncate">{c._id}</span>
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">₹{c.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table Card */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Claims History</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input text-xs py-1.5 w-32">
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50 dark:bg-gray-800/50">
                            {['', 'pending', 'approved', 'rejected'].map(s => (
                                <button key={s} onClick={() => setFilter(s)}
                                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${filter === s ? 'bg-white dark:bg-gray-700 text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {s === '' ? 'ALL' : s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DataTable columns={COLUMNS} data={filtered} loading={loading} emptyMessage="No reimbursement claims found" />
            </div>

            <ReimbursementFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

            {/* Approve/Reject Modal */}
            <Modal isOpen={!!actionModal} onClose={() => setActionModal(null)} title={actionModal?.type === 'approve' ? 'Approve Claim' : 'Reject Claim'} size="sm">
                <div className="space-y-4">
                    <div>
                        <label className="label">Approver Comment (Optional)</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Add a reason or comment..." className="input resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setActionModal(null)} className="btn-secondary flex-1">Cancel</button>
                        <button onClick={handleAction} disabled={processing} className={`flex-1 ${actionModal?.type === 'approve' ? 'btn-success' : 'btn-danger'}`}>
                            {processing ? 'Processing...' : (actionModal?.type === 'approve' ? 'Confirm Approve' : 'Confirm Reject')}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
