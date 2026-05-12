import { Input } from "@/components/ui/input"

type Props = {
	value: string
	onChange: (value: string) => void
	previewFilename: string
}

export function FileNameInput({ value, onChange, previewFilename }: Props) {
	return (
		<div className="px-4 space-y-1">
			<Input
				placeholder="ファイル名のプレフィックス（任意）"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<p className="text-xs text-muted-foreground px-1">{previewFilename}</p>
		</div>
	)
}
