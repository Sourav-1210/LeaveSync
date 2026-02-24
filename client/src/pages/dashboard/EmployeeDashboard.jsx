import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Calendar, Clock, CheckCircle, XCircle, PlusCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'];

const COLUMNS = [
    { key: 'leaveType', label: 'Type', render: (v) => <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{v}</span> },
    { key: 'startDate', label: 'From', render: (v) => new Date(v).toLocaleDateString('en-GB') },
    { key: 'endDate', label: 'To', render: (v) => new Date(v).toLocaleDateString('en-GB') },
    { key: 'totalDays', label: 'Days', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Applied On', render: (v) => new Date(v).toLocaleDateString('en-GB') },
];

const defaultForm = { leaveType: 'casual', startDate: '', endDate: '', reason: '' };

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const { leaveList, loading, fetchLeaves, fetchLeaveStats, leaveStats, createLeave, removeLeave } = useLeave();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchLeaves();
        fetchLeaveStats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createLeave(form);
            setModalOpen(false);
            setForm(defaultForm);
            fetchLeaveStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply leave');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await removeLeave(id);
            setDeleteId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const stats = {
        total: leaveList.length,
        pending: leaveList.filter(l => l.status === 'pending').length,
        approved: leaveList.filter(l => l.status === 'approved').length,
        rejected: leaveList.filter(l => l.status === 'rejected').length,
    };


    const filtered = filter ? leaveList.filter(l => l.status === filter) : leaveList;

    const columnsWithAction = [
        ...COLUMNS,
        {
            key: '_id', label: '', render: (id, row) =>
                row.status === 'pending' ? (
                    <button onClick={() => setDeleteId(id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                    </button>
                ) : null,
        },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        Hello, {user?.name?.split(' ')[0]} 👋
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.department} · {user?.email}</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} />Apply Leave
                </button>
            </div>

            {/* Leave Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <DashboardCard title="Total Leaves" value={stats.total} icon={Calendar} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle="All time" />
                <DashboardCard title="Pending" value={stats.pending} icon={Clock} gradient="bg-gradient-to-br from-[#FFB33F] to-[#F59E0B]" subtitle="Awaiting review" />
                <DashboardCard title="Approved" value={stats.approved} icon={CheckCircle} gradient="bg-gradient-to-br from-teal-500 to-emerald-500" subtitle="This year" />
                <DashboardCard title="Rejected" value={stats.rejected} icon={XCircle} gradient="bg-gradient-to-br from-[#FA4032] to-[#D73523]" subtitle="This year" />
            </div>


            {/* Leave History */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Leave History</h3>
                    <div className="flex gap-2 flex-wrap">
                        {['', 'pending', 'approved', 'rejected'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400'
                                    }`}
                            >
                                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <DataTable columns={columnsWithAction} data={filtered} loading={loading} emptyMessage="No leave records found" />
            </div>

            {/* Apply Leave Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Apply for Leave">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Leave Type</label>
                        <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} className="input capitalize">
                            {LEAVE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Start Date</label>
                            <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="input" />
                        </div>
                        <div>
                            <label className="label">End Date</label>
                            <input type="date" value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, endDate: e.target.value })} required className="input" />
                        </div>
                    </div>
                    <div>
                        <label className="label">Reason</label>
                        <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required rows={3} minLength={10} maxLength={500} placeholder="Provide a brief reason (min. 10 characters)..." className="input resize-none" />
                        <p className="text-xs text-gray-400 mt-1 text-right">{form.reason.length}/500</p>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
                <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this leave application? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">Delete</button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
