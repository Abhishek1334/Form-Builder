import api from '../axios.js';

// Submit a form response
export const submitResponse = async (formId, responseData) => {
    try {
        const response = await api.post(`/forms/${formId}/submit`, responseData);
        return response.data;
    } catch (error) {
        console.error('Error submitting response:', error);
        throw error;
    }
};

// Get all responses for a form
export const getResponses = async (formId, params = {}) => {
    try {
        const response = await api.get(`/forms/${formId}/responses`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching responses:', error);
        throw error;
    }
};

// Get a specific response
export const getResponse = async (formId, responseId) => {
    try {
        const response = await api.get(`/forms/${formId}/responses/${responseId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching response:', error);
        throw error;
    }
};

// Delete a response
export const deleteResponse = async (formId, responseId) => {
    try {
        const response = await api.delete(`/forms/${formId}/responses/${responseId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting response:', error);
        throw error;
    }
};
