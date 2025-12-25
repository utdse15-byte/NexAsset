import { theme } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/api/apiClient";
import { Chart, useChart } from "@/components/chart";
import { Icon } from "@/components/icon";
import { Progress } from "@/ui/progress";
import { Title } from "@/ui/typography";
import { ChartWrapper } from "../components/chart-wrapper";
import { StatCard } from "../components/stat-card";

interface AssetStatistics {
	statusDistribution: { label: string; value: number }[];
	categoryDistribution: { label: string; value: number }[];
	ageDistribution: { label: string; value: number }[];
	stockAlerts: { category: string; remaining: number; threshold: number; status: "critical" | "warning" }[];
	mostRepaired: { model: string; count: number; rate: number }[];
}

export default function AssetAnalysisPage() {
	const { t } = useTranslation();
	const {
		token: { colorError, colorWarning },
	} = theme.useToken();
	const [stats, setStats] = useState<AssetStatistics>({
		statusDistribution: [],
		categoryDistribution: [],
		ageDistribution: [],
		stockAlerts: [],
		mostRepaired: [],
	});

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await apiClient.get<AssetStatistics>({ url: "/assets/statistics" });
				setStats(res);
			} catch (error) {
				console.error("Failed to fetch asset statistics:", error);
			}
		};
		fetchStats();
	}, []);

	// 1. Lifecycle Chart (Funnel-like representation using Bar)
	const lifecycleChartOptions = useChart({
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "50%",
				borderRadius: 4,
			},
		},
		xaxis: {
			categories: stats.statusDistribution.map((item) => item.label),
		},
		colors: ["#00A76F"],
		tooltip: {
			y: {
				formatter: (val: number) => val.toString(),
			},
		},
	});

	// 2. Age Distribution Chart
	const ageChartOptions = useChart({
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total",
							formatter: () => stats.ageDistribution.reduce((acc, item) => acc + item.value, 0).toString(),
						},
					},
				},
			},
		},
		labels: stats.ageDistribution.map((item) => item.label),
		colors: [
			theme.useToken().token.colorPrimary,
			theme.useToken().token.colorWarning,
			theme.useToken().token.colorError,
			theme.useToken().token.colorInfo,
			"#637381",
		],
		tooltip: {
			y: {
				formatter: (val: number) => `${val} items`,
			},
		},
	});

	return (
		<div className="flex flex-col gap-6 p-2">
			<div>
				<Title as="h2" className="text-3xl font-bold tracking-tight">
					{t("sys.analysis.asset.title")}
				</Title>
			</div>

			<div className="grid grid-cols-12 gap-6">
				{/* Top Row: Lifecycle & Stock Alerts */}
				<ChartWrapper title={t("sys.analysis.asset.lifecycle")} className="col-span-12 lg:col-span-8">
					<Chart
						type="bar"
						series={[
							{
								name: "Count",
								data: stats.statusDistribution.map((item) => item.value),
							},
						]}
						options={lifecycleChartOptions}
						height={350}
					/>
				</ChartWrapper>

				<ChartWrapper title={t("sys.analysis.asset.stockAlerts")} className="col-span-12 lg:col-span-4">
					<div className="flex flex-col gap-4">
						{stats.stockAlerts.length === 0 ? (
							<div className="text-center text-muted-foreground py-8">No stock alerts</div>
						) : (
							stats.stockAlerts.map((item) => (
								<div
									key={item.category}
									className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div
											className="flex h-10 w-10 items-center justify-center rounded-full"
											style={{
												background: item.status === "critical" ? `${colorError}20` : `${colorWarning}20`,
												color: item.status === "critical" ? colorError : colorWarning,
											}}
										>
											<Icon
												icon={
													item.status === "critical" ? "solar:danger-triangle-bold-duotone" : "solar:bell-bold-duotone"
												}
												size={24}
											/>
										</div>
										<div>
											<div className="font-semibold">{item.category}</div>
											<div className="flex gap-2 text-xs text-muted-foreground">
												<span>
													{t("sys.analysis.asset.remaining")}: {item.remaining}
												</span>
												<span>
													({t("sys.analysis.asset.threshold")}: {item.threshold})
												</span>
											</div>
										</div>
									</div>
									<div
										className={`text-xs font-bold px-2 py-1 rounded ${
											item.status === "critical" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
										}`}
									>
										{item.status.toUpperCase()}
									</div>
								</div>
							))
						)}
					</div>
				</ChartWrapper>

				{/* Bottom Row: Age Distribution & Maintenance */}
				<ChartWrapper
					title={t("sys.analysis.asset.ageDistribution")}
					className="col-span-12 md:col-span-6 lg:col-span-4"
				>
					<Chart
						type="donut"
						series={stats.ageDistribution.map((item) => item.value)}
						options={ageChartOptions}
						height={350}
					/>
				</ChartWrapper>

				<div className="col-span-12 md:col-span-6 lg:col-span-8 flex flex-col gap-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<StatCard
							title={t("sys.analysis.asset.repairRate")}
							value="12%"
							icon="solar:settings-bold-duotone"
							color={colorError}
						/>
						<StatCard
							title={t("sys.analysis.asset.avgRepairTime")}
							value="3.5 Days"
							icon="solar:clock-circle-bold-duotone"
							color={colorWarning}
						/>
					</div>

					<ChartWrapper title={t("sys.analysis.asset.mostRepaired")}>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{stats.mostRepaired.map((item) => (
								<div key={item.model} className="p-4 border rounded-lg text-center bg-card/30">
									<div className="font-bold mb-2">{item.model}</div>
									<div className="text-muted-foreground text-xs mb-2">Count: {item.count}</div>
									<div className="flex items-center gap-2">
										<Progress value={item.rate} className="h-2 flex-1" />
										<span className="text-xs font-bold">{item.rate}%</span>
									</div>
								</div>
							))}
						</div>
					</ChartWrapper>
				</div>
			</div>
		</div>
	);
}
