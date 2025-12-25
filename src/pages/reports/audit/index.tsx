import { Badge, DatePicker, Descriptions, Input, Modal, Space, Table, Tag } from "antd";
import { BrainCircuit, Download, Filter, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/api/apiClient";
import { Chart, useChart } from "@/components/chart";
import { ChartWrapper } from "@/pages/dashboard/components/chart-wrapper";
import { StatCard } from "@/pages/dashboard/components/stat-card";
import { Button } from "@/ui/button";
import { Text, Title } from "@/ui/typography";

const { RangePicker } = DatePicker;

interface AuditLog {
	id: string;
	timestamp: string;
	actor: {
		name: string;
		email: string;
		avatar: string;
		ip: string;
		location: string;
	};
	action: string;
	target: string;
	status: string;
	risk_score: number;
	details: any;
	user_agent: string;
}

interface AuditStats {
	total_events: number;
	critical_risks: number;
	active_users: number;
	compliance_rate: number;
}

export default function AuditLogsPage() {
	const { t } = useTranslation();
	const [searchText, setSearchText] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<null | string>(null);
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [stats, setStats] = useState<AuditStats>({
		total_events: 0,
		critical_risks: 0,
		active_users: 0,
		compliance_rate: 100,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [logsRes, statsRes] = await Promise.all([
					apiClient.get<AuditLog[]>({ url: "/audit/logs" }),
					apiClient.get<AuditStats>({ url: "/audit/stats" }),
				]);
				setLogs(logsRes);
				setStats(statsRes);
			} catch (error) {
				console.error("Failed to fetch audit data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Filter logs based on search
	const filteredLogs: AuditLog[] = logs.filter(
		(log) =>
			log.actor.name.toLowerCase().includes(searchText.toLowerCase()) ||
			log.target.toLowerCase().includes(searchText.toLowerCase()) ||
			log.action.toLowerCase().includes(searchText.toLowerCase()),
	);

	const handleAnalyze = () => {
		setIsAnalyzing(true);
		setTimeout(() => {
			setIsAnalyzing(false);
			setAnalysisResult(
				"AI Analysis Complete: No critical security breaches detected in the last 24 hours. However, an unusual spike in 'Export Data' actions was observed from User 'Jane Doe' at 03:00 AM. Recommended action: Review access logs for that timeframe.",
			);
		}, 2000);
	};

	const columns = [
		{
			title: t("sys.reports.audit.table.timestamp"),
			dataIndex: "timestamp",
			key: "timestamp",
			render: (text: string) => new Date(text).toLocaleString(),
		},
		{
			title: t("sys.reports.audit.table.actor"),
			dataIndex: ["actor", "name"],
			key: "actor",
			render: (text: string, record: AuditLog) => (
				<Space>
					<img src={record.actor.avatar} alt={text} className="w-6 h-6 rounded-full" />
					<Text variant="body2">{text}</Text>
				</Space>
			),
		},
		{
			title: t("sys.reports.audit.table.action"),
			dataIndex: "action",
			key: "action",
			render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
		},
		{
			title: t("sys.reports.audit.table.target"),
			dataIndex: "target",
			key: "target",
		},
		{
			title: t("sys.reports.audit.table.riskScore"),
			dataIndex: "risk_score",
			key: "risk_score",
			render: (score: number) => {
				let color = "green";
				if (score > 70) color = "red";
				else if (score > 40) color = "orange";
				return <Badge count={score} color={color} showZero />;
			},
		},
		{
			title: t("sys.reports.audit.table.status"),
			dataIndex: "status",
			key: "status",
			render: (status: string) => {
				const color = status === "success" ? "success" : status === "failure" ? "error" : "warning";
				return <Tag color={color}>{status.toUpperCase()}</Tag>;
			},
		},
	];

	// Chart Data - Generate from real audit logs
	const last7Days = Array.from({ length: 7 }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - i));
		return date.toLocaleDateString("en-US", { weekday: "short" });
	});

	// Count events per day for the last 7 days
	const eventsPerDay = last7Days.map((_, index) => {
		const targetDate = new Date();
		targetDate.setDate(targetDate.getDate() - (6 - index));
		targetDate.setHours(0, 0, 0, 0);

		const nextDate = new Date(targetDate);
		nextDate.setDate(nextDate.getDate() + 1);

		const count = logs.filter((log) => {
			const logDate = new Date(log.timestamp);
			return logDate >= targetDate && logDate < nextDate;
		}).length;

		return count;
	});

	const chartOptions = useChart({
		xaxis: { categories: last7Days },
		chart: { toolbar: { show: false } },
		stroke: { curve: "smooth" },
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.3,
			},
		},
		colors: ["#00AB55"],
	});

	const chartSeries = [
		{
			name: "Events",
			data: eventsPerDay,
		},
	];

	// Count events by category
	const securityActions = logs.filter(
		(log) =>
			log.action.toLowerCase().includes("login") || log.action.toLowerCase().includes("delete") || log.risk_score > 70,
	).length;

	const systemActions = logs.filter(
		(log) => log.action.toLowerCase().includes("system") || log.action.toLowerCase().includes("config"),
	).length;

	const dataActions = logs.filter(
		(log) =>
			log.action.toLowerCase().includes("view") ||
			log.action.toLowerCase().includes("export") ||
			log.action.toLowerCase().includes("update") ||
			log.action.toLowerCase().includes("create"),
	).length;

	const donutOptions = useChart({
		labels: ["Security", "System", "Data"],
		colors: ["#FF4842", "#1890FF", "#FFC107"],
		legend: { position: "bottom" },
		plotOptions: { pie: { donut: { size: "70%" } } },
	});

	const donutSeries = [securityActions, systemActions, dataActions];

	return (
		<div className="flex flex-col gap-6 p-2">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<Title as="h2" className="text-3xl font-bold tracking-tight">
						{t("sys.reports.audit.title")}
					</Title>
					<Text variant="body2" className="text-muted-foreground mt-1">
						{t("sys.reports.audit.description")}
					</Text>
				</div>
				<Space>
					<Button variant="outline" className="gap-2">
						<Download size={16} />
						{t("sys.reports.audit.actions.export")}
					</Button>
					<Button
						onClick={handleAnalyze}
						disabled={isAnalyzing}
						className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 border-none hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20"
					>
						<BrainCircuit size={16} className={isAnalyzing ? "animate-pulse" : ""} />
						{isAnalyzing ? "Analyzing..." : t("sys.reports.audit.actions.analyze")}
					</Button>
				</Space>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
				<StatCard
					title={t("sys.reports.audit.stats.totalEvents")}
					value={stats.total_events}
					icon="solar:graph-new-bold-duotone"
					color="#00AB55"
					chartData={[20, 40, 30, 50, 40, 60, 50]}
				/>
				<StatCard
					title={t("sys.reports.audit.stats.complianceRate")}
					value={`${stats.compliance_rate}%`}
					icon="solar:check-circle-bold-duotone"
					color="#1890FF"
					percent={2.5}
					chartData={[98, 99, 97, 98, 99, 100, 99]}
				/>
				<StatCard
					title={t("sys.reports.audit.stats.criticalRisks")}
					value={stats.critical_risks}
					icon="solar:shield-warning-bold-duotone"
					color="#FF4842"
					percent={-5.2}
					chartData={[5, 2, 8, 4, 3, 1, 2]}
				/>
				<StatCard
					title={t("sys.reports.audit.stats.activeUsers")}
					value={stats.active_users}
					icon="solar:users-group-two-rounded-bold-duotone"
					color="#7635dc"
					chartData={[10, 15, 12, 20, 18, 25, 22]}
				/>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-12 gap-6">
				<ChartWrapper title={t("sys.reports.audit.charts.activityTrend")} className="col-span-12 md:col-span-8">
					<Chart options={chartOptions} series={chartSeries} type="area" height={350} />
				</ChartWrapper>
				<ChartWrapper title={t("sys.reports.audit.charts.eventTypeDistribution")} className="col-span-12 md:col-span-4">
					<div className="flex items-center justify-center h-[350px]">
						<Chart options={donutOptions} series={donutSeries} type="donut" height={280} />
					</div>
				</ChartWrapper>
			</div>

			{/* Filters & Table */}
			<ChartWrapper title="Audit Logs" contentClassName="p-0">
				<div className="p-4 border-b border-border/50 flex flex-wrap gap-4 justify-between items-center bg-muted/20">
					<Input
						prefix={<Search size={16} className="text-muted-foreground" />}
						placeholder={t("sys.reports.audit.filters.searchPlaceholder")}
						className="w-full md:w-64"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
					<Space>
						<RangePicker className="w-full sm:w-auto" />
						<Button variant="outline" className="gap-2">
							<Filter size={16} />
							{t("sys.reports.audit.filters.status")}
						</Button>
					</Space>
				</div>

				<Table
					columns={columns}
					dataSource={filteredLogs}
					rowKey="id"
					loading={loading}
					pagination={{ pageSize: 10 }}
					expandable={{
						expandedRowRender: (record: AuditLog) => (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="p-4 bg-muted/30 rounded-md m-2"
							>
								<Descriptions title="Audit Details" size="small" column={2}>
									<Descriptions.Item label="IP Address">{record.actor.ip}</Descriptions.Item>
									<Descriptions.Item label="Location">{record.actor.location}</Descriptions.Item>
									<Descriptions.Item label="User Agent">{record.user_agent}</Descriptions.Item>
									<Descriptions.Item label="Risk Score">{record.risk_score}</Descriptions.Item>
								</Descriptions>
								<div className="mt-4">
									<Text variant="subTitle2" className="mb-2">
										Change Details:
									</Text>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border border-border/50">
										{Object.entries(record.details || {}).map(([key, value]) => (
											<div key={key} className="flex flex-col">
												<span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
													{key.replace(/_/g, " ")}
												</span>
												<span className="text-sm font-mono text-foreground">
													{typeof value === "object" ? JSON.stringify(value) : String(value)}
												</span>
											</div>
										))}
									</div>
								</div>
							</motion.div>
						),
						rowExpandable: (record) => !!record.details,
					}}
					className="overflow-hidden"
				/>
			</ChartWrapper>

			{/* Analysis Modal */}
			<Modal
				title={
					<Space>
						<BrainCircuit className="text-purple-500" />
						<span>AI Security Analysis</span>
					</Space>
				}
				open={!!analysisResult}
				onCancel={() => setAnalysisResult(null)}
				footer={[
					<Button key="close" onClick={() => setAnalysisResult(null)}>
						Close
					</Button>,
				]}
			>
				<div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
					<Text>{analysisResult}</Text>
				</div>
			</Modal>
		</div>
	);
}
