import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Cancel01Icon, CameraRotated01Icon, Drag01Icon, ImageCounterClockwiseIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import type { ImageFile } from "../types"

type Props = {
	image: ImageFile
	onDelete: (id: string) => void
	onRotate: (id: string) => void
	onRetake: (id: string) => void
	onPreview: (id: string) => void
}

export function ImageCard({ image, onDelete, onRotate, onRetake, onPreview }: Props) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: image.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="relative rounded-lg overflow-hidden bg-muted aspect-square"
		>
			{/* サムネイル（タップで拡大） */}
			<button
				type="button"
				className="w-full h-full"
				onClick={() => onPreview(image.id)}
			>
				<img
					src={image.previewUrl}
					alt="プレビュー"
					className="w-full h-full object-cover"
					style={{ transform: `rotate(${image.rotation}deg)` }}
					draggable={false}
				/>
			</button>

			{/* 操作ボタン群（右上） */}
			<div className="absolute top-1 right-1 flex flex-col gap-1">
				<Button
					size="icon"
					variant="secondary"
					className="size-8 rounded-full shadow"
					onClick={() => onDelete(image.id)}
				>
					<HugeiconsIcon icon={Cancel01Icon} className="size-4" />
				</Button>
				<Button
					size="icon"
					variant="secondary"
					className="size-8 rounded-full shadow"
					onClick={() => onRotate(image.id)}
				>
					<HugeiconsIcon icon={ImageCounterClockwiseIcon} className="size-4" />
				</Button>
				<Button
					size="icon"
					variant="secondary"
					className="size-8 rounded-full shadow"
					onClick={() => onRetake(image.id)}
				>
					<HugeiconsIcon icon={CameraRotated01Icon} className="size-4" />
				</Button>
			</div>

			{/* ドラッグハンドル（左下） */}
			<div
				{...attributes}
				{...listeners}
				className="absolute bottom-1 left-1 size-8 rounded-full bg-black/40 flex items-center justify-center text-white cursor-grab active:cursor-grabbing"
				style={{ touchAction: "none" }}
			>
				<HugeiconsIcon icon={Drag01Icon} className="size-4" />
			</div>
		</div>
	)
}
