import {
	Dialog,
	DialogContent,
} from "@/components/ui/dialog"
import type { ImageFile } from "../types"

type Props = {
	image: ImageFile | null
	onClose: () => void
}

export function ImageLightbox({ image, onClose }: Props) {
	return (
		<Dialog open={image !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="flex items-center justify-center bg-black/90 p-4 max-w-none w-screen h-screen border-none rounded-none"
				showCloseButton={false}
				onClick={onClose}
			>
				{image && (
					<img
						src={image.previewUrl}
						alt="拡大表示"
						className="max-w-full max-h-full object-contain"
						style={{ transform: `rotate(${image.rotation}deg)` }}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
