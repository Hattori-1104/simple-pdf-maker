import { Data, Effect } from "effect"
import type { Rotation } from "../types"

const MAX_LONG_SIDE = 2048
const JPEG_QUALITY = 0.8

export class ImageProcessError extends Data.TaggedError("ImageProcessError")<{
	message: string
}> {}

function readFileAsDataUrl(file: File): Effect.Effect<string, ImageProcessError> {
	return Effect.tryPromise({
		try: () =>
			new Promise<string>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(reader.result as string)
				reader.onerror = () => reject(new Error("FileReader failed"))
				reader.readAsDataURL(file)
			}),
		catch: (e) => new ImageProcessError({ message: String(e) }),
	})
}

function loadImage(src: string): Effect.Effect<HTMLImageElement, ImageProcessError> {
	return Effect.tryPromise({
		try: () =>
			new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image()
				img.onload = () => resolve(img)
				img.onerror = () => reject(new Error("Failed to decode image"))
				img.src = src
			}),
		catch: (e) => new ImageProcessError({ message: String(e) }),
	})
}

function scaleSize(
	width: number,
	height: number,
): { width: number; height: number } {
	const longSide = Math.max(width, height)
	if (longSide <= MAX_LONG_SIDE) return { width, height }
	const ratio = MAX_LONG_SIDE / longSide
	return { width: Math.round(width * ratio), height: Math.round(height * ratio) }
}

/**
 * Canvas で画像を回転・リサイズ・JPEG 圧縮して Uint8Array で返す。
 * rotation は右回りの角度（0 | 90 | 180 | 270）。
 */
export function processImage(
	file: File,
	rotation: Rotation,
): Effect.Effect<Uint8Array<ArrayBuffer>, ImageProcessError> {
	return Effect.gen(function* () {
		const dataUrl = yield* readFileAsDataUrl(file)
		const img = yield* loadImage(dataUrl)

		const scaled = scaleSize(img.naturalWidth, img.naturalHeight)
		const isRotated90or270 = rotation === 90 || rotation === 270

		const canvasW = isRotated90or270 ? scaled.height : scaled.width
		const canvasH = isRotated90or270 ? scaled.width : scaled.height

		const canvas = document.createElement("canvas")
		canvas.width = canvasW
		canvas.height = canvasH

		const ctx = canvas.getContext("2d")
		if (!ctx) {
			return yield* Effect.fail(new ImageProcessError({ message: "Failed to get 2D context" }))
		}

		ctx.translate(canvasW / 2, canvasH / 2)
		ctx.rotate((rotation * Math.PI) / 180)
		ctx.drawImage(img, -scaled.width / 2, -scaled.height / 2, scaled.width, scaled.height)

		return yield* Effect.tryPromise({
			try: () =>
				new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
					canvas.toBlob(
						(blob) => {
							if (!blob) {
								reject(new Error("toBlob returned null"))
								return
							}
							blob
								.arrayBuffer()
								.then((buf) => resolve(new Uint8Array(buf)))
								.catch(reject)
						},
						"image/jpeg",
						JPEG_QUALITY,
					)
				}),
			catch: (e) => new ImageProcessError({ message: String(e) }),
		})
	})
}
