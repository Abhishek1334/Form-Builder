import express from 'express';
import {
    submitResponse,
    getFormResponses,
    getResponse,
    deleteResponse,
} from '../controllers/responseController.js';

const router = express.Router();

// @route   POST /api/forms/:formId/submit
// @desc    Submit form response
// @access  Public
router.post('/:formId/submit', submitResponse);

// @route   GET /api/forms/:formId/responses
// @desc    Get all responses for a form
// @access  Public (should be admin in future)
router.get('/:formId/responses', getFormResponses);

// @route   GET /api/forms/:formId/responses/:responseId
// @desc    Get specific response
// @access  Public (should be admin in future)
router.get('/:formId/responses/:responseId', getResponse);

// @route   DELETE /api/forms/:formId/responses/:responseId
// @desc    Delete response
// @access  Public (should be admin in future)
router.delete('/:formId/responses/:responseId', deleteResponse);

export default router;

