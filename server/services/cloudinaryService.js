import cloudinary from '../config/cloudinary.js';

// Upload a file to Cloudinary
export const uploadFile = async (fileBuffer, fileName, folder = 'uploads') => {
    try {
        const timestamp = Date.now();
        const base64File = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

        // Handle case where fileName might be undefined
        const safeFileName = fileName || `file-${timestamp}`;
        const publicId = fileName ? `${timestamp}-${fileName.split('.')[0]}` : `file-${timestamp}`;

        const result = await cloudinary.uploader.upload(base64File, {
            folder: folder,
            public_id: publicId,
        });

        return {
            url: result.secure_url,
            filename: safeFileName,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};

// Delete a file from Cloudinary
export const deleteFile = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Upload multiple files
export const uploadMultipleFiles = async (files, folder = 'uploads') => {
    try {
        const uploadPromises = files.map((file) => uploadFile(file.buffer, file.filename, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw new Error('Failed to upload files');
    }
};
