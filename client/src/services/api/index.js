import api from './axiosInstance';

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

export const userService = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
    toggleStatus: (id) => api.patch(`/users/${id}/status`),
    getStats: () => api.get('/users/stats'),
};

export const leaveService = {
    apply: (data) => api.post('/leaves', data),
    getAll: (params) => api.get('/leaves', { params }),
    getById: (id) => api.get(`/leaves/${id}`),
    approve: (id, comment = '') => api.patch(`/leaves/${id}/approve`, { comment }),
    reject: (id, comment = '') => api.patch(`/leaves/${id}/reject`, { comment }),
    getStats: () => api.get('/leaves/stats'),
    delete: (id) => api.delete(`/leaves/${id}`),
};
export const reimbursementService = {
    apply: (data) => api.post('/reimbursements', data),
    getAll: (params) => api.get('/reimbursements', { params }),
    approve: (id, comment = '') => api.patch(`/reimbursements/${id}/approve`, { comment }),
    reject: (id, comment = '') => api.patch(`/reimbursements/${id}/reject`, { comment }),
    getStats: () => api.get('/reimbursements/stats'),
};
