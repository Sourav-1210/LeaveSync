import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { leaveService } from '../services/api';
import toast from 'react-hot-toast';
import { useNotification } from './NotificationContext';

const LeaveContext = createContext(null);

export const useLeave = () => {
    const ctx = useContext(LeaveContext);
    if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
    return ctx;
};

export const LeaveProvider = ({ children }) => {
    const [leaveList, setLeaveList] = useState([]);
    const [leaveStats, setLeaveStats] = useState(null);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();
    const fetchingRef = useRef(false); // guard against duplicate concurrent fetches

    const fetchLeaves = useCallback(async (params = {}) => {
        if (fetchingRef.current) return; // already loading, skip
        fetchingRef.current = true;
        setLoading(true);
        try {
            const { data } = await leaveService.getAll(params);
            setLeaveList(data.leaves);
            setPagination(data.pagination || {});
        } catch (err) {
            console.error('fetchLeaves error:', err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    const fetchLeaveStats = useCallback(async () => {
        try {
            const { data } = await leaveService.getStats();
            setLeaveStats(data);
        } catch (err) {
            console.error('Stats error:', err);
        }
    }, []);

    const createLeave = useCallback(async (formData) => {
        const { data } = await leaveService.apply(formData);
        setLeaveList((prev) => [data.leave, ...prev]);
        toast.success('Leave application submitted!');
        addNotification({
            type: 'info',
            title: 'Leave Application Submitted',
            message: `Your ${data.leave.leaveType} leave request has been submitted and is awaiting review.`,
        });
        return data.leave;
    }, [addNotification]);

    const approveLeave = useCallback(async (id, comment = '') => {
        const { data } = await leaveService.approve(id, comment);
        setLeaveList((prev) =>
            prev.map((l) => (l._id === id ? data.leave : l))
        );
        toast.success('Leave approved!');
        addNotification({
            type: 'success',
            title: 'Leave Approved ✓',
            message: `The ${data.leave.leaveType} leave for ${data.leave.employee?.name || 'employee'} has been approved.`,
        });
        return data.leave;
    }, [addNotification]);

    const rejectLeave = useCallback(async (id, comment = '') => {
        const { data } = await leaveService.reject(id, comment);
        setLeaveList((prev) =>
            prev.map((l) => (l._id === id ? data.leave : l))
        );
        toast.error('Leave rejected');
        addNotification({
            type: 'warning',
            title: 'Leave Rejected',
            message: `The ${data.leave.leaveType} leave for ${data.leave.employee?.name || 'employee'} has been rejected.`,
        });
        return data.leave;
    }, [addNotification]);

    const removeLeave = useCallback(async (id) => {
        await leaveService.delete(id);
        setLeaveList((prev) => prev.filter((l) => l._id !== id));
        toast.success('Leave application deleted');
        addNotification({
            type: 'info',
            title: 'Leave Application Deleted',
            message: 'Your leave application has been successfully deleted.',
        });
    }, [addNotification]);

    return (
        <LeaveContext.Provider value={{
            leaveList, leaveStats, pagination, loading,
            fetchLeaves, fetchLeaveStats, createLeave,
            approveLeave, rejectLeave, removeLeave,
        }}>
            {children}
        </LeaveContext.Provider>
    );
};

export default LeaveContext;
