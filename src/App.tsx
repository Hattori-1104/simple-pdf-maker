import { Effect } from "effect"
import { useRef, useState } from "react"
import { FileNameInput } from "./components/FileNameInput"
import { GenerateButton } from "./components/GenerateButton"
import { ImageLightbox } from "./components/ImageLightbox"
import { ImageList } from "./components/ImageList"
import { ProgressModal } from "./components/ProgressModal"
import { UploadZone } from "./components/UploadZone"
import { generateId } from "./lib/id"
import { downloadPdf, generatePdf } from "./lib/pdf"
import type { ImageFile, Progress, Rotation } from "./types"

function buildPreviewFilename(prefix: string): string {
	const now = new Date()
	const mm = String(now.getMonth() + 1).padStart(2, "0")
	const dd = String(now.getDate()).padStart(2, "0")
	const hh = String(now.getHours()).padStart(2, "0")
	const min = String(now.getMinutes()).padStart(2, "0")
	return prefix.trim() ? `${prefix.trim()}_${mm}/${dd}/${hh}:${min}.pdf` : `${mm}/${dd}/${hh}:${min}.pdf`
}

export default function App() {
	const [images, setImages] = useState<ImageFile[]>([])
	const [lightboxId, setLightboxId] = useState<string | null>(null)
	const [progress, setProgress] = useState<Progress>(null)
	const [prefix, setPrefix] = useState("")
	const [error, setError] = useState<string | null>(null)

	const addInputRef = useRef<HTMLInputElement>(null)
	const retakeIdRef = useRef<string | null>(null)
	const retakeInputRef = useRef<HTMLInputElement>(null)

	function addFiles(files: File[]) {
		const newImages: ImageFile[] = files.map((file) => ({
			id: generateId(),
			file,
			previewUrl: URL.createObjectURL(file),
			rotation: 0 as Rotation,
		}))
		setImages((prev) => [...prev, ...newImages])
	}

	function handleDelete(id: string) {
		setImages((prev) => {
			const removed = prev.find((img) => img.id === id)
			if (removed) URL.revokeObjectURL(removed.previewUrl)
			return prev.filter((img) => img.id !== id)
		})
	}

	function handleRotate(id: string) {
		setImages((prev) =>
			prev.map((img) =>
				img.id === id
					? { ...img, rotation: ((img.rotation + 270) % 360) as Rotation }
					: img,
			),
		)
	}

	function handleRetake(id: string) {
		retakeIdRef.current = id
		retakeInputRef.current?.click()
	}

	function handleRetakeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		const id = retakeIdRef.current
		if (!file || !id) return
		e.target.value = ""
		retakeIdRef.current = null
		setImages((prev) =>
			prev.map((img) => {
				if (img.id !== id) return img
				URL.revokeObjectURL(img.previewUrl)
				return { ...img, file, previewUrl: URL.createObjectURL(file) }
			}),
		)
	}

	function handleAddClick() {
		addInputRef.current?.click()
	}

	function handleAddFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? [])
		if (files.length > 0) addFiles(files)
		e.target.value = ""
	}

	function handleGenerate() {
		setError(null)
		setProgress({ step: "準備中...", percent: 0 })

		Effect.runPromise(
			generatePdf(images, prefix, (step, percent) => {
				setProgress({ step, percent })
			}).pipe(
				Effect.flatMap((result) => downloadPdf(result)),
			),
		)
			.catch((e) => {
				setError(`エラーが発生しました: ${String(e)}`)
			})
			.finally(() => {
				setProgress(null)
			})
	}

	const lightboxImage = lightboxId ? images.find((img) => img.id === lightboxId) ?? null : null

	return (
		<div className="max-w-lg mx-auto min-h-dvh flex flex-col">
			<header className="p-4 border-b">
				<h1 className="text-xl font-bold">画像 → PDF</h1>
			</header>

			<main className="flex-1 overflow-y-auto">
				{images.length === 0 ? (
					<UploadZone onFilesSelected={addFiles} />
				) : (
					<ImageList
						images={images}
						onReorder={setImages}
						onDelete={handleDelete}
						onRotate={handleRotate}
						onRetake={handleRetake}
						onPreview={setLightboxId}
						onAdd={handleAddClick}
					/>
				)}

				{error && (
					<p className="mx-4 text-sm text-destructive">{error}</p>
				)}
			</main>

			{images.length > 0 && (
				<footer className="space-y-2 pt-2">
					<FileNameInput
						value={prefix}
						onChange={setPrefix}
						previewFilename={buildPreviewFilename(prefix)}
					/>
					<GenerateButton
						disabled={images.length === 0 || progress !== null}
						onClick={handleGenerate}
					/>
				</footer>
			)}

			{/* 取り直し用の隠し input */}
			<input
				ref={retakeInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleRetakeFileChange}
			/>

			{/* 追加アップロード用の隠し input */}
			<input
				ref={addInputRef}
				type="file"
				accept="image/*"
				multiple
				className="hidden"
				onChange={handleAddFileChange}
			/>

			<ImageLightbox image={lightboxImage} onClose={() => setLightboxId(null)} />
			<ProgressModal progress={progress} />
		</div>
	)
}
