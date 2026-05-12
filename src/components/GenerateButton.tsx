import { Button } from "@/components/ui/button"

type Props = {
	disabled: boolean
	onClick: () => void
}

export function GenerateButton({ disabled, onClick }: Props) {
	return (
		<div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t">
			<Button
				className="w-full h-12 text-base font-semibold"
				disabled={disabled}
				onClick={onClick}
			>
				PDFを生成
			</Button>
		</div>
	)
}
