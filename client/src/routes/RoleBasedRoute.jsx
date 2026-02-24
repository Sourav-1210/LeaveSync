import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

const RoleBasedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loader fullScreen />;
    if (!user) return <Navigate to="/login" replace />;

    if (!roles.includes(user.role)) {
        const redirectMap = {
            admin: '/dashboard/admin',
            manager: '/dashboard/manager',
            employee: '/dashboard/employee',
        };
        return <Navigate to={redirectMap[user.role] || '/login'} replace />;
    }

    return children;
};

export default RoleBasedRoute;
