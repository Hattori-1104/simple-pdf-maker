export type Rotation = 0 | 90 | 180 | 270

export type ImageFile = {
	id: string
	file: File
	previewUrl: string
	rotation: Rotation
}

export type Progress = {
	step: string
	percent: number
} | null
