import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, AlertCircle } from 'lucide-react';

const FillForm = () => {
    const navigate = useNavigate();
    const [formId, setFormId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formId.trim()) {
            setError('Please enter a form ID');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Navigate to the form preview page
            navigate(`/preview/${formId.trim()}`);
        } catch (error) {
            setError('Invalid form ID. Please check and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
                            Fill Out a Form
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                            Enter the form ID to start answering questions
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                            <div>
                                <label
                                    htmlFor="formId"
                                    className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 lg:mb-3"
                                >
                                    Form ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="formId"
                                    value={formId}
                                    onChange={(e) => {
                                        setFormId(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="Enter form ID (e.g., 68988105d40a7aa1073ede1b)"
                                    className={`w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg lg:text-xl ${
                                        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {error && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !formId.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base lg:text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="w-4 h-4" />
                                        Start Filling Form
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Help Section */}
                    <div className="mt-4 sm:mt-6 lg:mt-8 bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-6">
                        <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base lg:text-lg">
                            How to get a Form ID?
                        </h3>
                        <ul className="text-xs sm:text-sm lg:text-base text-blue-700 space-y-1 lg:space-y-2">
                            <li>• Ask the form creator for the form ID</li>
                            <li>• Look for the form ID in the form URL</li>
                            <li>• Check your email if you received a form link</li>
                        </ul>
                    </div>

                    {/* Example */}
                    <div className="mt-3 sm:mt-4 lg:mt-6 text-center">
                        <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                            Example Form ID:{' '}
                            <code className="bg-gray-100 px-1 sm:px-2 lg:px-3 py-1 lg:py-2 rounded text-xs lg:text-sm">
                                68988105d40a7aa1073ede1b
                            </code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FillForm;
