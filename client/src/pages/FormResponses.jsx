import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { getForm } from '../api/services/formService.js';
import { getResponses } from '../api/services/responseService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const FormResponses = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [formResponse, responsesResponse] = await Promise.all([
                getForm(formId),
                getResponses(formId),
            ]);

            setForm(formResponse.data);
            setResponses(responsesResponse.data);
            setAnalytics(responsesResponse.analytics || {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [formId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getQuestionText = (questionId) => {
        const question = form?.questions?.find((q) => q.id === questionId);
        return question?.questionText || 'Unknown Question';
    };

    const renderAnswer = (answer, questionType, questionId) => {
        // Add safety check for answer
        if (!answer) {
            return <span className="text-gray-500">No answer provided</span>;
        }

        switch (questionType) {
            case 'categorize': {
                // Find the question that contains this answer
                const categorizeQuestion = form?.questions?.find((q) => q.id === questionId);
                const item = categorizeQuestion?.options?.find((opt) => opt.id === answer.itemId);
                const category = categorizeQuestion?.categories?.find(
                    (cat) => cat.id === answer.selectedCategoryId
                );

                // Check if answer is correct
                const isCorrect = item?.categoryId === answer.selectedCategoryId;

                return (
                    <div className="text-sm p-3 rounded border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">Item: {item?.text}</span>
                            <span
                                className={`text-xs px-2 py-1 rounded ${
                                    isCorrect
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                        </div>
                        <div className="text-gray-600">
                            <span>User selected: </span>
                            <span className="font-medium">
                                {category?.name || 'No category selected'}
                            </span>
                        </div>
                        {!isCorrect && item?.categoryId && (
                            <div className="text-gray-500 text-xs mt-1">
                                Correct category:{' '}
                                {
                                    form?.questions
                                        ?.find((q) => q.id === questionId)
                                        ?.categories?.find((cat) => cat.id === item.categoryId)
                                        ?.name
                                }
                            </div>
                        )}
                    </div>
                );
            }

            case 'cloze': {
                // Find the question that contains this answer
                const clozeQuestion = form?.questions?.find((q) => q.id === questionId);
                const correctOption = clozeQuestion?.answerOptions?.find(
                    (option) => option.wordKey === answer.blankId && option.isCorrect
                );
                const isClozeCorrect = correctOption?.text === answer.selectedAnswer;

                return (
                    <div className="text-sm p-3 rounded border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">
                                Blank: {answer.blankId}
                            </span>
                            <span
                                className={`text-xs px-2 py-1 rounded ${
                                    isClozeCorrect
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {isClozeCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                        </div>
                        <div className="text-gray-600">
                            <span>User answered: </span>
                            <span className="font-medium">
                                {answer.selectedAnswer || 'No answer'}
                            </span>
                        </div>
                        {!isClozeCorrect && correctOption?.text && (
                            <div className="text-gray-500 text-xs mt-1">
                                Correct answer: {correctOption.text}
                            </div>
                        )}
                    </div>
                );
            }

            case 'comprehension': {
                // Find the comprehension question that contains this sub-question
                const comprehensionQuestion = form?.questions?.find((q) => q.id === questionId);
                const subQuestion = comprehensionQuestion?.questions?.find(
                    (sq) => sq.id === answer.subQuestionId
                );

                if (answer.type === 'short-text') {
                    return (
                        <div className="text-sm p-3 rounded border border-gray-200 bg-gray-50">
                            <div className="font-medium mb-2 text-purple-800">
                                {subQuestion?.text}
                            </div>
                            <div className="text-gray-600">
                                <span>User answer: </span>
                                <span className="font-medium">
                                    "{answer.textAnswer || 'No answer provided'}"
                                </span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                                (Short text answers receive points for attempting)
                            </div>
                        </div>
                    );
                } else {
                    // Ensure selectedOptions exists and is an array
                    const selectedOptionsArray = answer.selectedOptions || [];

                    const selectedOptions = subQuestion?.options?.filter((opt) =>
                        selectedOptionsArray.includes(opt.id)
                    );

                    // Check if answers are correct
                    const correctOptions =
                        subQuestion?.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) ||
                        [];
                    const allCorrect = selectedOptionsArray.every((selectedId) =>
                        correctOptions.includes(selectedId)
                    );
                    const allSelected = correctOptions.every((correctId) =>
                        selectedOptionsArray.includes(correctId)
                    );
                    const isCorrect = allCorrect && allSelected;

                    return (
                        <div className="text-sm p-3 rounded border border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-purple-800">
                                    {subQuestion?.text}
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded ${
                                        isCorrect
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                            </div>
                            <div className="text-gray-600">
                                <span>User selected: </span>
                                <span className="font-medium">
                                    {selectedOptions?.length > 0
                                        ? selectedOptions.map((opt) => opt.text).join(', ')
                                        : 'No options selected'}
                                </span>
                            </div>
                            {!isCorrect && correctOptions.length > 0 && (
                                <div className="text-gray-500 text-xs mt-1">
                                    Correct options:{' '}
                                    {subQuestion?.options
                                        ?.filter((opt) => correctOptions.includes(opt.id))
                                        .map((opt) => opt.text)
                                        .join(', ')}
                                </div>
                            )}
                        </div>
                    );
                }
            }

            default:
                return <span className="text-gray-500">Unknown answer type</span>;
        }
    };

    const renderResponseDetails = (response) => {
        if (!response || !response.responses) {
            return (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-center text-gray-500">No response data available</div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">Response Details</h3>
                    <button
                        onClick={() => setSelectedResponse(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <span className="text-xs sm:text-sm text-gray-500">Submitted by:</span>
                        <div className="font-medium text-sm sm:text-base">
                            {response.submittedBy}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs sm:text-sm text-gray-500">Submitted at:</span>
                        <div className="font-medium text-sm sm:text-base">
                            {formatDate(response.submittedAt)}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs sm:text-sm text-gray-500">Score:</span>
                        <div className="font-medium text-base sm:text-lg">
                            {response.score}/{response.maxScore} ({response.percentageScore}%)
                        </div>
                    </div>
                    <div>
                        <span className="text-xs sm:text-sm text-gray-500">Time spent:</span>
                        <div className="font-medium text-sm sm:text-base">
                            {response.timeSpentMinutes || 0} minutes
                        </div>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {response.responses.map((questionResponse, index) => {
                        if (!questionResponse || !questionResponse.answers) {
                            return (
                                <div key={index} className="border rounded-lg p-3 sm:p-4">
                                    <div className="text-gray-500 text-sm sm:text-base">
                                        Invalid question response data
                                    </div>
                                </div>
                            );
                        }
                        const question = form?.questions?.find(
                            (q) => q.id === questionResponse.questionId
                        );
                        const correctAnswers = questionResponse.answers.filter((answer) => {
                            if (questionResponse.type === 'categorize') {
                                const item = question?.options?.find(
                                    (opt) => opt.id === answer.itemId
                                );
                                return item?.categoryId === answer.selectedCategoryId;
                            } else if (questionResponse.type === 'cloze') {
                                const correctOption = question?.answerOptions?.find(
                                    (option) =>
                                        option.wordKey === answer.blankId && option.isCorrect
                                );
                                return correctOption?.text === answer.selectedAnswer;
                            } else if (questionResponse.type === 'comprehension') {
                                const subQuestion = question?.questions?.find(
                                    (sq) => sq.id === answer.subQuestionId
                                );
                                if (answer.type === 'short-text') {
                                    return true; // Short text gets points for attempting
                                } else {
                                    const selectedOptionsArray = answer.selectedOptions || [];
                                    const correctOptions =
                                        subQuestion?.options
                                            ?.filter((opt) => opt.isCorrect)
                                            .map((opt) => opt.id) || [];
                                    const allCorrect = selectedOptionsArray.every((selectedId) =>
                                        correctOptions.includes(selectedId)
                                    );
                                    const allSelected = correctOptions.every((correctId) =>
                                        selectedOptionsArray.includes(correctId)
                                    );
                                    return allCorrect && allSelected;
                                }
                            }
                            return false;
                        }).length;

                        return (
                            <div key={index} className="border rounded-lg p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                                        {getQuestionText(questionResponse.questionId)}
                                    </h4>
                                    <div className="text-xs sm:text-sm text-gray-500">
                                        {correctAnswers}/{questionResponse.answers.length} correct
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {questionResponse.answers.map((answer, answerIndex) => (
                                        <div
                                            key={answerIndex}
                                            className="pl-3 sm:pl-4 border-l-2 border-gray-200"
                                        >
                                            {renderAnswer(
                                                answer,
                                                questionResponse.type,
                                                questionResponse.questionId
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner text="Loading responses..." />
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
            {/* Page Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Form Builder
                            </button>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900">Form Responses</h1>
                        <div className="w-32"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Form Info */}
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-4">
                        {form.title}
                    </h2>
                    {form.description && (
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 lg:mb-6">
                            {form.description}
                        </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                            <span className="text-xs sm:text-sm lg:text-base text-gray-600">
                                Total Responses
                            </span>
                            <span className="font-semibold text-sm sm:text-base lg:text-lg">
                                {analytics.totalResponses || 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                            <span className="text-xs sm:text-sm lg:text-base text-gray-600">
                                Avg Score
                            </span>
                            <span className="font-semibold text-sm sm:text-base lg:text-lg">
                                {analytics.averageScore?.toFixed(1) || 0}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                            <span className="text-xs sm:text-sm lg:text-base text-gray-600">
                                Avg Time
                            </span>
                            <span className="font-semibold text-sm sm:text-base lg:text-lg">
                                {analytics.averageTime?.toFixed(1) || 0} min
                            </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                            <span className="text-xs sm:text-sm lg:text-base text-gray-600">
                                Questions
                            </span>
                            <span className="font-semibold text-sm sm:text-base lg:text-lg">
                                {form.questions?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Responses List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-4 sm:p-6 lg:p-8 border-b">
                                <h3 className="text-base sm:text-lg lg:text-xl font-semibold">
                                    All Responses
                                </h3>
                            </div>
                            <div className="divide-y">
                                {responses.length === 0 ? (
                                    <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500 text-sm sm:text-base lg:text-lg">
                                        No responses yet
                                    </div>
                                ) : (
                                    responses.map((response) => (
                                        <div
                                            key={response._id}
                                            className="p-4 sm:p-6 lg:p-8 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => setSelectedResponse(response)}
                                        >
                                            <div className="flex items-center justify-between mb-2 lg:mb-3">
                                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                                                        {response.percentageScore >= 70 ? (
                                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                                                        )}
                                                        <span className="font-medium text-sm sm:text-base lg:text-lg">
                                                            {response.submittedBy}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-base sm:text-lg lg:text-xl">
                                                        {response.score}/{response.maxScore}
                                                    </div>
                                                    <div className="text-xs sm:text-sm lg:text-base text-gray-500">
                                                        {response.percentageScore}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs sm:text-sm lg:text-base text-gray-500">
                                                <span>{formatDate(response.submittedAt)}</span>
                                                <span>{response.timeSpentMinutes || 0} min</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Response Details Sidebar */}
                    <div className="lg:col-span-1">
                        {selectedResponse ? (
                            renderResponseDetails(selectedResponse)
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
                                <div className="text-center text-gray-500">
                                    <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 lg:mb-6 text-gray-300" />
                                    <p className="text-sm sm:text-base lg:text-lg">
                                        Select a response to view details
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormResponses;
