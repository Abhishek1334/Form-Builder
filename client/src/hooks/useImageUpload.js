import { useState } from 'react';
import { validateImage, createPreview, formatFileSize } from '../utils/imageUpload.js';

export const useImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [error, setError] = useState(null);

    const uploadImage = async (file) => {
        setError(null);

        // Validate image
        const validation = validateImage(file);
        if (!validation.isValid) {
            setError(validation.error);
            return null;
        }

        setUploading(true);

        try {
            // Create preview
            const previewUrl = await createPreview(file);

            const imageData = {
                id: Date.now(),
                file,
                previewUrl,
                name: file.name,
                size: formatFileSize(file.size),
                uploaded: true,
            };

            setUploadedImages((prev) => [...prev, imageData]);
            return imageData;
        } catch (err) {
            setError('Failed to process image');
            console.error('Image upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (imageId) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    const clearImages = () => {
        setUploadedImages([]);
    };

    const clearError = () => {
        setError(null);
    };

    return {
        uploading,
        uploadedImages,
        error,
        uploadImage,
        removeImage,
        clearImages,
        clearError,
    };
};
