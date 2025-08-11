import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
    // If VITE_BASE_URL is set, use it
    if (import.meta.env.VITE_BASE_URL) {
        return import.meta.env.VITE_BASE_URL;
    }
    
    // If we're in production (Vercel), use the deployed backend URL
    if (import.meta.env.PROD) {
        return 'https://form-builder-backend.up.railway.app';
    }
    
    // Default to localhost for development
    return 'http://localhost:5000';
};

const BASE_URL = getBaseURL();

// Ensure the base URL doesn't end with a slash to prevent double slashes
const cleanBaseURL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const api = axios.create({
    baseURL: `${cleanBaseURL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
