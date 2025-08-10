import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Check, BarChart3 } from 'lucide-react';
import { getForm } from '../api/services/formService.js';
import { submitResponse } from '../api/services/responseService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const FormPreview = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [responses, setResponses] = useState({});
    const [copied, setCopied] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [name, setName] = useState('');

    const fetchForm = useCallback(async () => {
        try {
            const response = await getForm(formId);
            setForm(response.data);
        } catch (error) {
            console.error('Error fetching form:', error);
        } finally {
            setLoading(false);
        }
    }, [formId]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    const handleResponseChange = (questionId, value) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleDragStart = (e, item, questionId, itemType) => {
        setDraggedItem({ item, questionId, itemType });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetCategoryId, questionId, itemType) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.questionId !== questionId) return;

        if (itemType === 'categorize') {
            // Handle categorize drop
            const currentResponses = responses[questionId] || {};
            const newResponses = {
                ...currentResponses,
                [draggedItem.item.id]: targetCategoryId,
            };
            handleResponseChange(questionId, newResponses);
        } else if (itemType === 'cloze') {
            // Handle cloze drop - find the blank that was dropped on
            const targetBlank = e.target.closest('[data-blank-key]');
            if (targetBlank) {
                const blankKey = targetBlank.dataset.blankKey;
                const currentResponses = responses[questionId] || {};

                // Check if this word is already used in another blank
                const isWordAlreadyUsed = Object.values(currentResponses).includes(
                    draggedItem.item.text
                );

                if (!isWordAlreadyUsed) {
                    const newResponses = {
                        ...currentResponses,
                        [blankKey]: draggedItem.item.text,
                    };
                    handleResponseChange(questionId, newResponses);
                }
            }
        }

        setDraggedItem(null);
    };

    const handleSubmit = async () => {
        if (!form) return;

        // Validate name
        if (!name.trim()) {
            alert('Please enter your name before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const responseData = {
                responses: form.questions
                    .map((question) => {
                        const questionResponses = responses[question.id];

                        if (
                            !questionResponses ||
                            (question.type === 'categorize' &&
                                Object.keys(questionResponses).length === 0) ||
                            (question.type === 'cloze' &&
                                Object.keys(questionResponses).length === 0) ||
                            (question.type === 'comprehension' &&
                                Object.keys(questionResponses).length === 0)
                        ) {
                            return null; // Skip questions with no responses
                        }

                        return {
                            questionId: question.id,
                            type: question.type,
                            answers:
                                question.type === 'categorize'
                                    ? Object.entries(questionResponses).map(
                                          ([itemId, categoryId]) => ({
                                              itemId,
                                              selectedCategoryId: categoryId,
                                          })
                                      )
                                    : question.type === 'cloze'
                                    ? Object.entries(questionResponses).map(
                                          ([blankId, selectedAnswer]) => ({
                                              blankId,
                                              selectedAnswer,
                                          })
                                      )
                                    : question.type === 'comprehension'
                                    ? Object.entries(questionResponses)
                                          .map(([subQuestionId, response]) => {
                                              const subQuestion = question.questions?.find(
                                                  (q) => q.id === subQuestionId
                                              );
                                              if (!subQuestion) return null;

                                              if (subQuestion.type === 'short-text') {
                                                  return {
                                                      subQuestionId,
                                                      type: 'short-text',
                                                      textAnswer: response[0] || '',
                                                  };
                                              } else {
                                                  return {
                                                      subQuestionId,
                                                      type: subQuestion.type,
                                                      selectedOptions: response || [],
                                                  };
                                              }
                                          })
                                          .filter(Boolean)
                                    : questionResponses,
                        };
                    })
                    .filter(Boolean), // Remove null entries
                timeSpent: 0,
                submittedBy: 'anonymous',
                name: name.trim(),
            };

            await submitResponse(formId, responseData);
            alert('Response submitted successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error submitting response:', error);
            alert('Failed to submit response. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const copyFormLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const renderQuestion = (question) => {
        switch (question.type) {
            case 'categorize':
                return (
                    <div
                        key={question.id}
                        className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 border rounded-lg bg-white shadow-sm"
                    >
                        <h3 className="font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg lg:text-xl">
                            {question.questionText}
                        </h3>
                        {(() => {
                            return question.image && question.image.url ? (
                                <div className="mb-3 sm:mb-4 lg:mb-6">
                                    <img
                                        src={question.image.url}
                                        alt="Question"
                                        className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                                    />
                                </div>
                            ) : null;
                        })()}

                        {/* Interactive Categorize Question with Drag & Drop */}
                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                            {/* Items to categorize */}
                            <div>
                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                    Items to categorize:
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                    {question.options.map((option) => {
                                        const isPlaced = responses[question.id]?.[option.id];
                                        return (
                                            <div
                                                key={option.id}
                                                draggable={true}
                                                onDragStart={(e) =>
                                                    handleDragStart(
                                                        e,
                                                        option,
                                                        question.id,
                                                        'categorize'
                                                    )
                                                }
                                                onTouchStart={(e) => {
                                                    e.preventDefault();
                                                    handleDragStart(
                                                        e,
                                                        option,
                                                        question.id,
                                                        'categorize'
                                                    );
                                                }}
                                                className={`p-2 sm:p-3 lg:p-4 border-2 border-dashed rounded-lg text-center cursor-move transition-all touch-manipulation ${
                                                    isPlaced
                                                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                                } ${
                                                    draggedItem?.item?.id === option.id
                                                        ? 'opacity-50'
                                                        : ''
                                                }`}
                                            >
                                                <span className="font-medium text-xs sm:text-sm lg:text-base">
                                                    {option.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                    Categories:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                                    {question.categories.map((category) => (
                                        <div
                                            key={category.id}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) =>
                                                handleDrop(
                                                    e,
                                                    category.id,
                                                    question.id,
                                                    'categorize'
                                                )
                                            }
                                            onTouchOver={(e) => e.preventDefault()}
                                            onTouchEnd={(e) => {
                                                e.preventDefault();
                                                if (draggedItem) {
                                                    handleDrop(
                                                        e,
                                                        category.id,
                                                        question.id,
                                                        'categorize'
                                                    );
                                                }
                                            }}
                                            className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] p-3 sm:p-4 lg:p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 transition-all hover:border-blue-400"
                                        >
                                            <h5 className="font-semibold text-blue-800 mb-2 sm:mb-3 lg:mb-4 text-center text-sm sm:text-base lg:text-lg">
                                                {category.name}
                                            </h5>
                                            <div className="space-y-2">
                                                {question.options
                                                    .filter(
                                                        (option) =>
                                                            responses[question.id]?.[option.id] ===
                                                            category.id
                                                    )
                                                    .map((option) => (
                                                        <div
                                                            key={option.id}
                                                            draggable={true}
                                                            onDragStart={(e) =>
                                                                handleDragStart(
                                                                    e,
                                                                    option,
                                                                    question.id,
                                                                    'categorize'
                                                                )
                                                            }
                                                            className="p-2 bg-white border border-blue-200 rounded text-center cursor-move hover:bg-gray-50 transition-colors"
                                                        >
                                                            {option.text}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'cloze':
                return (
                    <div
                        key={question.id}
                        className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 border rounded-lg bg-white shadow-sm"
                    >
                        <h3 className="font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg lg:text-xl">
                            {question.questionText}
                        </h3>
                        {question.image && question.image.url && (
                            <div className="mb-3 sm:mb-4 lg:mb-6">
                                <img
                                    src={question.image.url}
                                    alt="Question"
                                    className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Interactive Cloze Question with Drag & Drop */}
                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                            {/* Answer options */}
                            <div>
                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                    Answer options:
                                </h4>
                                <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                                    {question.answerOptions.map((option) => {
                                        const isUsed = Object.values(
                                            responses[question.id] || {}
                                        ).includes(option.text);
                                        return (
                                            <div
                                                key={option.id}
                                                draggable={!isUsed}
                                                onDragStart={(e) =>
                                                    !isUsed &&
                                                    handleDragStart(e, option, question.id, 'cloze')
                                                }
                                                onTouchStart={(e) => {
                                                    if (!isUsed) {
                                                        e.preventDefault();
                                                        handleDragStart(
                                                            e,
                                                            option,
                                                            question.id,
                                                            'cloze'
                                                        );
                                                    }
                                                }}
                                                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 border-2 border-dashed rounded-lg transition-all touch-manipulation ${
                                                    isUsed
                                                        ? 'bg-green-50 border-green-300 text-green-700 opacity-50 cursor-not-allowed'
                                                        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-move'
                                                } ${
                                                    draggedItem?.item?.id === option.id
                                                        ? 'opacity-50'
                                                        : ''
                                                }`}
                                            >
                                                <span className="text-xs sm:text-sm lg:text-base font-medium">
                                                    {option.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sentence with blanks */}
                            <div>
                                <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                    Fill in the blanks:
                                </h4>
                                <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-sm sm:text-base lg:text-lg leading-relaxed">
                                        {question.sentence.split(' ').map((word, index) => {
                                            const selectedWord = question.selectedWords.find(
                                                (sw) =>
                                                    question.sentence.indexOf(
                                                        sw.word,
                                                        index > 0
                                                            ? question.sentence.indexOf(word)
                                                            : 0
                                                    ) ===
                                                    (index > 0
                                                        ? question.sentence.indexOf(word)
                                                        : 0)
                                            );

                                            if (selectedWord) {
                                                const answer =
                                                    responses[question.id]?.[selectedWord.key];
                                                return (
                                                    <div
                                                        key={selectedWord.key}
                                                        data-blank-key={selectedWord.key}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) =>
                                                            handleDrop(
                                                                e,
                                                                null,
                                                                question.id,
                                                                'cloze'
                                                            )
                                                        }
                                                        onTouchOver={(e) => e.preventDefault()}
                                                        onTouchEnd={(e) => {
                                                            e.preventDefault();
                                                            if (draggedItem) {
                                                                handleDrop(
                                                                    e,
                                                                    null,
                                                                    question.id,
                                                                    'cloze'
                                                                );
                                                            }
                                                        }}
                                                        className="min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] h-8 sm:h-10 lg:h-12 border-2 border-dashed border-blue-300 rounded bg-white flex items-center justify-center transition-all hover:border-blue-400"
                                                    >
                                                        {answer ? (
                                                            <span className="text-blue-700 font-medium text-xs sm:text-sm lg:text-base">
                                                                {answer}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs sm:text-sm lg:text-base">
                                                                Drop here
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return <span key={index}>{word}</span>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'comprehension':
                return (
                    <div
                        key={question.id}
                        className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 border rounded-lg bg-white shadow-sm"
                    >
                        <h3 className="font-semibold mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg lg:text-xl">
                            {question.questionText}
                        </h3>
                        {question.image && question.image.url && (
                            <div className="mb-3 sm:mb-4 lg:mb-6">
                                <img
                                    src={question.image.url}
                                    alt="Question"
                                    className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Interactive Comprehension Question */}
                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                            {question.instructions && (
                                <div className="p-3 sm:p-4 lg:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-yellow-800">
                                        Instructions:
                                    </h4>
                                    <p className="text-sm sm:text-base lg:text-lg text-yellow-700">
                                        {question.instructions}
                                    </p>
                                </div>
                            )}

                            {question.passage && (
                                <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg text-gray-700">
                                        Passage:
                                    </h4>
                                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                                        {question.passage}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                                {question.questions.map((subQuestion) => (
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
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                        rows={3}
                                                        value={
                                                            responses[question.id]?.[
                                                                subQuestion.id
                                                            ]?.[0] || ''
                                                        }
                                                        onChange={(e) => {
                                                            const currentResponses =
                                                                responses[question.id] || {};
                                                            handleResponseChange(question.id, {
                                                                ...currentResponses,
                                                                [subQuestion.id]: [e.target.value],
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                subQuestion.options.map((option) => (
                                                    <label
                                                        key={option.id}
                                                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type={
                                                                subQuestion.type === 'mca'
                                                                    ? 'checkbox'
                                                                    : 'radio'
                                                            }
                                                            name={subQuestion.id}
                                                            value={option.id}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                            onChange={(e) => {
                                                                const currentResponses =
                                                                    responses[question.id] || {};
                                                                const subResponses =
                                                                    currentResponses[
                                                                        subQuestion.id
                                                                    ] || [];

                                                                if (subQuestion.type === 'mca') {
                                                                    const newResponses = e.target
                                                                        .checked
                                                                        ? [
                                                                              ...subResponses,
                                                                              option.id,
                                                                          ]
                                                                        : subResponses.filter(
                                                                              (id) =>
                                                                                  id !== option.id
                                                                          );
                                                                    handleResponseChange(
                                                                        question.id,
                                                                        {
                                                                            ...currentResponses,
                                                                            [subQuestion.id]:
                                                                                newResponses,
                                                                        }
                                                                    );
                                                                } else {
                                                                    handleResponseChange(
                                                                        question.id,
                                                                        {
                                                                            ...currentResponses,
                                                                            [subQuestion.id]: [
                                                                                option.id,
                                                                            ],
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <span className="flex-1">
                                                            {option.text}
                                                        </span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner text="Loading form..." />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Not Found</h2>
                    <p className="text-gray-600 mb-4">The form you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Form Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Back to Form Builder</span>
                                <span className="sm:hidden">Back</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={copyFormLink}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                                <span className="hidden sm:inline">
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </span>
                                <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                            <button
                                onClick={() => navigate(`/responses/${formId}`)}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">View Responses</span>
                                <span className="sm:hidden">Responses</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Form Header */}
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                    {form.headerImage && form.headerImage.url && (
                        <div className="mb-3 sm:mb-4 lg:mb-6">
                            <img
                                src={form.headerImage.url}
                                alt="Header"
                                className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                            />
                        </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
                        {form.title}
                    </h1>
                    {form.description && (
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                            {form.description}
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base lg:text-lg"
                        required
                    />
                </div>

                {/* Questions */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                    {form.questions.map(renderQuestion)}
                </div>

                {/* Submit Button */}
                <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormPreview;
