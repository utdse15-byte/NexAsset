import { Icon } from "@/components/icon";
import { cn } from "@/utils";

interface TrendIndicatorProps {
	value: number;
	className?: string;
}

export function TrendIndicator({ value, className }: TrendIndicatorProps) {
	const isPositive = value > 0;
	const isNegative = value < 0;
	const isNeutral = value === 0;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-bold text-sm",
				isPositive ? "text-emerald-500" : isNegative ? "text-rose-500" : "text-muted-foreground",
				className,
			)}
		>
			{isPositive && <Icon icon="mdi:arrow-up" size={16} />}
			{isNegative && <Icon icon="mdi:arrow-down" size={16} />}
			{isNeutral && <Icon icon="mdi:minus" size={16} />}
			{Math.abs(value)}%
		</span>
	);
}
