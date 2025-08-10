import mongoose from 'mongoose';

const FormSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Form title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        headerImage: {
            url: {
                type: String,
                default: null,
            },
            filename: {
                type: String,
                default: null,
            },
            mimetype: {
                type: String,
                default: null,
            },
        },
        questions: [
            {
                id: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['categorize', 'cloze', 'comprehension'],
                    default: 'categorize',
                },
                questionText: {
                    type: String,
                    required: [true, 'Question text is required'],
                    trim: true,
                },
                image: {
                    url: {
                        type: String,
                        default: null,
                    },
                    filename: {
                        type: String,
                        default: null,
                    },
                    mimetype: {
                        type: String,
                        default: null,
                    },
                },
                // Categorize specific fields
                categories: [
                    {
                        id: {
                            type: String,
                            required: true,
                        },
                        name: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                    },
                ],
                options: [
                    {
                        id: {
                            type: String,
                            required: true,
                        },
                        text: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        categoryId: {
                            type: String,
                            default: null,
                        },
                    },
                ],
                correctAnswers: {
                    type: Map,
                    of: String,
                    default: {},
                },
                // Cloze specific fields
                sentence: {
                    type: String,
                    trim: true,
                    default: '',
                },
                selectedWords: [
                    {
                        word: {
                            type: String,
                            required: true,
                        },
                        position: {
                            type: Number,
                            required: true,
                        },
                        key: {
                            type: String,
                            required: true,
                        },
                    },
                ],
                answerOptions: [
                    {
                        id: {
                            type: String,
                            required: true,
                        },
                        text: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        isCorrect: {
                            type: Boolean,
                            required: true,
                        },
                        wordKey: {
                            type: String,
                            default: null,
                        },
                    },
                ],
                // Comprehension specific fields
                instructions: {
                    type: String,
                    trim: true,
                    default: '',
                },
                passage: {
                    type: String,
                    trim: true,
                    default: '',
                },
                questions: [
                    {
                        id: {
                            type: String,
                            required: true,
                        },
                        type: {
                            type: String,
                            required: true,
                            enum: ['mcq', 'mca', 'short-text'],
                            default: 'mcq',
                        },
                        text: {
                            type: String,
                            required: true,
                            trim: true,
                        },
                        options: [
                            {
                                id: {
                                    type: String,
                                    required: true,
                                },
                                text: {
                                    type: String,
                                    required: true,
                                    trim: true,
                                },
                                isCorrect: {
                                    type: Boolean,
                                    required: true,
                                    default: false,
                                },
                            },
                        ],
                        points: {
                            type: Number,
                            required: true,
                            min: [1, 'Points must be at least 1'],
                            default: 1,
                        },
                    },
                ],
            },
        ],
        settings: {
            allowMultipleSubmissions: {
                type: Boolean,
                default: false,
            },
            showResults: {
                type: Boolean,
                default: true,
            },
            timeLimit: {
                type: Number,
                min: [1, 'Time limit must be at least 1 minute'],
                default: null,
            },
        },
        createdBy: {
            type: String,
            default: 'anonymous', // For future auth system
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: false },
        toObject: { virtuals: false },
    }
);

// Indexes for better performance
FormSchema.index({ createdAt: -1 });
FormSchema.index({ isActive: 1 });
FormSchema.index({ createdBy: 1 });

// Virtual for question count
FormSchema.virtual('questionCount').get(function () {
    return this.questions ? this.questions.length : 0;
});

// Virtual for total possible points
FormSchema.virtual('totalPoints').get(function () {
    let total = 0;
    if (!this.questions) return total;

    this.questions.forEach((question) => {
        if (question.type === 'comprehension') {
            if (question.questions) {
                question.questions.forEach((subQuestion) => {
                    total += subQuestion.points || 1;
                });
            }
        } else {
            total += 1; // Default 1 point for categorize and cloze
        }
    });
    return total;
});

// Pre-save middleware for validation
FormSchema.pre('save', function (next) {
    // Validate that questions array is not empty
    if (this.questions.length === 0) {
        return next(new Error('Form must have at least one question'));
    }

    // Validate each question based on its type
    this.questions.forEach((question, index) => {
        if (!question.questionText || question.questionText.trim() === '') {
            return next(new Error(`Question ${index + 1}: Question text is required`));
        }

        switch (question.type) {
            case 'categorize':
                if (!question.categories || question.categories.length === 0) {
                    return next(
                        new Error(`Question ${index + 1}: At least one category is required`)
                    );
                }
                if (!question.options || question.options.length === 0) {
                    return next(new Error(`Question ${index + 1}: At least one item is required`));
                }
                break;

            case 'cloze':
                if (!question.sentence || question.sentence.trim() === '') {
                    return next(new Error(`Question ${index + 1}: Sentence is required`));
                }
                if (!question.selectedWords || question.selectedWords.length === 0) {
                    return next(
                        new Error(`Question ${index + 1}: At least one word must be selected`)
                    );
                }
                if (!question.answerOptions || question.answerOptions.length === 0) {
                    return next(
                        new Error(`Question ${index + 1}: At least one answer option is required`)
                    );
                }
                break;

            case 'comprehension':
                if (!question.passage || question.passage.trim() === '') {
                    return next(new Error(`Question ${index + 1}: Passage is required`));
                }
                if (!question.questions || question.questions.length === 0) {
                    return next(
                        new Error(`Question ${index + 1}: At least one sub-question is required`)
                    );
                }
                break;
        }
    });

    next();
});

export default mongoose.model('Form', FormSchema);
