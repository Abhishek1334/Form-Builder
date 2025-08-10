import { useState, useCallback } from 'react';
import {
    getForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
} from '../api/services/formService.js';

export const useForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [forms, setForms] = useState([]);
    const [currentForm, setCurrentForm] = useState(null);

    // Get all forms
    const fetchForms = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getForms(params);
            setForms(response.data || []);
            return response;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching forms:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get a specific form
    const fetchForm = useCallback(async (formId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getForm(formId);
            setCurrentForm(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching form:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new form
    const addForm = useCallback(async (formData, images = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await createForm(formData, images);
            setForms((prev) => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            setError(err.message);
            console.error('Error creating form:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a form
    const editForm = useCallback(
        async (formId, formData, images = {}) => {
            setLoading(true);
            setError(null);

            try {
                const response = await updateForm(formId, formData, images);
                setForms((prev) =>
                    prev.map((form) => (form._id === formId ? response.data : form))
                );

                if (currentForm?._id === formId) {
                    setCurrentForm(response.data);
                }

                return response.data;
            } catch (err) {
                setError(err.message);
                console.error('Error updating form:', err);
            } finally {
                setLoading(false);
            }
        },
        [currentForm]
    );

    // Delete a form
    const removeForm = useCallback(
        async (formId) => {
            setLoading(true);
            setError(null);

            try {
                await deleteForm(formId);
                setForms((prev) => prev.filter((form) => form._id !== formId));

                if (currentForm?._id === formId) {
                    setCurrentForm(null);
                }

                return true;
            } catch (err) {
                setError(err.message);
                console.error('Error deleting form:', err);
            } finally {
                setLoading(false);
            }
        },
        [currentForm]
    );

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Clear current form
    const clearCurrentForm = useCallback(() => {
        setCurrentForm(null);
    }, []);

    return {
        // State
        loading,
        error,
        forms,
        currentForm,

        // Actions
        fetchForms,
        fetchForm,
        addForm,
        editForm,
        removeForm,
        clearError,
        clearCurrentForm,
    };
};
