import mongoose from 'mongoose';

const FormResponseSchema = new mongoose.Schema(
    {
        formId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Form',
            required: [true, 'Form ID is required'],
        },
        responses: [
            {
                questionId: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['categorize', 'cloze', 'comprehension'],
                },
                answers: [
                    {
                        // For categorize questions
                        itemId: {
                            type: String,
                            default: null,
                        },
                        selectedCategoryId: {
                            type: String,
                            default: null,
                        },
                        // For cloze questions
                        blankId: {
                            type: String,
                            default: null,
                        },
                        selectedAnswer: {
                            type: String,
                            default: null,
                        },
                        // For comprehension questions
                        subQuestionId: {
                            type: String,
                            default: null,
                        },
                        selectedOptions: [
                            {
                                type: String,
                                default: [],
                            },
                        ],
                        textAnswer: {
                            type: String,
                            default: null,
                        },
                    },
                ],
            },
        ],
        score: {
            type: Number,
            default: 0,
            min: [0, 'Score cannot be negative'],
        },
        maxScore: {
            type: Number,
            required: true,
            min: [1, 'Max score must be at least 1'],
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        submittedBy: {
            type: String,
            default: 'anonymous', // For future auth system
        },
        timeSpent: {
            type: Number, // in seconds
            min: [0, 'Time spent cannot be negative'],
            default: 0,
        },
        isComplete: {
            type: Boolean,
            default: true,
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for better performance
FormResponseSchema.index({ formId: 1, submittedAt: -1 });
FormResponseSchema.index({ submittedBy: 1 });
FormResponseSchema.index({ submittedAt: -1 });

// Virtual for percentage score
FormResponseSchema.virtual('percentageScore').get(function () {
    if (this.maxScore === 0) return 0;
    return Math.round((this.score / this.maxScore) * 100);
});

// Virtual for time spent in minutes
FormResponseSchema.virtual('timeSpentMinutes').get(function () {
    return Math.round((this.timeSpent / 60) * 100) / 100; // Round to 2 decimal places
});

// Pre-save middleware for validation
FormResponseSchema.pre('save', function (next) {
    // Validate that responses array is not empty
    if (this.responses.length === 0) {
        return next(new Error('Response must have at least one answer'));
    }

    // Validate each response
    this.responses.forEach((response, index) => {
        if (!response.questionId) {
            return next(new Error(`Response ${index + 1}: Question ID is required`));
        }

        if (!response.type) {
            return next(new Error(`Response ${index + 1}: Question type is required`));
        }

        if (!response.answers || response.answers.length === 0) {
            return next(new Error(`Response ${index + 1}: At least one answer is required`));
        }

        // Validate answers based on question type
        response.answers.forEach((answer, answerIndex) => {
            switch (response.type) {
                case 'categorize':
                    if (!answer.itemId || !answer.selectedCategoryId) {
                        return next(
                            new Error(
                                `Response ${index + 1}, Answer ${
                                    answerIndex + 1
                                }: Item ID and selected category are required for categorize questions`
                            )
                        );
                    }
                    break;

                case 'cloze':
                    if (!answer.blankId || !answer.selectedAnswer) {
                        return next(
                            new Error(
                                `Response ${index + 1}, Answer ${
                                    answerIndex + 1
                                }: Blank ID and selected answer are required for cloze questions`
                            )
                        );
                    }
                    break;

                case 'comprehension':
                    if (!answer.subQuestionId) {
                        return next(
                            new Error(
                                `Response ${index + 1}, Answer ${
                                    answerIndex + 1
                                }: Sub-question ID is required for comprehension questions`
                            )
                        );
                    }
                    // For MCQ/MCA, selectedOptions should not be empty
                    // For short-text, textAnswer should not be empty
                    break;
            }
        });
    });

    next();
});

// Static method to calculate score for a response
FormResponseSchema.statics.calculateScore = async function (responseId) {
    const response = await this.findById(responseId).populate('formId');
    if (!response || !response.formId) {
        throw new Error('Response or form not found');
    }

    let totalScore = 0;
    const form = response.formId;

    response.responses.forEach((responseItem) => {
        const question = form.questions.find((q) => q.id === responseItem.questionId);
        if (!question) return;

        switch (question.type) {
            case 'categorize':
                // Check if all items are correctly categorized
                let categorizeScore = 0;
                const totalItems = question.options.length;
                let correctItems = 0;

                responseItem.answers.forEach((answer) => {
                    const correctCategoryId = question.correctAnswers.get(answer.itemId);
                    if (correctCategoryId === answer.selectedCategoryId) {
                        correctItems++;
                    }
                });

                categorizeScore = totalItems > 0 ? correctItems / totalItems : 0;
                totalScore += categorizeScore;
                break;

            case 'cloze':
                // Check if all blanks are correctly filled
                let clozeScore = 0;
                const totalBlanks = question.selectedWords.length;
                let correctBlanks = 0;

                responseItem.answers.forEach((answer) => {
                    const correctAnswer = question.answerOptions.find(
                        (opt) => opt.isCorrect && opt.wordKey === answer.blankId
                    );
                    if (correctAnswer && correctAnswer.text === answer.selectedAnswer) {
                        correctBlanks++;
                    }
                });

                clozeScore = totalBlanks > 0 ? correctBlanks / totalBlanks : 0;
                totalScore += clozeScore;
                break;

            case 'comprehension':
                // Check each sub-question
                responseItem.answers.forEach((answer) => {
                    const subQuestion = question.questions.find(
                        (sq) => sq.id === answer.subQuestionId
                    );
                    if (!subQuestion) return;

                    switch (subQuestion.type) {
                        case 'mcq':
                            const correctOption = subQuestion.options.find((opt) => opt.isCorrect);
                            if (
                                correctOption &&
                                answer.selectedOptions.includes(correctOption.id)
                            ) {
                                totalScore += subQuestion.points;
                            }
                            break;

                        case 'mca':
                            const correctOptions = subQuestion.options.filter(
                                (opt) => opt.isCorrect
                            );
                            const selectedCorrect = answer.selectedOptions.filter((selectedId) =>
                                correctOptions.some((correct) => correct.id === selectedId)
                            );
                            const selectedIncorrect = answer.selectedOptions.filter(
                                (selectedId) =>
                                    !correctOptions.some((correct) => correct.id === selectedId)
                            );

                            // Partial credit: correct selections minus incorrect selections
                            const partialScore = Math.max(
                                0,
                                selectedCorrect.length - selectedIncorrect.length
                            );
                            const maxPossible = correctOptions.length;
                            if (maxPossible > 0) {
                                totalScore += (partialScore / maxPossible) * subQuestion.points;
                            }
                            break;

                        case 'short-text':
                            // For short-text, we'll need manual grading or keyword matching
                            // For now, give 0 points (requires manual review)
                            break;
                    }
                });
                break;
        }
    });

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
};

export default mongoose.model('FormResponse', FormResponseSchema);
