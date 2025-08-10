import { useState } from 'react';
import { Plus, Trash2, GripVertical, Eye, Type, X } from 'lucide-react';
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

// Sortable Answer Option Component
const SortableAnswerOption = ({ option, index, isDuplicate, onUpdate, onRemove, isCorrect }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: option.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${
                    isCorrect
                        ? 'border-blue-200 bg-blue-50'
                        : isDuplicate
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <GripVertical size={16} />
                    </div>
                    <span
                        className={`text-sm font-medium w-8 ${
                            isCorrect ? 'text-blue-600' : 'text-gray-500'
                        }`}
                    >
                        {isCorrect ? '✓' : index + 1}
                    </span>
                    <input
                        type="text"
                        value={option.text}
                        onChange={(e) => onUpdate(option.id, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        readOnly={isCorrect}
                        disabled={isCorrect}
                        className={`flex-1 p-2 border rounded-lg transition-all duration-200 ${
                            isCorrect
                                ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200'
                                : isDuplicate
                                ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                                : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                        }`}
                    />
                    {!isCorrect && (
                        <button
                            onClick={() => onRemove(option.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                {isCorrect && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                        ✓ Correct answer (cannot be edited)
                    </div>
                )}
                {isDuplicate && !isCorrect && (
                    <div className="mt-2 text-xs text-red-600 font-medium">⚠️ Duplicate option</div>
                )}
            </div>
        </div>
    );
};

export default function ClozeQuestionBuilder({ question = {}, onChange }) {
    const [sentence, setSentence] = useState(question.sentence || '');
    const [selectedWords, setSelectedWords] = useState(question.selectedWords || []);
    const [answerOptions, setAnswerOptions] = useState(question.answerOptions || []);

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

    // Handle sentence change
    const handleSentenceChange = (newSentence) => {
        setSentence(newSentence);
        updateQuestion('sentence', newSentence);
        // Don't automatically update questionText - let user set it separately

        // Remove selected words that are no longer in the sentence
        const newSelectedWords = selectedWords.filter((wordData) =>
            newSentence.includes(wordData.word)
        );
        setSelectedWords(newSelectedWords);
        updateQuestion('selectedWords', newSelectedWords);

        updateAnswerOptionsForWords(newSelectedWords);
    };

    // Toggle word selection
    const toggleWordSelection = (word, position) => {
        const wordKey = `${word}-${position}`;
        const existingIndex = selectedWords.findIndex((w) => w.key === wordKey);

        if (existingIndex >= 0) {
            // Remove word
            const newSelectedWords = selectedWords.filter((_, index) => index !== existingIndex);
            setSelectedWords(newSelectedWords);
            updateQuestion('selectedWords', newSelectedWords);
            updateAnswerOptionsForWords(newSelectedWords);
        } else {
            // Add word
            const newWordData = { word, position, key: wordKey };
            const newSelectedWords = [...selectedWords, newWordData];
            setSelectedWords(newSelectedWords);
            updateQuestion('selectedWords', newSelectedWords);
            updateAnswerOptionsForWords(newSelectedWords);
        }
    };

    // Remove selected word
    const removeSelectedWord = (wordKey) => {
        const newSelectedWords = selectedWords.filter((w) => w.key !== wordKey);
        setSelectedWords(newSelectedWords);
        updateQuestion('selectedWords', newSelectedWords);
        updateAnswerOptionsForWords(newSelectedWords);
    };

    // Update answer options based on selected words
    const updateAnswerOptionsForWords = (newSelectedWords) => {
        const newAnswerOptions = [];

        // Add correct answers from selected words
        newSelectedWords.forEach((wordData) => {
            const existingCorrect = answerOptions.find(
                (opt) => opt.isCorrect && opt.wordKey === wordData.key
            );

            if (existingCorrect) {
                newAnswerOptions.push(existingCorrect);
            } else {
                newAnswerOptions.push({
                    id: `correct-${wordData.key}`,
                    text: wordData.word,
                    isCorrect: true,
                    wordKey: wordData.key,
                });
            }
        });

        // Add existing incorrect options
        answerOptions.forEach((option) => {
            if (!option.isCorrect) {
                newAnswerOptions.push(option);
            }
        });

        setAnswerOptions(newAnswerOptions);
        updateQuestion('answerOptions', newAnswerOptions);
    };

    // Add incorrect option
    const addIncorrectOption = () => {
        if (selectedWords.length === 0) return;

        const wordData = selectedWords[0]; // Associate with first selected word
        const newOption = {
            id: `incorrect-${wordData.key}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            text: '',
            isCorrect: false,
            wordKey: wordData.key,
        };

        const newAnswerOptions = [...answerOptions, newOption];
        setAnswerOptions(newAnswerOptions);
        updateQuestion('answerOptions', newAnswerOptions);
    };

    // Update answer option
    const updateAnswerOption = (optionId, field, value) => {
        const newAnswerOptions = answerOptions.map((option) =>
            option.id === optionId ? { ...option, [field]: value } : option
        );
        setAnswerOptions(newAnswerOptions);
        updateQuestion('answerOptions', newAnswerOptions);
    };

    // Remove answer option
    const removeAnswerOption = (optionId) => {
        const newAnswerOptions = answerOptions.filter((option) => option.id !== optionId);
        setAnswerOptions(newAnswerOptions);
        updateQuestion('answerOptions', newAnswerOptions);
    };

    // Handle drag end
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = answerOptions.findIndex((option) => option.id === active.id);
            const newIndex = answerOptions.findIndex((option) => option.id === over.id);
            const newAnswerOptions = arrayMove(answerOptions, oldIndex, newIndex);
            setAnswerOptions(newAnswerOptions);
            updateQuestion('answerOptions', newAnswerOptions);
        }
    };

    // Generate preview
    const generatePreview = () => {
        if (!sentence.trim()) return sentence;

        let previewText = sentence;
        const sortedSelectedWords = [...selectedWords].sort((a, b) => b.position - a.position);

        sortedSelectedWords.forEach((wordData) => {
            const before = previewText.substring(0, wordData.position);
            const after = previewText.substring(wordData.position + wordData.word.length);
            previewText = before + '_____' + after;
        });

        return previewText;
    };

    // Render sentence with clickable words
    const renderSentence = () => {
        if (!sentence.trim()) return null;

        const words = sentence.split(/(\s+)/);
        let currentPosition = 0;

        return words.map((part, index) => {
            const isWord = /\S/.test(part);
            const startPosition = currentPosition;
            currentPosition += part.length;

            if (!isWord) {
                return <span key={index}>{part}</span>;
            }

            const isSelected = selectedWords.some(
                (w) => w.word === part && w.position === startPosition
            );

            return (
                <span
                    key={index}
                    onClick={() => toggleWordSelection(part, startPosition)}
                    className={`cursor-pointer px-1 rounded transition-all duration-200 ${
                        isSelected
                            ? 'bg-blue-200 text-blue-800 font-semibold underline'
                            : 'hover:bg-gray-100 hover:text-gray-800'
                    }`}
                >
                    {part}
                </span>
            );
        });
    };

    // Get answer options grouped by word
    const getAnswerOptionsByWord = () => {
        const grouped = {};
        answerOptions.forEach((option) => {
            if (!grouped[option.wordKey]) {
                grouped[option.wordKey] = [];
            }
            grouped[option.wordKey].push(option);
        });
        return grouped;
    };

    // Check if option is duplicate
    const isDuplicateOption = (text, currentId) => {
        if (!text.trim()) return false;
        return answerOptions.some(
            (option) =>
                option.text.trim().toLowerCase() === text.trim().toLowerCase() &&
                option.id !== currentId
        );
    };

    // Validation function
    const getValidationErrors = () => {
        const errors = [];

        if (!sentence.trim()) {
            errors.push('Sentence is required');
        }

        if (selectedWords.length === 0) {
            errors.push('At least one word must be selected to create a blank');
        }

        if (answerOptions.length === 0) {
            errors.push('At least one answer option is required');
        }

        answerOptions.forEach((option, index) => {
            if (!option.text.trim()) {
                errors.push(`Answer option ${index + 1}: Text is required`);
            }
        });

        return errors;
    };

    // Get warnings (non-blocking)
    const getWarnings = () => {
        const warnings = [];

        // Check for duplicate options within each word group
        const groupedOptions = getAnswerOptionsByWord();
        Object.entries(groupedOptions).forEach(([wordKey, options]) => {
            const texts = options.map((opt) => opt.text.trim());
            const duplicates = texts.filter((item, index) => texts.indexOf(item) !== index);
            if (duplicates.length > 0) {
                const wordData = selectedWords.find((w) => w.key === wordKey);
                warnings.push(
                    `Duplicate options for word "${wordData.word}": ${duplicates.join(', ')}`
                );
            }
        });

        // Check for duplicate options across all answer options
        answerOptions.forEach((option, index) => {
            if (option.text.trim() && isDuplicateOption(option.text, option.id)) {
                warnings.push(`Answer option ${index + 1}: "${option.text}" is a duplicate`);
            }
        });

        return warnings;
    };

    const validationErrors = getValidationErrors();
    const warnings = getWarnings();

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

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                        <span className="font-semibold">⚠️ Warnings:</span>
                    </div>
                    <ul className="list-disc list-inside text-yellow-600 text-sm space-y-1">
                        {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Sentence Input Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Type className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Sentence</h3>
                        <p className="text-gray-600 text-sm">
                            Type your sentence and click words to make them blanks
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Sentence Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Sentence <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={sentence}
                            onChange={(e) => handleSentenceChange(e.target.value)}
                            placeholder="Type your sentence here..."
                            className={`w-full p-4 border-2 rounded-lg resize-vertical min-h-24 transition-all duration-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 ${
                                !sentence.trim()
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            rows={4}
                        />
                    </div>

                    {/* Interactive Sentence Display */}
                    {sentence.trim() && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Click words to create blanks
                            </label>
                            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg min-h-16">
                                <div className="text-gray-800 leading-relaxed">
                                    {renderSentence()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            {selectedWords.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Eye className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                            <p className="text-gray-600 text-sm">
                                How the question will appear to students
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                        <div className="text-gray-800 leading-relaxed font-medium">
                            {generatePreview()}
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Words Section */}
            {selectedWords.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Selected Words
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Words that will become blanks ({selectedWords.length} selected)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {selectedWords.map((wordData) => (
                            <div
                                key={wordData.key}
                                className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-200"
                            >
                                <span className="font-medium">{wordData.word}</span>
                                <button
                                    onClick={() => removeSelectedWord(wordData.key)}
                                    className="text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-1 transition-colors duration-200"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Answer Options Section */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-sm">📝</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Answer Options</h3>
                            <p className="text-gray-600 text-sm">
                                Manage correct and incorrect answers ({answerOptions.length} total)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addIncorrectOption}
                        disabled={selectedWords.length === 0}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        <Plus size={16} />
                        Add Wrong Answer
                    </button>
                </div>

                {answerOptions.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-orange-200 rounded-lg bg-white">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="text-orange-600" size={24} />
                        </div>
                        <p className="text-gray-600 mb-3">No answer options yet</p>
                        <p className="text-sm text-gray-500">
                            Select words in the sentence to automatically create correct answers
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={answerOptions.map((option) => option.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {answerOptions.map((option, index) => (
                                    <SortableAnswerOption
                                        key={option.id}
                                        option={option}
                                        index={index}
                                        isCorrect={option.isCorrect}
                                        isDuplicate={isDuplicateOption(option.text, option.id)}
                                        onUpdate={updateAnswerOption}
                                        onRemove={removeAnswerOption}
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
