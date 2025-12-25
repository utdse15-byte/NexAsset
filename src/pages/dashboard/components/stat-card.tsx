import { Chart, useChart } from "@/components/chart";
import { Icon } from "@/components/icon";
import { Card } from "@/ui/card";
import { Text, Title } from "@/ui/typography";
import { cn } from "@/utils";
import { rgbAlpha } from "@/utils/theme";

interface StatCardProps {
	title: string;
	value: string | number;
	icon: string;
	color: string;
	percent?: number;
	chartData?: number[];
	className?: string;
}

export function StatCard({ title, value, icon, color, percent, chartData, className }: StatCardProps) {
	const chartOptions = useChart({
		colors: [color],
		chart: {
			sparkline: { enabled: true },
			animations: { enabled: true },
		},
		stroke: { curve: "smooth", width: 2 },
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.1,
				stops: [0, 100],
			},
		},
		grid: { show: false },
		tooltip: {
			enabled: true,
			fixed: { enabled: false },
			x: { show: false },
			y: { title: { formatter: () => "" } },
			marker: { show: false },
		},
	});

	return (
		<Card
			className={cn(
				"relative overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm group",
				className,
			)}
		>
			{/* Background Decoration */}
			<div
				className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none"
				style={{ backgroundColor: color }}
			/>

			<div className="p-6 pb-0 relative z-10">
				<div className="flex justify-between items-start mb-4">
					<div
						className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
						style={{
							background: `linear-gradient(135deg, ${color} 0%, ${rgbAlpha(color, 0.6)} 100%)`,
							boxShadow: `0 8px 16px -4px ${rgbAlpha(color, 0.5)}`,
							color: "#ffffff",
						}}
					>
						<Icon icon={icon} size={24} />
					</div>
					{percent !== undefined && (
						<div
							className={cn(
								"flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border border-white/10",
								percent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500",
							)}
						>
							<Icon icon={percent >= 0 ? "solar:graph-up-bold" : "solar:graph-down-bold"} size={14} />
							<span>{Math.abs(percent)}%</span>
						</div>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<Title as="h3" className="text-3xl font-bold tracking-tight">
						{value}
					</Title>
					<Text variant="body2" className="text-muted-foreground font-medium">
						{title}
					</Text>
				</div>
			</div>

			{chartData && (
				<div className="w-full h-[80px] mt-2 -mb-1">
					<Chart type="area" height={80} options={chartOptions} series={[{ data: chartData }]} />
				</div>
			)}
		</Card>
	);
}
