import express from 'express';
import {
    getForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
} from '../controllers/formController.js';
import {
    submitResponse,
    getFormResponses,
    getResponse,
    deleteResponse,
} from '../controllers/responseController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Form routes
router.get('/forms', getForms);
router.get('/forms/:id', getForm);
router.post(
    '/forms',
    upload.fields([
        { name: 'headerImage', maxCount: 1 },
        { name: 'questionImages', maxCount: 10 },
    ]),
    createForm
);
router.put(
    '/forms/:id',
    upload.fields([
        { name: 'headerImage', maxCount: 1 },
        { name: 'questionImages', maxCount: 10 },
    ]),
    updateForm
);
router.delete('/forms/:id', deleteForm);

// Response routes
router.post('/forms/:formId/submit', submitResponse);
router.get('/forms/:formId/responses', getFormResponses);
router.get('/forms/:formId/responses/:responseId', getResponse);
router.delete('/forms/:formId/responses/:responseId', deleteResponse);

export default router;
