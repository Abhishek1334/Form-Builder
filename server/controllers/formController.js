import Form from '../models/Form.js';
import { uploadFile, deleteFile } from '../services/cloudinaryService.js';

// Get all forms
export const getForms = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const forms = await Form.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Form.countDocuments(query);

        res.json({
            success: true,
            data: forms,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error getting forms:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get a single form
export const getForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }

        res.json({ success: true, data: form });
    } catch (error) {
        console.error('Error getting form:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid form ID' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new form
export const createForm = async (req, res) => {
    try {
        const { formData, createdBy } = req.body;
        const parsedFormData = JSON.parse(formData);

        // Handle header image upload
        if (req.files && req.files.headerImage) {
            const headerImageResult = await uploadFile(
                req.files.headerImage[0].buffer,
                req.files.headerImage[0].originalname || req.files.headerImage[0].filename,
                'forms'
            );
            parsedFormData.headerImage = {
                url: headerImageResult.url,
                filename: headerImageResult.filename,
                mimetype: req.files.headerImage[0].mimetype,
            };
        }

        // Handle question images upload
        const questionImages = [];
        if (req.files && req.files.questionImages) {
            for (const file of req.files.questionImages) {
                const imageResult = await uploadFile(
                    file.buffer,
                    file.originalname || file.filename,
                    'questions'
                );
                questionImages.push({
                    url: imageResult.url,
                    filename: imageResult.filename,
                    mimetype: file.mimetype,
                });
            }
        }

        // Add image data to questions
        if (questionImages.length > 0) {
            parsedFormData.questions.forEach((question, index) => {
                if (questionImages[index]) {
                    question.image = {
                        url: questionImages[index].url,
                        filename: questionImages[index].filename,
                        mimetype: questionImages[index].mimetype,
                    };
                }
            });
        }

        const form = new Form({
            ...parsedFormData,
            createdBy: createdBy || 'anonymous',
        });

        const savedForm = await form.save();
        res.status(201).json({ success: true, data: savedForm });
    } catch (error) {
        console.error('Error creating form:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Invalid form data' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update a form
export const updateForm = async (req, res) => {
    try {
        const { formData } = req.body;
        const parsedFormData = JSON.parse(formData);
        const formId = req.params.id;

        const existingForm = await Form.findById(formId);
        if (!existingForm) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }

        // Handle header image upload
        if (req.files && req.files.headerImage) {
            const headerImageResult = await uploadFile(
                req.files.headerImage[0].buffer,
                req.files.headerImage[0].originalname || req.files.headerImage[0].filename,
                'forms'
            );
            parsedFormData.headerImage = {
                url: headerImageResult.url,
                filename: headerImageResult.filename,
                mimetype: req.files.headerImage[0].mimetype,
            };
        }

        // Handle question images upload
        if (req.files && req.files.questionImages) {
            for (const file of req.files.questionImages) {
                const imageResult = await uploadFile(
                    file.buffer,
                    file.originalname || file.filename,
                    'questions'
                );
                // Add to questions (you might want to specify which question gets which image)
                if (parsedFormData.questions && parsedFormData.questions.length > 0) {
                    parsedFormData.questions[0].image = {
                        url: imageResult.url,
                        filename: imageResult.filename,
                        mimetype: file.mimetype,
                    };
                }
            }
        }

        const updatedForm = await Form.findByIdAndUpdate(formId, parsedFormData, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: updatedForm });
    } catch (error) {
        console.error('Error updating form:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid form ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Invalid form data' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a form
export const deleteForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }

        // Delete header image
        if (form.headerImagePublicId) {
            await deleteFile(form.headerImagePublicId);
        }

        // Delete question images
        if (form.questions) {
            for (const question of form.questions) {
                if (question.imagePublicId) {
                    await deleteFile(question.imagePublicId);
                }
            }
        }

        await Form.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid form ID' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
