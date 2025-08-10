import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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

// Sortable Category Item Component
const SortableCategoryItem = ({ category, index, onUpdate, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <GripVertical size={16} />
                    </div>
                    <span className="text-gray-500 text-sm font-medium w-8">C{index + 1}</span>
                    <input
                        type="text"
                        value={category.name}
                        onChange={(e) => onUpdate(category.id, 'name', e.target.value)}
                        placeholder={`Category ${index + 1}`}
                        className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                            !category.name.trim()
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    />
                    <button
                        onClick={() => onRemove(category.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sortable Item Component
const SortableItemComponent = ({
    item,
    index,
    categories,
    onUpdate,
    onRemove,
    onAssignCategory,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                        <GripVertical size={16} />
                    </div>
                    <span className="text-gray-500 text-sm font-medium w-8">I{index + 1}</span>
                    <input
                        type="text"
                        value={item.text}
                        onChange={(e) => onUpdate(item.id, 'text', e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                            !item.text.trim()
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    />
                    <select
                        value={item.categoryId || ''}
                        onChange={(e) => onAssignCategory(item.id, e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 min-w-32"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name || `Category ${categories.indexOf(cat) + 1}`}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CategorizeQuestionBuilder({ question = {}, onChange }) {
    const [categories, setCategories] = useState(question.categories || []);
    const [items, setItems] = useState(question.options || []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Update parent component when data changes
    const updateParent = (field, value) => {
        onChange?.(field, value);
    };

    // Update correct answers whenever items change
    const updateCorrectAnswers = () => {
        const correctAnswers = {};
        items.forEach((item) => {
            if (item.categoryId) {
                correctAnswers[item.id] = item.categoryId;
            }
        });
        updateParent('correctAnswers', correctAnswers);
    };

    // Add category
    const addCategory = () => {
        const newCategory = {
            id: `cat-${Date.now()}`,
            name: '',
        };
        const newCategories = [...categories, newCategory];
        setCategories(newCategories);
        updateParent('categories', newCategories);
    };

    // Update category
    const updateCategory = (categoryId, field, value) => {
        const newCategories = categories.map((cat) =>
            cat.id === categoryId ? { ...cat, [field]: value } : cat
        );
        setCategories(newCategories);
        updateParent('categories', newCategories);
    };

    // Remove category
    const removeCategory = (categoryId) => {
        const newCategories = categories.filter((cat) => cat.id !== categoryId);
        setCategories(newCategories);
        updateParent('categories', newCategories);

        // Remove categoryId from items that were assigned to this category
        const newItems = items.map((item) =>
            item.categoryId === categoryId ? { ...item, categoryId: '' } : item
        );
        setItems(newItems);
        updateParent('options', newItems);
        updateCorrectAnswers();
    };

    // Add item
    const addItem = () => {
        const newItem = {
            id: `item-${Date.now()}`,
            text: '',
            categoryId: '',
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        updateParent('options', newItems);
    };

    // Update item
    const updateItem = (itemId, field, value) => {
        const newItems = items.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        setItems(newItems);
        updateParent('options', newItems);
        updateCorrectAnswers();
    };

    // Remove item
    const removeItem = (itemId) => {
        const newItems = items.filter((item) => item.id !== itemId);
        setItems(newItems);
        updateParent('options', newItems);
        updateCorrectAnswers();
    };

    // Assign item to category
    const assignItemToCategory = (itemId, categoryId) => {
        const newItems = items.map((item) => (item.id === itemId ? { ...item, categoryId } : item));
        setItems(newItems);
        updateParent('options', newItems);
        updateCorrectAnswers();
    };

    // Handle drag end for categories
    const handleCategoryDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((cat) => cat.id === active.id);
            const newIndex = categories.findIndex((cat) => cat.id === over.id);
            const newCategories = arrayMove(categories, oldIndex, newIndex);
            setCategories(newCategories);
            updateParent('categories', newCategories);
        }
    };

    // Handle drag end for items
    const handleItemDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
            updateParent('options', newItems);
        }
    };

    // Validation function
    const getValidationErrors = () => {
        const errors = [];

        if (categories.length === 0) {
            errors.push('At least one category is required');
        }

        if (items.length === 0) {
            errors.push('At least one item is required');
        }

        categories.forEach((cat, index) => {
            if (!cat.name.trim()) {
                errors.push(`Category ${index + 1}: Name is required`);
            }
        });

        items.forEach((item, index) => {
            if (!item.text.trim()) {
                errors.push(`Item ${index + 1}: Text is required`);
            }
            if (!item.categoryId) {
                errors.push(`Item ${index + 1}: Must be assigned to a category`);
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

            {/* Categories Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">📂</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                            <p className="text-gray-600 text-sm">
                                Define the categories for classification ({categories.length} added)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addCategory}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        <Plus size={16} />
                        Add Category
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-blue-200 rounded-lg bg-white">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="text-blue-600" size={24} />
                        </div>
                        <p className="text-gray-600 mb-3">No categories added yet</p>
                        <button
                            onClick={addCategory}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                        >
                            Add Your First Category
                        </button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleCategoryDragEnd}
                    >
                        <SortableContext
                            items={categories.map((cat) => cat.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {categories.map((category, index) => (
                                    <SortableCategoryItem
                                        key={category.id}
                                        category={category}
                                        index={index}
                                        onUpdate={updateCategory}
                                        onRemove={removeCategory}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Items Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">📝</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                            <p className="text-gray-600 text-sm">
                                Add items to be categorized ({items.length} added)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        <Plus size={16} />
                        Add Item
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-green-200 rounded-lg bg-white">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="text-green-600" size={24} />
                        </div>
                        <p className="text-gray-600 mb-3">No items added yet</p>
                        <button
                            onClick={addItem}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                        >
                            Add Your First Item
                        </button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleItemDragEnd}
                    >
                        <SortableContext
                            items={items.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <SortableItemComponent
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        categories={categories}
                                        onUpdate={updateItem}
                                        onRemove={removeItem}
                                        onAssignCategory={assignItemToCategory}
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
