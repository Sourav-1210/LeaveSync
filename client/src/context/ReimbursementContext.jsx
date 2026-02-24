import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { reimbursementService } from '../services/api';
import toast from 'react-hot-toast';
import { useNotification } from './NotificationContext';

const ReimbursementContext = createContext(null);

export const useReimbursement = () => {
    const ctx = useContext(ReimbursementContext);
    if (!ctx) throw new Error('useReimbursement must be used within ReimbursementProvider');
    return ctx;
};

export const ReimbursementProvider = ({ children }) => {
    const [reimbursementList, setReimbursementList] = useState([]);
    const [reimbursementStats, setReimbursementStats] = useState(null);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const fetchingRef = useRef(false);

    const fetchReimbursements = useCallback(async (params = {}) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        setLoading(true);
        try {
            const { data } = await reimbursementService.getAll(params);
            setReimbursementList(data.reimbursements);
            setPagination(data.pagination || {});
        } catch (err) {
            console.error('fetchReimbursements error:', err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    const fetchReimbursementStats = useCallback(async () => {
        try {
            const { data } = await reimbursementService.getStats();
            setReimbursementStats(data);
        } catch (err) {
            console.error('Reimbursement stats error:', err);
        }
    }, []);

    const createReimbursement = useCallback(async (formData) => {
        try {
            const { data } = await reimbursementService.apply(formData);
            setReimbursementList((prev) => [data.reimbursement, ...prev]);
            toast.success('Reimbursement request submitted!');
            addNotification({
                type: 'info',
                title: 'Reimbursement Submitted',
                message: `Your request for "${data.reimbursement.title}" has been submitted.`,
            });
            return data.reimbursement;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
            throw err;
        }
    }, [addNotification]);

    const approveReimbursement = useCallback(async (id, comment = '') => {
        try {
            const { data } = await reimbursementService.approve(id, comment);
            setReimbursementList((prev) =>
                prev.map((r) => (r._id === id ? data.reimbursement : r))
            );
            toast.success('Reimbursement approved!');
            addNotification({
                type: 'success',
                title: 'Reimbursement Approved ✓',
                message: `The reimbursement for "${data.reimbursement.title}" has been approved.`,
            });
            return data.reimbursement;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
            throw err;
        }
    }, [addNotification]);

    const rejectReimbursement = useCallback(async (id, comment = '') => {
        try {
            const { data } = await reimbursementService.reject(id, comment);
            setReimbursementList((prev) =>
                prev.map((r) => (r._id === id ? data.reimbursement : r))
            );
            toast.error('Reimbursement rejected');
            addNotification({
                type: 'warning',
                title: 'Reimbursement Rejected',
                message: `The reimbursement for "${data.reimbursement.title}" has been rejected.`,
            });
            return data.reimbursement;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
            throw err;
        }
    }, [addNotification]);

    return (
        <ReimbursementContext.Provider value={{
            reimbursementList, reimbursementStats, pagination, loading,
            fetchReimbursements, fetchReimbursementStats, createReimbursement,
            approveReimbursement, rejectReimbursement,
        }}>
            {children}
        </ReimbursementContext.Provider>
    );
};

export default ReimbursementContext;
