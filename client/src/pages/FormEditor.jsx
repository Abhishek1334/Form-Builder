import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Save,
    Eye,
    Trash2,
    Upload,
    X,
    Copy,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    BarChart3,
} from 'lucide-react';
import CategorizeQuestionBuilder from '../components/CategorizeQuestionBuilder';
import ClozeQuestionBuilder from '../components/ClozeQuestionBuilder';
import ComprehensionQuestionBuilder from '../components/ComprehensionQuestionBuilder';
import { createForm } from '../api/services/formService.js';

export default function FormEditor() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        headerImage: null,
        questions: [],
    });

    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewCollapsed, setPreviewCollapsed] = useState(true);
    const [collapsedQuestions, setCollapsedQuestions] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const [savedFormId, setSavedFormId] = useState(null);

    const addQuestion = () => {
        const newQuestion = {
            id: `question-${Date.now()}`,
            type: 'categorize',
            questionText: '',
            image: null,
            // Initialize fields for all question types
            options: [],
            categories: [],
            correctAnswers: {},
            sentence: '',
            selectedWords: [],
            answerOptions: [],
            instructions: '',
            passage: '',
            questions: [],
        };
        setFormData((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
    };

    const updateQuestion = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
        }));
    };

    const removeQuestion = (index) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
        }));
    };

    const toggleQuestionCollapse = (questionId) => {
        setCollapsedQuestions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleHeaderImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, headerImage: file }));
        }
    };

    const removeHeaderImage = () => {
        setFormData((prev) => ({ ...prev, headerImage: null }));
    };

    const handleQuestionImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            updateQuestion(index, 'image', file);
        }
    };

    const removeQuestionImage = (index) => {
        updateQuestion(index, 'image', null);
    };

    const getValidationErrors = () => {
        const errors = [];

        if (!formData.title.trim()) {
            errors.push('Form title is required');
        }

        if (formData.questions.length === 0) {
            errors.push('At least one question is required');
        }

        formData.questions.forEach((q, index) => {
            if (!q.questionText?.trim()) {
                errors.push(`Question ${index + 1}: Question text is required`);
            }
        });

        return errors;
    };

    const handleSaveForm = async () => {
        const errors = getValidationErrors();
        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return;
        }

        setSaving(true);

        try {
            // Prepare form data for backend
            const formDataForBackend = {
                title: formData.title,
                description: '',
                questions: formData.questions.map((q) => ({
                    id: q.id,
                    type: q.type,
                    questionText: q.questionText,
                    // Handle different question types
                    ...(q.type === 'categorize' && {
                        categories: q.categories || [],
                        options: q.options || [],
                        correctAnswers: q.correctAnswers || {},
                    }),
                    ...(q.type === 'cloze' && {
                        sentence: q.sentence || '',
                        selectedWords: q.selectedWords || [],
                        answerOptions: q.answerOptions || [],
                    }),
                    ...(q.type === 'comprehension' && {
                        instructions: q.instructions || '',
                        passage: q.passage || '',
                        questions: q.questions || [],
                    }),
                })),
                settings: {
                    allowMultipleSubmissions: false,
                    showResults: true,
                    timeLimit: null,
                },
                createdBy: 'anonymous',
            };

            // Prepare images
            const images = {};
            if (formData.headerImage) {
                images.headerImage = formData.headerImage;
            }

            const questionImages = [];
            formData.questions.forEach((q) => {
                if (q.image) {
                    questionImages.push(q.image);
                }
            });
            if (questionImages.length > 0) {
                images.questionImages = questionImages;
            }

            // Save form to backend
            const response = await createForm(formDataForBackend, images);

            // Store the saved form ID
            setSavedFormId(response.data._id);

            // Navigate to preview page
            navigate(`/preview/${response.data._id}`);
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Failed to save form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(formData.displayData, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const validationErrors = getValidationErrors();

    // Render preview content
    const renderPreview = () => {
        return (
            <div className="h-full bg-gray-50 overflow-y-auto">
                {/* Form Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {/* Form Header */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                        {formData.headerImage && (
                            <div className="mb-3 sm:mb-4 lg:mb-6">
                                <img
                                    src={URL.createObjectURL(formData.headerImage)}
                                    alt="Header"
                                    className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
                            {formData.title || 'Untitled Form'}
                        </h1>
                        {formData.description && (
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                                {formData.description}
                            </p>
                        )}
                    </div>

                    {/* Name Field */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                        <label
                            htmlFor="name"
                            className="block text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3"
                        >
                            Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base lg:text-lg bg-gray-50 cursor-not-allowed"
                            disabled
                        />
                    </div>

                    {/* Questions */}
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        {formData.questions.length === 0 ? (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <span className="text-xl sm:text-2xl">📝</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-medium mb-2">
                                    No questions yet
                                </h3>
                                <p className="text-sm sm:text-base">
                                    Add questions in the form builder to see them here
                                </p>
                            </div>
                        ) : (
                            formData.questions.map((q) => (
                                <div
                                    key={q.id}
                                    className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8"
                                >
                                    <h3 className="font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg lg:text-xl">
                                        {q.questionText || 'Untitled Question'}
                                    </h3>
                                    {q.image && (
                                        <div className="mb-3 sm:mb-4 lg:mb-6">
                                            <img
                                                src={URL.createObjectURL(q.image)}
                                                alt="Question"
                                                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Question Type Specific Preview */}
                                    {q.type === 'categorize' && (
                                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                            {/* Items to categorize */}
                                            <div>
                                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                                    Items to categorize:
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                                    {(q.options || []).map((option) => (
                                                        <div
                                                            key={option.id}
                                                            className="p-2 sm:p-3 lg:p-4 border-2 border-dashed rounded-lg text-center bg-gray-50 border-gray-300"
                                                        >
                                                            <span className="font-medium text-xs sm:text-sm lg:text-base text-gray-600">
                                                                {option.text || 'Unnamed Item'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Categories */}
                                            <div>
                                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                                    Categories:
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                                                    {(q.categories || []).map((category) => (
                                                        <div
                                                            key={category.id}
                                                            className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] p-3 sm:p-4 lg:p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                                                        >
                                                            <h5 className="font-semibold text-gray-600 mb-2 sm:mb-3 lg:mb-4 text-center text-sm sm:text-base lg:text-lg">
                                                                {category.name ||
                                                                    'Unnamed Category'}
                                                            </h5>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {q.type === 'cloze' && (
                                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                            {/* Answer options */}
                                            <div>
                                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                                    Answer options:
                                                </h4>
                                                <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                                                    {(q.answerOptions || []).map((option) => (
                                                        <div
                                                            key={option.id}
                                                            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 border-2 border-dashed rounded-lg bg-gray-50 border-gray-300"
                                                        >
                                                            <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-600">
                                                                {option.text || 'Unnamed Option'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Sentence with blanks */}
                                            <div>
                                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                                    Fill in the blanks:
                                                </h4>
                                                <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg">
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-sm sm:text-base lg:text-lg leading-relaxed">
                                                        {q.sentence ? (
                                                            q.sentence
                                                                .split(' ')
                                                                .map((word, index) => {
                                                                    const selectedWord =
                                                                        q.selectedWords?.find(
                                                                            (sw) => sw.word === word
                                                                        );
                                                                    if (selectedWord) {
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    selectedWord.key
                                                                                }
                                                                                className="min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] h-8 sm:h-10 lg:h-12 border-2 border-dashed border-gray-300 rounded bg-white flex items-center justify-center"
                                                                            >
                                                                                <span className="text-gray-400 text-xs sm:text-sm lg:text-base">
                                                                                    Drop here
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <span key={index}>
                                                                            {word}
                                                                        </span>
                                                                    );
                                                                })
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                No sentence provided
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {q.type === 'comprehension' && (
                                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                            {q.instructions && (
                                                <div className="p-3 sm:p-4 lg:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-yellow-800">
                                                        Instructions:
                                                    </h4>
                                                    <p className="text-sm sm:text-base lg:text-lg text-yellow-700">
                                                        {q.instructions}
                                                    </p>
                                                </div>
                                            )}

                                            {q.passage && (
                                                <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                                        Passage:
                                                    </h4>
                                                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                                                        {q.passage}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                                                {(q.questions || []).map((subQuestion) => (
                                                    <div
                                                        key={subQuestion.id}
                                                        className="p-3 sm:p-4 lg:p-6 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg"
                                                    >
                                                        <h5 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">
                                                            {subQuestion.text}
                                                        </h5>
                                                        <div className="space-y-3">
                                                            {subQuestion.type === 'short-text' ? (
                                                                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                                                    <textarea
                                                                        placeholder="Type your answer here..."
                                                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 cursor-not-allowed"
                                                                        rows={3}
                                                                        disabled
                                                                    />
                                                                </div>
                                                            ) : (
                                                                (subQuestion.options || []).map(
                                                                    (option) => (
                                                                        <label
                                                                            key={option.id}
                                                                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-not-allowed transition-colors"
                                                                        >
                                                                            <input
                                                                                type={
                                                                                    subQuestion.type ===
                                                                                    'mca'
                                                                                        ? 'checkbox'
                                                                                        : 'radio'
                                                                                }
                                                                                name={
                                                                                    subQuestion.id
                                                                                }
                                                                                value={option.id}
                                                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                                                disabled
                                                                            />
                                                                            <span className="flex-1 text-gray-600">
                                                                                {option.text}
                                                                            </span>
                                                                        </label>
                                                                    )
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center">
                        <button
                            className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-gray-400 text-white rounded-lg font-medium text-sm sm:text-base lg:text-lg shadow-lg transition-all duration-200 cursor-not-allowed"
                            disabled
                        >
                            Submit Response
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
            {/* Form Builder Side */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    previewCollapsed ? 'w-full' : ''
                }`}
            >
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                    Form Builder
                                </h1>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                    Create interactive forms with multiple question types
                                </p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                <button
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            // On small devices, show modal instead of split screen
                                            setShowModal(true);
                                        } else {
                                            setPreviewCollapsed(!previewCollapsed);
                                        }
                                    }}
                                    className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-gray-700 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm lg:text-base"
                                >
                                    {previewCollapsed ? (
                                        <Eye size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                    ) : (
                                        <X size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {previewCollapsed ? 'Show Preview' : 'Hide Preview'}
                                    </span>
                                    <span className="sm:hidden">
                                        {previewCollapsed ? 'Preview' : 'Hide'}
                                    </span>
                                </button>
                                {savedFormId && (
                                    <button
                                        onClick={() => navigate(`/responses/${savedFormId}`)}
                                        className="flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 text-xs sm:text-sm lg:text-base"
                                    >
                                        <BarChart3
                                            size={14}
                                            className="sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                                        />
                                        <span className="hidden sm:inline">View Responses</span>
                                        <span className="sm:hidden">Responses</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveForm}
                                    disabled={validationErrors.length > 0 || saving}
                                    className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-xs sm:text-sm lg:text-base"
                                >
                                    <Save size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                    <span className="hidden sm:inline">
                                        {saving ? 'Saving...' : 'Save Form'}
                                    </span>
                                    <span className="sm:hidden">
                                        {saving ? 'Saving...' : 'Save'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Builder Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* Form Title Section */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 border border-gray-100">
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xs sm:text-sm lg:text-base">
                                    📝
                                </span>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                    Form Details
                                </h2>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                                    Set the basic information for your form
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                            {/* Form Title */}
                            <div>
                                <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 mb-1 sm:mb-2 lg:mb-3">
                                    Form Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                                    }
                                    placeholder="Enter form title..."
                                    className={`w-full p-2 sm:p-3 lg:p-4 border-2 rounded-lg text-sm sm:text-base lg:text-lg font-medium transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 ${
                                        !formData.title.trim()
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                />
                            </div>

                            {/* Header Image */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Header Image <span className="text-gray-500">(Optional)</span>
                                </label>
                                <div className="space-y-3">
                                    {formData.headerImage ? (
                                        <div className="relative">
                                            <img
                                                src={URL.createObjectURL(formData.headerImage)}
                                                alt="Header"
                                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                onClick={removeHeaderImage}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="block w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <Upload
                                                    className="text-gray-400 group-hover:text-blue-500 mb-1"
                                                    size={20}
                                                />
                                                <span className="text-gray-600 group-hover:text-blue-600 text-sm font-medium">
                                                    Click to upload header image
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleHeaderImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-sm">❓</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Questions</h2>
                                    <p className="text-gray-600 text-sm">
                                        Add questions to your form ({formData.questions.length}{' '}
                                        added)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700 mb-2">
                                    <span className="font-semibold">
                                        ⚠️ Please fix the following errors:
                                    </span>
                                </div>
                                <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Questions List */}
                        {formData.questions.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Plus className="text-gray-400" size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No questions yet
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Start building your form by adding your first question
                                </p>
                                <button
                                    onClick={addQuestion}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Add Your First Question
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        {/* Question Header - Always Visible */}
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-xs">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        Question {idx + 1}
                                                    </h3>
                                                    <p className="text-gray-600 text-xs">
                                                        Type:{' '}
                                                        {q.type.charAt(0).toUpperCase() +
                                                            q.type.slice(1)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleQuestionCollapse(q.id)}
                                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                                                >
                                                    {collapsedQuestions.has(q.id) ? (
                                                        <ChevronDown size={16} />
                                                    ) : (
                                                        <ChevronUp size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => removeQuestion(idx)}
                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Question Content - Collapsible */}
                                        {!collapsedQuestions.has(q.id) && (
                                            <div className="px-4 pb-4 space-y-4">
                                                {/* Question Type Selector */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                        Question Type
                                                    </label>
                                                    <select
                                                        value={q.type}
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                idx,
                                                                'type',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                                                    >
                                                        <option value="categorize">
                                                            Categorize
                                                        </option>
                                                        <option value="cloze">Cloze</option>
                                                        <option value="comprehension">
                                                            Comprehension
                                                        </option>
                                                    </select>
                                                </div>

                                                {/* Question Text */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                        Question Text{' '}
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={q.questionText || ''}
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                idx,
                                                                'questionText',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter your question here..."
                                                        className={`w-full p-3 border-2 rounded-lg resize-vertical min-h-16 transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm ${
                                                            !q.questionText?.trim()
                                                                ? 'border-red-300 bg-red-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        rows={2}
                                                    />
                                                </div>

                                                {/* Question Image */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                        Question Image{' '}
                                                        <span className="text-gray-500">
                                                            (Optional)
                                                        </span>
                                                    </label>
                                                    <div className="space-y-2">
                                                        {q.image ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={URL.createObjectURL(
                                                                        q.image
                                                                    )}
                                                                    alt="Question"
                                                                    className="w-full max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200"
                                                                />
                                                                <button
                                                                    onClick={() =>
                                                                        removeQuestionImage(idx)
                                                                    }
                                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label className="block w-full max-w-xs h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                                                                <div className="flex flex-col items-center justify-center h-full">
                                                                    <Upload
                                                                        className="text-gray-400 group-hover:text-blue-500 mb-1"
                                                                        size={16}
                                                                    />
                                                                    <span className="text-gray-600 group-hover:text-blue-600 text-xs">
                                                                        Click to upload question
                                                                        image
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) =>
                                                                        handleQuestionImageChange(
                                                                            idx,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Question Builder Components */}
                                                {q.type === 'categorize' && (
                                                    <CategorizeQuestionBuilder
                                                        question={q}
                                                        onChange={(field, value) =>
                                                            updateQuestion(idx, field, value)
                                                        }
                                                    />
                                                )}
                                                {q.type === 'cloze' && (
                                                    <ClozeQuestionBuilder
                                                        question={q}
                                                        onChange={(field, value) =>
                                                            updateQuestion(idx, field, value)
                                                        }
                                                    />
                                                )}
                                                {q.type === 'comprehension' && (
                                                    <ComprehensionQuestionBuilder
                                                        question={q}
                                                        onChange={(field, value) =>
                                                            updateQuestion(idx, field, value)
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Question Button - Below Last Question */}
                                <div className="pt-4">
                                    <button
                                        onClick={addQuestion}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <Plus size={20} />
                                        Add Another Question
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Side */}
            {!previewCollapsed && (
                <div className="hidden lg:flex w-1/2 border-l border-gray-200 flex-col">
                    {/* Preview Header */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="text-blue-600" size={20} />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Live Preview
                                </h2>
                            </div>
                            <button
                                onClick={() => setPreviewCollapsed(true)}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                            See how your form will appear to users
                        </p>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-hidden">{renderPreview()}</div>
                </div>
            )}

            {/* Form Preview Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Eye className="text-blue-600 sm:w-5 sm:h-5" size={16} />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Form Preview
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm"
                                >
                                    {copied ? (
                                        <Check size={14} className="sm:w-4 sm:h-4" />
                                    ) : (
                                        <Copy size={14} className="sm:w-4 sm:h-4" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {copied ? 'Copied!' : 'Copy JSON'}
                                    </span>
                                    <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                >
                                    <X size={16} className="sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">{renderPreview()}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
