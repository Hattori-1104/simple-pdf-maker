import { FileDownloadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import type { Progress as ProgressState } from "../types"

type Props = {
	progress: ProgressState
	onClose: () => void
}

export function ProgressModal({ progress, onClose }: Props) {
	return (
		<Dialog open={progress !== null}>
			<DialogContent className="max-w-sm" showCloseButton={false}>
				{progress?.done ? (
					<>
						<DialogHeader>
							<DialogTitle>ダウンロード完了</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col items-center gap-4 py-4">
							<HugeiconsIcon
								icon={FileDownloadIcon}
								className="size-16"
							/>
							<p className="text-sm text-muted-foreground">
								PDFのダウンロードが完了しました
							</p>
							<Button className="w-full" onClick={onClose}>
								閉じる
							</Button>
						</div>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>PDF を生成中</DialogTitle>
						</DialogHeader>
						<div className="space-y-3 py-2">
							<p className="text-sm text-muted-foreground">{progress?.step}</p>
							<Progress value={progress?.percent ?? 0} />
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
