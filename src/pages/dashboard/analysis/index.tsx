import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/api/apiClient";
import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Text, Title } from "@/ui/typography";
import { ChartWrapper } from "../components/chart-wrapper";
import { StatCard } from "../components/stat-card";
import { TrendIndicator } from "../components/trend-indicator";

const timeOptions = [
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
	{ label: "Month", value: "month" },
];

interface DashboardData {
	inventoryHealth: {
		utilization: number;
		utilizationChange: number;
		compliance: number;
		complianceChange: number;
		chart: {
			categories: string[];
			series: { name: string; data: number[] }[];
		};
	};
	procurement: { value: number; change: number };
	depreciation: { value: number; change: number };
	warranty: { value: number; change: number };
	topRequestedAssets: { name: string; requests: number; change: number; stock: number; stockChange: number }[];
	assetCategories: { label: string; value: number; color: string; icon: string }[];
	departmentUsage: { dept: string; assets: number; value: number; utilization: number }[];
}

export default function Analysis() {
	const { t } = useTranslation();
	const [timeType, setTimeType] = useState<"day" | "week" | "month">("day");
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await apiClient.get<DashboardData>({
					url: `/dashboard/analysis?timeType=${timeType}`,
				});
				setData(res);
			} catch (error) {
				console.error("Failed to fetch dashboard analysis:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [timeType]);

	const chartOptions = useChart({
		xaxis: { categories: data?.inventoryHealth.chart.categories || [] },
		chart: { toolbar: { show: false } },
		grid: { strokeDashArray: 3 },
		stroke: { curve: "smooth", width: 3 },
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.05,
				stops: [0, 100],
			},
		},
	});

	const deviceChartOptions = useChart({
		labels: data?.assetCategories.map((d) => t(`sys.analysis.${d.label.toLowerCase()}`)) || [],
		stroke: { show: false },
		legend: { show: false },
		tooltip: { fillSeriesColor: false },
		plotOptions: { pie: { donut: { size: "75%" } } },
		colors: data?.assetCategories.map((d) => d.color) || [],
	});

	if (loading || !data) {
		return <div className="p-8 text-center">Loading analysis data...</div>;
	}

	const { inventoryHealth, procurement, depreciation, warranty, topRequestedAssets, assetCategories, departmentUsage } =
		data;

	return (
		<div className="flex flex-col gap-6 p-2">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<Title as="h2" className="text-3xl font-bold tracking-tight">
						{t("sys.analysis.title")}
					</Title>
					<Text variant="body2" className="text-muted-foreground mt-1">
						{t("sys.analysis.description")}
					</Text>
				</div>
				<div className="flex items-center gap-3 bg-card/50 p-1.5 rounded-xl border shadow-sm backdrop-blur-sm">
					<Text variant="body2" className="text-muted-foreground font-medium ml-2">
						{t("sys.analysis.period")}:
					</Text>
					<Select value={timeType} onValueChange={(v) => setTimeType(v as any)}>
						<SelectTrigger className="w-32 h-9 bg-background shadow-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{timeOptions.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{t(`sys.analysis.${opt.value}`)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="flex flex-col xl:grid grid-cols-4 gap-6">
				{/* Inventory Health Chart */}
				<ChartWrapper className="col-span-4 xl:col-span-3" title={t("sys.analysis.inventoryHealth")}>
					<div className="flex flex-wrap gap-8 items-center mb-6">
						<div>
							<Text variant="body2" className="text-muted-foreground font-medium mb-1">
								{t("sys.analysis.assetUtilization")}
							</Text>
							<div className="flex items-end gap-3">
								<Title as="h3" className="text-3xl font-bold">
									{inventoryHealth.utilization}%
								</Title>
								<TrendIndicator value={inventoryHealth.utilizationChange} className="mb-1" />
							</div>
						</div>
						<div>
							<Text variant="body2" className="text-muted-foreground font-medium mb-1">
								{t("sys.analysis.complianceRate")}
							</Text>
							<div className="flex items-end gap-3">
								<Title as="h3" className="text-3xl font-bold">
									{inventoryHealth.compliance}%
								</Title>
								<TrendIndicator value={inventoryHealth.complianceChange} className="mb-1" />
							</div>
						</div>
					</div>
					<div className="w-full min-h-[350px]">
						<Chart
							type="area"
							height={350}
							options={chartOptions}
							series={inventoryHealth.chart.series.map((s) => ({
								...s,
								name: t(`sys.analysis.${s.name === "Active Assets" ? "activeAssets" : "maintenance"}`),
							}))}
						/>
					</div>
				</ChartWrapper>

				{/* Side Stats Cards */}
				<div className="xl:col-span-1 flex flex-col gap-6 h-full">
					<StatCard
						title={t("sys.analysis.procurementSpend")}
						value={`$${procurement.value.toLocaleString()}`}
						icon="solar:bag-check-bold-duotone"
						color="#f59e42"
						percent={procurement.change}
						className="flex-1"
					/>
					<StatCard
						title={t("sys.analysis.depreciation")}
						value={`$${depreciation.value.toLocaleString()}`}
						icon="solar:graph-down-bold-duotone"
						color="#ef4444"
						percent={depreciation.change}
						className="flex-1"
					/>
					<StatCard
						title={t("sys.analysis.warrantyClaims")}
						value={warranty.value.toLocaleString()}
						icon="solar:shield-warning-bold-duotone"
						color="#8b5cf6"
						percent={warranty.change}
						className="flex-1"
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 gap-6">
				{/* Top Requested Assets */}
				<ChartWrapper
					className="col-span-12 md:col-span-6 xl:col-span-4"
					title={t("sys.analysis.topRequestedAssets")}
					action={
						<Button size="sm" variant="outline" className="h-8">
							<Icon icon="mdi:download" className="mr-2" size={16} />
							{t("sys.analysis.export")}
						</Button>
					}
					contentClassName="p-0"
				>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="text-left py-3 px-4 font-medium text-muted-foreground">
										{t("sys.analysis.assetName")}
									</th>
									<th className="text-right py-3 px-4 font-medium text-muted-foreground">
										{t("sys.analysis.requests")}
									</th>
									<th className="text-right py-3 px-4 font-medium text-muted-foreground">{t("sys.analysis.stock")}</th>
								</tr>
							</thead>
							<tbody>
								{topRequestedAssets.map((row) => (
									<tr key={row.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
										<td className="py-3 px-4 font-medium text-primary">{row.name}</td>
										<td className="py-3 px-4 text-right">
											<div className="flex flex-col items-end">
												<span className="font-bold">{row.requests.toLocaleString()}</span>
												<TrendIndicator value={row.change} className="text-xs" />
											</div>
										</td>
										<td className="py-3 px-4 text-right">
											<div className="flex flex-col items-end">
												<span className="font-bold">{row.stock.toLocaleString()}</span>
												<TrendIndicator value={row.stockChange} className="text-xs" />
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</ChartWrapper>

				{/* Asset Categories */}
				<ChartWrapper className="col-span-12 md:col-span-6 xl:col-span-4" title={t("sys.analysis.assetCategories")}>
					<div className="flex flex-col items-center justify-center py-6">
						<div className="w-full max-w-[240px] relative">
							<Chart
								type="donut"
								height={240}
								options={deviceChartOptions}
								series={assetCategories.map((d) => d.value)}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4 mt-8 w-full px-2">
							{assetCategories.map((d) => (
								<div
									key={d.label}
									className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-md bg-background shadow-sm">
											<Icon icon={d.icon} size={18} color={d.color} />
										</div>
										<Text variant="body2" className="font-medium">
											{t(`sys.analysis.${d.label.toLowerCase()}`)}
										</Text>
									</div>
									<Text variant="subTitle2" className="font-bold">
										{d.value}%
									</Text>
								</div>
							))}
						</div>
					</div>
				</ChartWrapper>

				{/* Departmental Usage */}
				<ChartWrapper
					className="col-span-12 xl:col-span-4"
					title={t("sys.analysis.departmentalUsage")}
					action={
						<Button size="sm" variant="outline" className="h-8">
							<Icon icon="mdi:download" className="mr-2" size={16} />
							{t("sys.analysis.export")}
						</Button>
					}
					contentClassName="p-0"
				>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="text-left p-4 font-medium text-muted-foreground">{t("sys.analysis.department")}</th>
									<th className="text-right p-4 font-medium text-muted-foreground">{t("sys.analysis.activeAssets")}</th>
									<th className="text-right p-4 font-medium text-muted-foreground">{t("sys.analysis.value")}</th>
									<th className="text-right p-4 font-medium text-muted-foreground">{t("sys.analysis.utilization")}</th>
								</tr>
							</thead>
							<tbody>
								{departmentUsage.map((row) => (
									<tr key={row.dept} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
										<td className="p-4 font-bold text-primary">{t(`sys.analysis.${row.dept.toLowerCase()}`)}</td>
										<td className="p-4 text-right font-mono">{row.assets.toLocaleString()}</td>
										<td className="p-4 text-right font-mono">${(row.value / 1000).toFixed(0)}k</td>
										<td className="p-4">
											<div className="flex items-center gap-3 justify-end">
												<Progress value={row.utilization} className="h-2 w-16" />
												<span className="text-xs font-bold w-8 text-right">{row.utilization}%</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</ChartWrapper>
			</div>
		</div>
	);
}
