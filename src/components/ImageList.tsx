import {
	DndContext,
	type DragEndEvent,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
} from "@dnd-kit/sortable"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ImageFile } from "../types"
import { ImageCard } from "./ImageCard"

type Props = {
	images: ImageFile[]
	onReorder: (images: ImageFile[]) => void
	onDelete: (id: string) => void
	onRotate: (id: string) => void
	onRetake: (id: string) => void
	onPreview: (id: string) => void
	onAdd: () => void
}

export function ImageList({
	images,
	onReorder,
	onDelete,
	onRotate,
	onRetake,
	onPreview,
	onAdd,
}: Props) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 300, tolerance: 5 },
		}),
	)

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event
		if (!over || active.id === over.id) return
		const oldIndex = images.findIndex((img) => img.id === active.id)
		const newIndex = images.findIndex((img) => img.id === over.id)
		onReorder(arrayMove(images, oldIndex, newIndex))
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
				<div className="grid grid-cols-2 gap-3 p-4">
					{images.map((image) => (
						<ImageCard
							key={image.id}
							image={image}
							onDelete={onDelete}
							onRotate={onRotate}
							onRetake={onRetake}
							onPreview={onPreview}
						/>
					))}
					{/* 追加ボタン */}
					<button
						type="button"
						onClick={onAdd}
						className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
					>
						<HugeiconsIcon icon={Add01Icon} className="size-10" />
					</button>
				</div>
			</SortableContext>
		</DndContext>
	)
}
