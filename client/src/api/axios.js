import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
    // If VITE_BASE_URL is set, use it
    if (import.meta.env.VITE_BASE_URL) {
        return import.meta.env.VITE_BASE_URL;
    }
    
    // If we're in production (Vercel), use the deployed backend URL
    if (import.meta.env.PROD) {
        return 'https://your-backend-deployment-url.com'; // Update this with your actual backend URL
    }
    
    // Default to localhost for development
    return 'http://localhost:5000';
};

const BASE_URL = getBaseURL();

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
