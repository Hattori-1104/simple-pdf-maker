import { Data, Effect } from "effect"
import { PDFDocument } from "pdf-lib"
import type { ImageFile } from "../types"
import { type ImageProcessError, processImage } from "./image"

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89
const MARGIN_PT = 20

export class PdfError extends Data.TaggedError("PdfError")<{
	message: string
}> {}

export type PdfResult = {
	bytes: Uint8Array<ArrayBuffer>
	filename: string
}

function buildFilename(prefix: string): string {
	const now = new Date()
	const mm = String(now.getMonth() + 1).padStart(2, "0")
	const dd = String(now.getDate()).padStart(2, "0")
	const hh = String(now.getHours()).padStart(2, "0")
	const min = String(now.getMinutes()).padStart(2, "0")
	return prefix.trim()
		? `${prefix.trim()}_${mm}/${dd}/${hh}:${min}.pdf`
		: `${mm}/${dd}/${hh}:${min}.pdf`
}

function calcImageRect(
	imgWidth: number,
	imgHeight: number,
): { x: number; y: number; width: number; height: number } {
	const maxW = A4_WIDTH_PT - MARGIN_PT * 2
	const maxH = A4_HEIGHT_PT - MARGIN_PT * 2
	const scale = Math.min(maxW / imgWidth, maxH / imgHeight)
	const w = imgWidth * scale
	const h = imgHeight * scale
	return {
		x: (A4_WIDTH_PT - w) / 2,
		y: (A4_HEIGHT_PT - h) / 2,
		width: w,
		height: h,
	}
}

export function generatePdf(
	images: ImageFile[],
	prefix: string,
	onProgress: (step: string, percent: number) => void,
): Effect.Effect<PdfResult, PdfError | ImageProcessError> {
	return Effect.gen(function* () {
		const pdfDoc = yield* Effect.tryPromise({
			try: () => PDFDocument.create(),
			catch: (e) => new PdfError({ message: String(e) }),
		})

		for (let i = 0; i < images.length; i++) {
			const image = images[i]
			onProgress(
				`画像を処理中... (${i + 1}/${images.length})`,
				(i / images.length) * 80,
			)

			const jpegBytes = yield* processImage(image.file, image.rotation)

			const pdfImage = yield* Effect.tryPromise({
				try: () => pdfDoc.embedJpg(jpegBytes),
				catch: (e) => new PdfError({ message: String(e) }),
			})

			const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
			const rect = calcImageRect(pdfImage.width, pdfImage.height)
			page.drawImage(pdfImage, rect)
		}

		onProgress("PDFを構築中...", 90)

		const savedBytes = yield* Effect.tryPromise({
			try: () => pdfDoc.save(),
			catch: (e) => new PdfError({ message: String(e) }),
		})

		onProgress("完了", 100)

		return {
			bytes: savedBytes.slice(0),
			filename: buildFilename(prefix),
		}
	})
}

export function downloadPdf(result: PdfResult): Effect.Effect<void, PdfError> {
	return Effect.try({
		try: () => {
			const blob = new Blob([result.bytes], { type: "application/pdf" })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = result.filename
			a.style.display = "none"
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
		},
		catch: (e) => new PdfError({ message: String(e) }),
	})
}
