import { useState } from 'react';
import { Plus, Trash2, GripVertical, BookOpen, FileText, CheckCircle } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Question Component
const SortableQuestion = ({ question, index, onUpdate, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const updateQuestionField = (field, value) => {
        onUpdate(question.id, field, value);
    };

    const addOption = () => {
        const newOption = {
            id: `option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: '',
            isCorrect: false,
        };
        const newOptions = [...(question.options || []), newOption];
        updateQuestionField('options', newOptions);
    };

    const updateOption = (optionId, field, value) => {
        const newOptions = (question.options || []).map((option) =>
            option.id === optionId ? { ...option, [field]: value } : option
        );
        updateQuestionField('options', newOptions);
    };

    const removeOption = (optionId) => {
        const newOptions = (question.options || []).filter((option) => option.id !== optionId);
        updateQuestionField('options', newOptions);
    };

    const toggleCorrectOption = (optionId) => {
        const newOptions = (question.options || []).map((option) => ({
            ...option,
            isCorrect:
                question.type === 'mcq'
                    ? option.id === optionId
                    : option.id === optionId
                    ? !option.isCorrect
                    : option.isCorrect,
        }));
        updateQuestionField('options', newOptions);
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                {/* Question Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <GripVertical size={18} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">Q{index + 1}</span>
                        </div>
                        <select
                            value={question.type || 'mcq'}
                            onChange={(e) => updateQuestionField('type', e.target.value)}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        >
                            <option value="mcq">MCQ (Single Choice)</option>
                            <option value="mca">MCA (Multiple Choice)</option>
                            <option value="short-text">Short Text</option>
                        </select>
                    </div>
                    <button
                        onClick={() => onRemove(question.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 ml-auto"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={question.text || ''}
                        onChange={(e) => updateQuestionField('text', e.target.value)}
                        placeholder="Enter your question here..."
                        className={`w-full p-4 border-2 rounded-lg resize-vertical min-h-24 transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                            !question.text?.trim()
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        rows={3}
                    />
                </div>

                {/* Options (for MCQ/MCA) */}
                {(question.type === 'mcq' || question.type === 'mca') && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Answer Options
                            </label>
                            <button
                                onClick={addOption}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus size={16} />
                                Add Option
                            </button>
                        </div>

                        {(question.options || []).length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Plus className="text-gray-400" size={24} />
                                </div>
                                <p className="text-gray-600 mb-3">No options added yet</p>
                                <button
                                    onClick={addOption}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Add Your First Option
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(question.options || []).map((option, optionIndex) => (
                                    <div
                                        key={option.id}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <input
                                            type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                                            checked={option.isCorrect}
                                            onChange={() => toggleCorrectOption(option.id)}
                                            name={
                                                question.type === 'mcq'
                                                    ? `question-${question.id}`
                                                    : undefined
                                            }
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) =>
                                                updateOption(option.id, 'text', e.target.value)
                                            }
                                            placeholder={`Option ${optionIndex + 1}`}
                                            className={`flex-1 p-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${
                                                !option.text.trim()
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        />
                                        <button
                                            onClick={() => removeOption(option.id)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Points */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Points <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={question.points || 1}
                        onChange={(e) =>
                            updateQuestionField('points', parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-24 p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    />
                </div>
            </div>
        </div>
    );
};

export default function ComprehensionQuestionBuilder({ question = {}, onChange }) {
    const [instructions, setInstructions] = useState(question.instructions || '');
    const [passage, setPassage] = useState(question.passage || '');
    const [questions, setQuestions] = useState(question.questions || []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Function to update the question data
    const updateQuestion = (field, value) => {
        onChange?.(field, value);
    };

    // Handle instructions change
    const handleInstructionsChange = (newInstructions) => {
        setInstructions(newInstructions);
        updateQuestion('instructions', newInstructions);
    };

    // Handle passage change
    const handlePassageChange = (newPassage) => {
        setPassage(newPassage);
        updateQuestion('passage', newPassage);
    };

    // Add a new question
    const addQuestion = () => {
        const newQuestion = {
            id: `comprehension-question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'mcq',
            text: '',
            options: [],
            points: 1,
        };
        const newQuestions = [...questions, newQuestion];
        setQuestions(newQuestions);
        updateQuestion('questions', newQuestions);
    };

    // Update a specific question
    const updateQuestionField = (questionId, field, value) => {
        const newQuestions = questions.map((q) =>
            q.id === questionId ? { ...q, [field]: value } : q
        );
        setQuestions(newQuestions);
        updateQuestion('questions', newQuestions);
    };

    // Remove a question
    const removeQuestion = (questionId) => {
        const newQuestions = questions.filter((q) => q.id !== questionId);
        setQuestions(newQuestions);
        updateQuestion('questions', newQuestions);
    };

    // Handle drag end for reordering questions
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);
            const newQuestions = arrayMove(questions, oldIndex, newIndex);
            setQuestions(newQuestions);
            updateQuestion('questions', newQuestions);
        }
    };

    // Validation function
    const getValidationErrors = () => {
        const errors = [];

        if (!passage.trim()) {
            errors.push('Passage is required');
        }

        if (questions.length === 0) {
            errors.push('At least one question is required');
        }

        questions.forEach((q, index) => {
            if (!q.text.trim()) {
                errors.push(`Question ${index + 1}: Question text is required`);
            }

            if (q.type === 'mcq' || q.type === 'mca') {
                if ((q.options || []).length === 0) {
                    errors.push(`Question ${index + 1}: At least one option is required`);
                }

                const correctOptions = (q.options || []).filter((opt) => opt.isCorrect);
                

                if (correctOptions.length === 0) {
                    errors.push(`Question ${index + 1}: At least one correct answer is required`);
                }

                if (q.type === 'mcq' && correctOptions.length > 1) {
                    errors.push(`Question ${index + 1}: MCQ can only have one correct answer`);
                }

                (q.options || []).forEach((option, optionIndex) => {
                    if (!option.text.trim()) {
                        errors.push(
                            `Question ${index + 1}, Option ${optionIndex + 1}: Text is required`
                        );
                    }
                });
            }

            if (!q.points || q.points < 1) {
                errors.push(`Question ${index + 1}: Points must be at least 1`);
            }
        });

        return errors;
    };

    const validationErrors = getValidationErrors();

    return (
        <div className="space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                        <span className="font-semibold">⚠️ Validation Errors:</span>
                    </div>
                    <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                        {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Instructions Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
                        <p className="text-gray-600 text-sm">Optional guidance for students</p>
                    </div>
                </div>

                <textarea
                    value={instructions}
                    onChange={(e) => handleInstructionsChange(e.target.value)}
                    placeholder="Enter instructions for students (e.g., 'Read the passage below and answer the questions that follow')"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg resize-vertical min-h-24 transition-all duration-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300"
                    rows={3}
                />
            </div>

            {/* Passage Section */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Passage</h3>
                        <p className="text-gray-600 text-sm">
                            The text that students will read and answer questions about
                        </p>
                    </div>
                </div>

                <textarea
                    value={passage}
                    onChange={(e) => handlePassageChange(e.target.value)}
                    placeholder="Enter the passage or text that students will read..."
                    className={`w-full p-4 border-2 rounded-lg resize-vertical min-h-32 transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                        !passage.trim()
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    rows={8}
                />
            </div>

            {/* Questions Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                            <p className="text-gray-600 text-sm">
                                Create questions based on the passage ({questions.length} added)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addQuestion}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Plus size={20} />
                        Add Question
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-green-200 rounded-lg bg-white">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                        <p className="text-gray-600 mb-6">
                            Start building your comprehension by adding questions based on the
                            passage
                        </p>
                        <button
                            onClick={addQuestion}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                        >
                            Add Your First Question
                        </button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={questions.map((q) => q.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {questions.map((q, index) => (
                                    <SortableQuestion
                                        key={q.id}
                                        question={q}
                                        index={index}
                                        onUpdate={updateQuestionField}
                                        onRemove={removeQuestion}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
