import { useEffect, useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { FileText, Clock, CheckCircle, XCircle, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AllLeavesPage() {
    const { leaveList, loading, fetchLeaves, approveLeave, rejectLeave } = useLeave();
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [actionModal, setActionModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const [comment, setComment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => { fetchLeaves(); }, []);

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
            setActionModal(null); setComment('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally { setProcessing(false); }
    };

    const filtered = leaveList
        .filter(l => filter ? l.status === filter : true)
        .filter(l => search ? (l.employeeId?.name?.toLowerCase().includes(search.toLowerCase()) || l.leaveType.includes(search.toLowerCase())) : true);

    const COLUMNS = [
        {
            key: 'employeeId', label: 'Employee', render: (v) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">{v?.name?.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{v?.name}</p>
                        <p className="text-xs text-gray-400">{v?.department}</p>
                    </div>
                </div>
            )
        },
        { key: 'leaveType', label: 'Type', render: (v) => <span className="capitalize text-xs font-medium px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg">{v}</span> },
        { key: 'startDate', label: 'From', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        { key: 'endDate', label: 'To', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        { key: 'totalDays', label: 'Days', render: (v) => <span className="font-bold text-teal-600">{v}</span> },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        { key: 'createdAt', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-GB') },
        {
            key: '_id', label: 'Actions', render: (id, row) => (
                <div className="flex gap-2">
                    <button onClick={() => setViewModal(row)} className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1" title="View Reason">
                        <FileText size={12} /> Reason
                    </button>
                    {row.status === 'pending' && (
                        <>
                            <button onClick={() => setActionModal({ type: 'approve', leave: row })} className="btn-success text-xs px-3 py-1.5">Approve</button>
                            <button onClick={() => setActionModal({ type: 'reject', leave: row })} className="btn-danger text-xs px-3 py-1.5">Reject</button>
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">All Leaves</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Full visibility into all leave requests across the organisation</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', value: stats.total, icon: FileText, color: 'from-blue-500 to-blue-700' },
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
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Leave Records</h3>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">{filtered.length}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." className="input pl-8 py-1.5 text-sm w-44" />
                        </div>
                        {/* Filters */}
                        {['', 'pending', 'approved', 'rejected'].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-400'}`}>
                                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <DataTable columns={COLUMNS} data={filtered} loading={loading} emptyMessage="No leave records found" />
            </div>

            {/* View Modal */}
            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Leave Records Details" size="sm">
                {viewModal && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm space-y-3">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white leading-tight">{viewModal.employeeId?.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{viewModal.leaveType} Leave</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1 tracking-wider">Application Reason</p>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">"{viewModal.reason}"</p>
                            </div>

                            {viewModal.approverComment && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 tracking-wider">Manager Comment</p>
                                    <p className="text-teal-600 dark:text-teal-400 font-semibold italic">"{viewModal.approverComment}"</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <StatusBadge status={viewModal.status} />
                                <p className="text-xs font-bold text-gray-500">{viewModal.totalDays} Days</p>
                            </div>
                        </div>
                        <button onClick={() => setViewModal(null)} className="btn-primary w-full">Close</button>
                    </div>
                )}
            </Modal>

            {/* Action Modal */}
            <Modal isOpen={!!actionModal} onClose={() => { setActionModal(null); setComment(''); }}
                title={actionModal?.type === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'} size="sm">
                {actionModal && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm space-y-1.5">
                            <p><span className="font-semibold">Employee:</span> {actionModal.leave.employeeId?.name}</p>
                            <p><span className="font-semibold">Type:</span> <span className="capitalize">{actionModal.leave.leaveType}</span> Leave</p>
                            <p><span className="font-semibold">Duration:</span> {actionModal.leave.totalDays} days</p>
                            <p><span className="font-semibold">Reason:</span> {actionModal.leave.reason}</p>
                        </div>
                        <div>
                            <label className="label">Comment (optional)</label>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Add a comment..." className="input resize-none" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setActionModal(null); setComment(''); }} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleAction} disabled={processing}
                                className={`flex-1 flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl transition-all ${actionModal.type === 'approve' ? 'btn-success' : 'btn-danger'}`}>
                                {processing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (actionModal.type === 'approve' ? 'Approve' : 'Reject')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
