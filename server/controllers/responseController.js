import Form from '../models/Form.js';
import FormResponse from '../models/FormResponse.js';

// Submit a form response
export const submitResponse = async (req, res) => {
    try {
        const { responses, timeSpent, submittedBy, name } = req.body;
        const formId = req.params.formId;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Name is required',
            });
        }

        // Check if form exists
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }

        // Calculate max score
        let maxScore = 0;
        form.questions.forEach((question) => {
            if (question.type === 'comprehension' && question.questions) {
                question.questions.forEach((subQuestion) => {
                    maxScore += subQuestion.points || 1;
                });
            } else {
                maxScore += 1; // Default 1 point for categorize and cloze
            }
        });

        // Ensure maxScore is at least 1
        maxScore = Math.max(maxScore, 1);

        // Calculate score
        let score = 0;
        let totalQuestions = 0;

        console.log('=== SCORING ANALYSIS ===');

        // Process responses for questions that have answers
        responses.forEach((response) => {
            const question = form.questions.find((q) => q.id === response.questionId);
            if (question) {
                totalQuestions++;

                // Simple scoring logic
                if (question.type === 'categorize') {
                    const userAnswers = response.answers;

                    let questionScore = 0;
                    userAnswers.forEach((answer) => {
                        // Find the correct category from the options
                        const correctOption = question.options?.find(
                            (option) => option.id === answer.itemId
                        );

                        if (
                            correctOption &&
                            correctOption.categoryId === answer.selectedCategoryId
                        ) {
                            questionScore++;
                        }
                    });

                    if (questionScore === userAnswers.length && userAnswers.length > 0) {
                        score++;
                    }

                    console.log(
                        `Categorize question ${response.questionId}: ${questionScore}/${userAnswers.length} correct`
                    );
                } else if (question.type === 'cloze') {
                    const userAnswers = response.answers;

                    let questionScore = 0;
                    userAnswers.forEach((answer) => {
                        // Find the correct answer from answerOptions
                        const correctOption = question.answerOptions?.find(
                            (option) => option.wordKey === answer.blankId && option.isCorrect
                        );

                        if (correctOption && correctOption.text === answer.selectedAnswer) {
                            questionScore++;
                        }
                    });

                    if (questionScore === userAnswers.length && userAnswers.length > 0) {
                        score++;
                    }

                    console.log(
                        `Cloze question ${response.questionId}: ${questionScore}/${userAnswers.length} correct`
                    );
                } else if (question.type === 'comprehension') {
                    const userAnswers = response.answers;
                    let questionScore = 0;

                    userAnswers.forEach((answer) => {
                        const subQuestion = question.questions?.find(
                            (q) => q.id === answer.subQuestionId
                        );
                        if (subQuestion) {
                            if (subQuestion.type === 'mcq') {
                                // Check if selected option is correct
                                const selectedOption = subQuestion.options?.find(
                                    (opt) => opt.id === answer.selectedOptions[0]
                                );
                                if (selectedOption && selectedOption.isCorrect) {
                                    questionScore += subQuestion.points || 1;
                                }
                            } else if (subQuestion.type === 'mca') {
                                // Check if all selected options are correct
                                const correctOptions = subQuestion.options
                                    ?.filter((opt) => opt.isCorrect)
                                    .map((opt) => opt.id);
                                const allCorrect = answer.selectedOptions.every((selectedId) =>
                                    correctOptions.includes(selectedId)
                                );
                                const allSelected = correctOptions.every((correctId) =>
                                    answer.selectedOptions.includes(correctId)
                                );
                                if (allCorrect && allSelected) {
                                    questionScore += subQuestion.points || 1;
                                }
                            } else if (subQuestion.type === 'short-text') {
                                // For short text, give points for attempting (or implement text matching logic)
                                questionScore += subQuestion.points || 1;
                            }
                        }
                    });

                    score += questionScore;
                    console.log(
                        `Comprehension question ${response.questionId}: ${questionScore} points earned`
                    );
                }
            }
        });

        console.log(`Final score: ${score}/${maxScore}`);
        console.log('=== END SCORING ANALYSIS ===');

        // Handle case where no responses were submitted
        if (responses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please answer at least one question before submitting',
            });
        }

        // Save response
        const formResponse = new FormResponse({
            formId,
            responses,
            timeSpent: timeSpent || 0,
            submittedBy: name.trim(), // Use the provided name
            score,
            maxScore,
        });

        console.log('=== SAVING RESPONSE TO DATABASE ===');
        console.log('Form ID:', formId);
        console.log('User responses:', JSON.stringify(responses, null, 2));
        console.log('Score:', score, '/', maxScore);
        console.log('Submitted by:', submittedBy);
        console.log('=== END SAVING RESPONSE ===');

        const savedResponse = await formResponse.save();

        res.status(201).json({
            success: true,
            data: savedResponse,
            message: 'Response submitted successfully',
        });
    } catch (error) {
        console.error('Error submitting response:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid form ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Invalid response data' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all responses for a form
export const getFormResponses = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const formId = req.params.formId;

        const responses = await FormResponse.find({ formId })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await FormResponse.countDocuments({ formId });

        // Calculate basic analytics
        const analytics = {
            totalResponses: total,
            averageScore: 0,
            averageTime: 0,
        };

        if (total > 0) {
            const allResponses = await FormResponse.find({ formId });
            const totalScore = allResponses.reduce((sum, r) => sum + r.percentageScore, 0);
            const totalTime = allResponses.reduce((sum, r) => sum + r.timeSpent, 0);

            analytics.averageScore = totalScore / total;
            analytics.averageTime = totalTime / total;
        }

        res.json({
            success: true,
            data: responses,
            analytics,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error getting responses:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid form ID' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get a specific response
export const getResponse = async (req, res) => {
    try {
        const { formId, responseId } = req.params;

        const response = await FormResponse.findOne({ _id: responseId, formId });

        if (!response) {
            return res.status(404).json({ success: false, message: 'Response not found' });
        }

        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error getting response:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a response
export const deleteResponse = async (req, res) => {
    try {
        const { formId, responseId } = req.params;

        const response = await FormResponse.findOneAndDelete({ _id: responseId, formId });

        if (!response) {
            return res.status(404).json({ success: false, message: 'Response not found' });
        }

        res.json({ success: true, message: 'Response deleted successfully' });
    } catch (error) {
        console.error('Error deleting response:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
