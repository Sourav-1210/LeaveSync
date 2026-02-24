const STATUS_CONFIG = {
    pending: { label: 'Pending', cls: 'badge-pending', dot: 'bg-amber-400' },
    approved: { label: 'Approved', cls: 'badge-approved', dot: 'bg-teal-400' },
    rejected: { label: 'Rejected', cls: 'badge-rejected', dot: 'bg-rose-400' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={cfg.cls}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
            {cfg.label}
        </span>
    );
};

export default StatusBadge;
