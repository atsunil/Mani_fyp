import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('medilink_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('medilink_token');
            localStorage.removeItem('medilink_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data)
};

// Retailer APIs
export const retailerAPI = {
    getAll: () => api.get('/retailers'),
    getOne: (id) => api.get(`/retailers/${id}`),
    create: (data) => api.post('/retailers', data),
    update: (id, data) => api.put(`/retailers/${id}`, data),
    delete: (id) => api.delete(`/retailers/${id}`)
};

// Category APIs
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getOne: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`)
};

// Product APIs
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getAllAdmin: () => api.get('/products/admin/all'),
    getOne: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    updateStock: (id, data) => api.put(`/products/${id}/stock`, data),
    delete: (id) => api.delete(`/products/${id}`),
    getLowStock: () => api.get('/products/low-stock')
};

// Order APIs
export const orderAPI = {
    placeOrder: (data) => api.post('/orders', data),
    getAll: (params) => api.get('/orders', { params }),
    getMyOrders: () => api.get('/orders/my-orders'),
    getOne: (id) => api.get(`/orders/${id}`),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    updatePaymentStatus: (id, data) => api.put(`/orders/${id}/payment-status`, data),
    payOrder: (id) => api.put(`/orders/${id}/pay`),
    getPendingPayments: () => api.get('/orders/pending-payments')
};

// Inventory APIs
export const inventoryAPI = {
    getLogs: (params) => api.get('/inventory/logs', { params }),
    getLowStock: () => api.get('/inventory/low-stock'),
    getSummary: () => api.get('/inventory/summary'),
    notifyLowStock: () => api.post('/inventory/notify-low-stock')
};

// Payment APIs
export const paymentAPI = {
    record: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return api.post('/payments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getAll: (params) => api.get('/payments', { params }),
    verify: (id) => api.put(`/payments/${id}/verify`),
    getByOrder: (orderId) => api.get(`/payments/order/${orderId}`)
};

// Report APIs
export const reportAPI = {
    getDashboard: () => api.get('/reports/dashboard'),
    retailerReport: (params) => api.get('/reports/retailer', { params }),
    dailyReport: (params) => api.get('/reports/daily', { params }),
    salesReport: (params) => api.get('/reports/sales', { params })
};

export default api;
