import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ id, children }) {
    const { setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
}

// Export a separate component for the drag handle
export function DragHandle({ children, dragListeners }) {
    return (
        <div {...dragListeners?.listeners} {...dragListeners?.attributes} className="cursor-grab">
            {children}
        </div>
    );
}
