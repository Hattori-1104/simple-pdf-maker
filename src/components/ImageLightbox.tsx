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
			<DialogContent className="max-w-sm p-4">
				{image && (
					<img
						src={image.previewUrl}
						alt="拡大表示"
						className="w-full h-full object-contain rounded"
						style={{ transform: `rotate(${image.rotation}deg)` }}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
