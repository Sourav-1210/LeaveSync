import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { PlusCircle, Trash2, FileText, Clock, CheckCircle, XCircle, Calendar, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'];
const defaultForm = { leaveType: 'casual', startDate: '', endDate: '', reason: '' };

const COLUMNS = [
    { key: 'leaveType', label: 'Type', render: (v) => <span className="capitalize font-medium text-gray-700 dark:text-gray-300 px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-xs">{v}</span> },
    { key: 'startDate', label: 'From', render: (v) => new Date(v).toLocaleDateString('en-GB') },
    { key: 'endDate', label: 'To', render: (v) => new Date(v).toLocaleDateString('en-GB') },
    { key: 'totalDays', label: 'Days', render: (v) => <span className="font-bold text-teal-600">{v}</span> },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[160px]">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Applied On', render: (v) => new Date(v).toLocaleDateString('en-GB') },
];

export default function MyLeavesPage() {
    const { user } = useAuth();
    const { leaveList, loading, fetchLeaves, fetchLeaveStats, createLeave, removeLeave } = useLeave();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [viewComment, setViewComment] = useState(null);

    useEffect(() => { fetchLeaves(); fetchLeaveStats(); }, []);

    const stats = {
        total: leaveList.length,
        pending: leaveList.filter(l => l.status === 'pending').length,
        approved: leaveList.filter(l => l.status === 'approved').length,
        rejected: leaveList.filter(l => l.status === 'rejected').length,
    };

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
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        try { await removeLeave(id); setDeleteId(null); }
        catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
    };

    const filtered = filter ? leaveList.filter(l => l.status === filter) : leaveList;

    const columnsWithAction = [
        ...COLUMNS,
        {
            key: 'approverComment', label: 'Manager Note', render: (v, row) => v ? (
                <button onClick={() => setViewComment(row)} className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1" title="View Manager's Comment">
                    <MessageCircle size={12} /> Note
                </button>
            ) : null
        },
        {
            key: '_id', label: '', render: (id, row) =>
                row.status === 'pending' ? (
                    <button onClick={() => setDeleteId(id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">My Leaves</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.name} · {user?.department}</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> Apply Leave
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Applied', value: stats.total, icon: Calendar, color: 'from-blue-500 to-blue-700' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-600' },
                    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-teal-500 to-emerald-700' },
                    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-rose-700' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card flex items-center gap-4">
                        <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-teal-500" />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Leave History</h3>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">{filtered.length}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['', 'pending', 'approved', 'rejected'].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-400'}`}>
                                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <DataTable columns={columnsWithAction} data={filtered} loading={loading} emptyMessage="No leave records found. Apply your first leave!" />
            </div>

            {/* Apply Modal */}
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

            {/* View Comment Modal */}
            <Modal isOpen={!!viewComment} onClose={() => setViewComment(null)} title="Manager's Comment" size="sm">
                {viewComment && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-black uppercase tracking-widest mb-2">Message from Manager</p>
                            <p className="text-gray-900 dark:text-white font-medium italic leading-relaxed">
                                "{viewComment.approverComment}"
                            </p>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                            Leave status: <span className="font-bold uppercase">{viewComment.status}</span>
                        </div>
                        <button onClick={() => setViewComment(null)} className="btn-primary w-full">Got it</button>
                    </div>
                )}
            </Modal>

            {/* Delete Confirm */}
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
