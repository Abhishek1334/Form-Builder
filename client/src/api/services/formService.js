import api from '../axios.js';
import { fixCorrectAnswers } from '../../utils/formDataTransformer.js';

// Get all forms
export const getForms = async (params = {}) => {
    try {
        const response = await api.get('/forms', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching forms:', error);
        throw error;
    }
};

// Get a single form
export const getForm = async (formId) => {
    try {
        const response = await api.get(`/forms/${formId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching form:', error);
        throw error;
    }
};

// Create a new form
export const createForm = async (formData, images = {}) => {
    try {
        const formDataObj = new FormData();

        // Fix the correctAnswers Map to Object conversion
        const fixedFormData = fixCorrectAnswers(formData);

        // Add form data
        formDataObj.append('formData', JSON.stringify(fixedFormData));
        formDataObj.append('createdBy', fixedFormData.createdBy || 'anonymous');

        // Add header image if provided
        if (images.headerImage) {
            formDataObj.append('headerImage', images.headerImage);
        }

        // Add question images if provided
        if (images.questionImages && images.questionImages.length > 0) {
            images.questionImages.forEach((image) => {
                formDataObj.append('questionImages', image);
            });
        }

        const response = await api.post('/forms', formDataObj, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating form:', error);
        throw error;
    }
};

// Update a form
export const updateForm = async (formId, formData, images = {}) => {
    try {
        const formDataObj = new FormData();

        // Fix the correctAnswers Map to Object conversion
        const fixedFormData = fixCorrectAnswers(formData);

        // Add form data
        formDataObj.append('formData', JSON.stringify(fixedFormData));

        // Add header image if provided
        if (images.headerImage) {
            formDataObj.append('headerImage', images.headerImage);
        }

        // Add question images if provided
        if (images.questionImages && images.questionImages.length > 0) {
            images.questionImages.forEach((image) => {
                formDataObj.append('questionImages', image);
            });
        }

        const response = await api.put(`/forms/${formId}`, formDataObj, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating form:', error);
        throw error;
    }
};

// Delete a form
export const deleteForm = async (formId) => {
    try {
        const response = await api.delete(`/forms/${formId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting form:', error);
        throw error;
    }
};

// Get form responses
export const getFormResponses = async (formId, params = {}) => {
    try {
        const response = await api.get(`/forms/${formId}/responses`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching form responses:', error);
        throw error;
    }
};
