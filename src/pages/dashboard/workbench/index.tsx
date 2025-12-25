import { Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/api/apiClient";
import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Text, Title } from "@/ui/typography";
import { ChartWrapper } from "../components/chart-wrapper";
import { StatCard } from "../components/stat-card";
import BannerCard from "./banner-card";

interface WorkbenchData {
	quickStats: {
		label: string;
		value: string;
		icon: string;
		color: string;
		percent: number;
		chart: number[];
	}[];
	assetValue: {
		percent: number;
		series: { name: string; data: number[] }[];
		categories: string[];
	};
	auditProgress: {
		label: string;
		color: string;
	}[];
	assetOverview: {
		total: number;
		assigned: number;
		inStock: number;
		disposed: number;
	};
	projectUsers: {
		name: string;
		avatar: string;
	}[];
	recentActivity: {
		name: string;
		action: string;
		user: string;
		time: string;
		icon: string;
		status: string;
	}[];
	assetDistribution: {
		series: number[];
		labels: string[];
		details: { label: string; value: number }[];
	};
}

export default function Workbench() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState("All Activity");
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<WorkbenchData | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await apiClient.get<WorkbenchData>({ url: "/dashboard/workbench" });
				setData(res);
			} catch (error) {
				console.error("Failed to fetch workbench data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const chartOptions = useChart({
		xaxis: { categories: data?.assetValue.categories || [] },
		chart: { toolbar: { show: false } },
		grid: { show: false },
		stroke: { curve: "smooth", width: 3 },
		dataLabels: { enabled: false },
		yaxis: { show: false },
		legend: { show: false },
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

	const donutOptions = useChart({
		labels: data?.assetDistribution.labels.map((label) => t(`sys.dashboard.${label.toLowerCase()}`)) || [],
		legend: { show: false },
		dataLabels: { enabled: false },
		plotOptions: { pie: { donut: { size: "75%" } } },
		stroke: { show: false },
	});

	const getLabel = (label: string) => {
		const map: Record<string, string> = {
			"Total Assets": "totalAssets",
			"Active Licenses": "activeLicenses",
			"Pending Requests": "pendingRequests",
			"Maintenance Due": "maintenanceDue",
			"Q4 Hardware Audit": "q4HardwareAudit",
			"Software Compliance": "softwareCompliance",
			"Security Review": "securityReview",
		};
		return t(`sys.dashboard.${map[label] || label}`);
	};

	const sparklineOptions = useChart({
		chart: { sparkline: { enabled: true } },
		colors: ["#3b82f6"],
		stroke: { curve: "smooth", width: 2 },
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.05,
				stops: [0, 100],
			},
		},
		grid: { show: false },
		yaxis: { show: false },
		tooltip: { enabled: true },
	});

	if (loading || !data) {
		return (
			<div className="p-4">
				<Skeleton active />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 w-full p-2">
			<BannerCard />
			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{data.quickStats.map((stat) => (
					<StatCard
						key={stat.label}
						title={getLabel(stat.label)}
						value={stat.value}
						icon={stat.icon}
						color={stat.color}
						percent={stat.percent}
						chartData={stat.chart}
					/>
				))}
			</div>

			{/* Asset Value + Audit Progress */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<ChartWrapper
					className="lg:col-span-2"
					title={t("sys.dashboard.assetValueTrend")}
					action={
						<span className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded-full">
							<Icon icon="mdi:arrow-up" size={16} />
							{data.assetValue.percent}%
						</span>
					}
				>
					<Chart type="area" height={300} options={chartOptions} series={data.assetValue.series} />
				</ChartWrapper>

				<Card className="flex flex-col gap-6 p-6 shadow-sm bg-card/50 backdrop-blur-sm border-border">
					<div>
						<Text variant="body2" className="font-semibold text-muted-foreground mb-1">
							{t("sys.dashboard.complianceAudit")}
						</Text>
						<Title as="h3" className="text-xl font-bold">
							{t("sys.dashboard.auditStatus")}
						</Title>
					</div>

					<div className="flex items-center justify-between">
						<Text variant="body2" className="font-medium">
							{t("sys.dashboard.overallProgress")}
						</Text>
						<span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">70%</span>
					</div>
					<Progress value={70} className="h-2" />
					<ul className="flex flex-col gap-3 mt-2">
						{data.auditProgress.map((task) => (
							<li key={task.label} className="flex items-center gap-3">
								<span
									className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-opacity-20"
									style={{ background: task.color, "--tw-ring-color": task.color } as any}
								/>
								<Text variant="body2" className="font-medium">
									{getLabel(task.label)}
								</Text>
							</li>
						))}
					</ul>
					<Button className="w-full mt-auto shadow-lg shadow-primary/20" size="lg">
						<Icon icon="solar:clipboard-check-bold-duotone" size={20} className="mr-2" />{" "}
						{t("sys.dashboard.startAudit")}
					</Button>
				</Card>
			</div>

			{/* Asset Overview */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<ChartWrapper className="lg:col-span-2" title={t("sys.dashboard.assetOverview")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
							<div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
								<Icon icon="solar:laptop-minimalistic-bold-duotone" size={64} className="text-primary" />
							</div>
							<div>
								<Text variant="body2" className="text-muted-foreground font-medium mb-2">
									{t("sys.dashboard.totalAssets")}
								</Text>
								<Title as="h3" className="text-3xl font-bold text-foreground">
									{data.assetOverview.total.toLocaleString()}
								</Title>
							</div>
							<div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
								<Icon icon="solar:graph-up-bold" size={16} className="mr-1" />
								<span>+12.5% {t("sys.dashboard.fromLastMonth")}</span>
							</div>
						</div>
						<div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
							<div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
								<Icon icon="solar:box-bold-duotone" size={64} className="text-orange-500" />
							</div>
							<div>
								<Text variant="body2" className="text-muted-foreground font-medium mb-2">
									{t("sys.dashboard.inStock")}
								</Text>
								<Title as="h3" className="text-3xl font-bold text-foreground">
									{data.assetOverview.inStock.toLocaleString()}
								</Title>
							</div>
							<div className="mt-4 flex items-center text-sm text-orange-500 font-medium">
								<Icon icon="solar:pie-chart-2-bold" size={16} className="mr-1" />
								<span>{t("sys.dashboard.lowStockAlert")}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center justify-between mb-4">
						<Title as="h4" className="text-base font-bold">
							{t("sys.dashboard.assetGrowth")}
						</Title>
						<Button size="sm" variant="outline" className="h-8">
							<Icon icon="solar:calendar-bold-duotone" size={16} className="mr-2" />
							{t("sys.dashboard.last7Days")}
						</Button>
					</div>
					<div className="w-full h-[120px]">
						<Chart
							type="area"
							height={120}
							options={sparklineOptions}
							series={[{ name: "New Assets", data: [10, 20, 15, 30, 25, 40, 35, 50] }]}
						/>
					</div>
				</ChartWrapper>

				<Card className="flex flex-col p-0 shadow-sm bg-card/50 backdrop-blur-sm border-border overflow-hidden">
					<div className="p-6 pb-4 border-b border-border flex items-center justify-between">
						<div>
							<Title as="h3" className="text-lg font-bold">
								{t("sys.dashboard.itTeam")}
							</Title>
							<Text variant="body2" className="text-muted-foreground">
								4 {t("sys.dashboard.activeMembers")}
							</Text>
						</div>
						<Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary">
							<Icon icon="solar:menu-dots-bold" size={20} />
						</Button>
					</div>
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{data.projectUsers.map((user, index) => (
							<div
								key={user.name}
								className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
							>
								<div className="relative">
									<Avatar className="w-10 h-10 border-2 border-background">
										<AvatarImage src={user.avatar} />
										<AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
									</Avatar>
									<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-sm truncate">{user.name}</div>
									<div className="text-xs text-muted-foreground truncate">
										{["IT Manager", "System Admin", "Help Desk", "Network Engineer"][index] || "Support Staff"}
									</div>
								</div>
								<Button
									size="icon"
									variant="ghost"
									className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
								>
									<Icon icon="solar:chat-round-dots-bold-duotone" size={18} />
								</Button>
							</div>
						))}
					</div>
					<div className="p-4 border-t border-border bg-muted/20">
						<Button className="w-full shadow-sm" variant="outline">
							<Icon icon="solar:users-group-rounded-bold-duotone" size={18} className="mr-2" />
							{t("sys.dashboard.viewAllMembers")}
						</Button>
					</div>
				</Card>
			</div>

			{/* Recent Activity + Asset Distribution */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<ChartWrapper className="lg:col-span-2" title={t("sys.dashboard.recentActivity")} contentClassName="p-0">
					<div className="px-6 pb-4">
						<div className="flex gap-2 overflow-x-auto pb-2">
							{["All Activity", "Check-in", "Check-out", "Maintenance"].map((tab) => (
								<Button
									key={tab}
									size="sm"
									variant={activeTab === tab ? "default" : "ghost"}
									onClick={() => setActiveTab(tab)}
									className="rounded-full"
								>
									{t(
										`sys.dashboard.${
											{
												"All Activity": "allActivity",
												"Check-in": "checkIn",
												"Check-out": "checkOut",
												Maintenance: "maintenance",
											}[tab]
										}`,
									)}
								</Button>
							))}
						</div>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="text-left py-3 px-6 font-medium text-muted-foreground">{t("sys.dashboard.asset")}</th>
									<th className="text-left py-3 px-6 font-medium text-muted-foreground">{t("sys.dashboard.user")}</th>
									<th className="text-right py-3 px-6 font-medium text-muted-foreground">
										{t("sys.dashboard.action")}
									</th>
									<th className="text-right py-3 px-6 font-medium text-muted-foreground">
										{t("sys.dashboard.status")}
									</th>
								</tr>
							</thead>
							<tbody>
								{data.recentActivity.map((tx) => (
									<tr key={tx.name} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
										<td className="py-4 px-6">
											<div className="flex items-center gap-3">
												<div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground">
													<Icon icon={tx.icon} size={20} />
												</div>
												<div>
													<div className="font-semibold">{tx.name}</div>
													<div className="text-xs text-muted-foreground">{tx.time}</div>
												</div>
											</div>
										</td>
										<td className="py-4 px-6 text-muted-foreground">{tx.user}</td>
										<td className="py-4 px-6 text-right font-bold">{tx.action}</td>
										<td className="py-4 px-6 text-right">
											<span
												className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
													tx.status === "success"
														? "bg-emerald-100 text-emerald-700"
														: tx.status === "warning"
															? "bg-orange-100 text-orange-700"
															: "bg-rose-100 text-rose-700"
												}`}
											>
												{tx.status === "success" ? (
													<Icon icon="mdi:check-circle" size={14} />
												) : tx.status === "warning" ? (
													<Icon icon="mdi:alert-circle" size={14} />
												) : (
													<Icon icon="mdi:close-circle" size={14} />
												)}
												{tx.status === "success"
													? t("sys.dashboard.completed")
													: tx.status === "warning"
														? t("sys.dashboard.pending")
														: t("sys.dashboard.failed")}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="p-4 border-t flex items-center justify-between gap-4">
						<Button variant="outline" className="flex-1">
							{t("sys.dashboard.viewAll")}
						</Button>
						<Button className="flex-1">{t("sys.dashboard.newRequest")}</Button>
					</div>
				</ChartWrapper>

				<ChartWrapper title={t("sys.dashboard.assetDistribution")}>
					<div className="flex-1 flex flex-col items-center justify-center py-4">
						<Chart type="donut" height={240} options={donutOptions} series={data.assetDistribution.series} />
						<div className="w-full mt-8 space-y-3">
							{data.assetDistribution.details.map((item, i) => (
								<div
									key={item.label}
									className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<span
											className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-card"
											style={
												{
													background: ["#3b82f6", "#f59e42", "#10b981", "#6366f1"][i],
													"--tw-ring-color": ["#3b82f6", "#f59e42", "#10b981", "#6366f1"][i],
												} as any
											}
										/>
										<Text variant="body2" className="font-medium">
											{t(`sys.dashboard.${item.label.toLowerCase()}`)}
										</Text>
									</div>
									<span className="font-bold font-mono">{item.value.toLocaleString()}</span>
								</div>
							))}
						</div>
					</div>
				</ChartWrapper>
			</div>
		</div>
	);
}
