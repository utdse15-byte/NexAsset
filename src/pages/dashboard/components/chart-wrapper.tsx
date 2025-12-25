import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { cn } from "@/utils";

interface ChartWrapperProps {
	title?: React.ReactNode;
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
}

export function ChartWrapper({ title, action, children, className, contentClassName }: ChartWrapperProps) {
	return (
		<Card className={cn("border border-border shadow-sm bg-card/50 backdrop-blur-sm", className)}>
			{(title || action) && (
				<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
					{title && <CardTitle className="text-lg font-bold">{title}</CardTitle>}
					{action && <div>{action}</div>}
				</CardHeader>
			)}
			<CardContent className={cn("p-6", contentClassName)}>{children}</CardContent>
		</Card>
	);
}
