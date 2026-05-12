import { Camera01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRef } from "react"

type Props = {
	onFilesSelected: (files: File[]) => void
}

export function UploadZone({ onFilesSelected }: Props) {
	const inputRef = useRef<HTMLInputElement>(null)

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? [])
		if (files.length > 0) onFilesSelected(files)
		e.target.value = ""
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-[60dvh] p-8 gap-6">
			<div className="text-center space-y-2">
				<p className="text-2xl font-semibold">画像をアップロード</p>
				<p className="text-sm text-muted-foreground">
					写真またはカメラで撮影した画像をPDFに変換します
				</p>
			</div>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				className="w-48 h-48 rounded-2xl border-2 border-dashed border-primary/50 flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary/5 transition-colors active:scale-95"
			>
				<HugeiconsIcon icon={Camera01Icon} className="size-16" />
				<span className="text-sm font-medium">タップして選択</span>
			</button>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				multiple
				className="hidden"
				onChange={handleChange}
			/>
		</div>
	)
}
