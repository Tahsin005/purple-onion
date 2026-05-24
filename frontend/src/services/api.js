import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
});

export const blogApi = {
    getAll: () => api.get('/posts').then(res => res.data),
    getBySlug: (slug) => api.get(`/posts/${slug}`).then(res => res.data),
};

export default api;
