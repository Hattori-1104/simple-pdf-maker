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
}

export function ProgressModal({ progress }: Props) {
	return (
		<Dialog open={progress !== null}>
			<DialogContent className="max-w-sm" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>PDF を生成中</DialogTitle>
				</DialogHeader>
				<div className="space-y-3 py-2">
					<p className="text-sm text-muted-foreground">{progress?.step}</p>
					<Progress value={progress?.percent ?? 0} />
				</div>
			</DialogContent>
		</Dialog>
	)
}
