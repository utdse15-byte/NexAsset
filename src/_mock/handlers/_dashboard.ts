import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import { auditManager } from "@/_mock/utils";
import { AssetStatus } from "@/types/entity";
import { ResultStatus } from "@/types/enum";
import { assetManager, purchaseManager } from "./_assets";

const generateDashboardData = (timeType: "day" | "week" | "month") => {
	// Get real data from managers
	const assets = assetManager.get() || [];
	const purchases = purchaseManager.get() || [];

	// Calculate real asset statistics
	const totalAssets = assets.length;
	const inUseAssets = assets.filter((a) => a.status === AssetStatus.InUse).length;
	const maintenanceAssets = assets.filter((a) => a.status === AssetStatus.Maintenance).length;

	// Calculate utilization and compliance
	const utilization = totalAssets > 0 ? Math.round((inUseAssets / totalAssets) * 100) : 0;
	const compliance =
		totalAssets > 0 ? Math.round((assets.filter((a) => a.purchaseDate).length / totalAssets) * 100) : 0;

	// Calculate real asset categories distribution
	const categoryCount: Record<string, number> = {};
	assets.forEach((asset) => {
		if (asset.category) {
			categoryCount[asset.category] = (categoryCount[asset.category] || 0) + 1;
		}
	});

	const totalCategorized = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
	const assetCategories = Object.entries(categoryCount)
		.map(([category, count]) => {
			const percentage = totalCategorized > 0 ? Math.round((count / totalCategorized) * 100) : 0;
			// Map categories to icons and colors
			const iconMap: Record<string, { icon: string; color: string }> = {
				Laptop: { icon: "solar:laptop-bold-duotone", color: "#00A76F" },
				Desktop: { icon: "solar:monitor-bold-duotone", color: "#FFAB00" },
				Server: { icon: "solar:server-bold-duotone", color: "#8E33FF" },
				Monitor: { icon: "solar:monitor-bold-duotone", color: "#FFAB00" },
				Printer: { icon: "solar:printer-bold-duotone", color: "#637381" },
				Mobile: { icon: "solar:smartphone-bold-duotone", color: "#FF5630" },
				Tablet: { icon: "solar:tablet-bold-duotone", color: "#00B8D9" },
				Projector: { icon: "solar:projector-bold-duotone", color: "#8E33FF" },
				"Network Gear": { icon: "solar:router-bold-duotone", color: "#637381" },
				Peripherals: { icon: "solar:mouse-bold-duotone", color: "#00B8D9" },
			};
			const config = iconMap[category] || { icon: "solar:box-bold-duotone", color: "#637381" };
			return {
				label: category,
				value: percentage,
				...config,
			};
		})
		.sort((a, b) => b.value - a.value)
		.slice(0, 5); // Top 5 categories

	// Calculate real procurement spend
	const procurementValue = purchases
		.filter((p) => p.status === "approved" || p.status === "ordered" || p.status === "received")
		.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

	// Calculate depreciation (based on asset age and value)
	const depreciationValue = assets.reduce((sum, asset) => {
		const age = asset.purchaseDate
			? (Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
			: 0;
		const annualDepreciation = (asset.price || 0) * 0.2; // 20% per year
		return sum + Math.min(annualDepreciation * age, asset.price || 0);
	}, 0);

	// Calculate warranty claims (count assets in maintenance)
	const warrantyValue = maintenanceAssets;

	// Generate chart data for Active Assets and Maintenance over time
	const chartCategories = Array.from({ length: 12 }, (_, i) => {
		const d = new Date();
		if (timeType === "day") d.setHours(d.getHours() - (11 - i) * 2);
		else if (timeType === "week") d.setDate(d.getDate() - (11 - i));
		else d.setMonth(d.getMonth() - (11 - i));

		return timeType === "day"
			? `${d.getHours()}:00`
			: timeType === "week"
				? d.toLocaleDateString("en-US", { weekday: "short" })
				: d.toLocaleDateString("en-US", { month: "short" });
	});

	// Calculate professional-looking trends based on current values
	const utilizationTrend =
		utilization > 80
			? faker.number.float({ min: 1, max: 5, multipleOf: 0.1 })
			: utilization < 60
				? faker.number.float({ min: -3, max: 1, multipleOf: 0.1 })
				: faker.number.float({ min: -2, max: 3, multipleOf: 0.1 });

	const complianceTrend =
		compliance > 90
			? faker.number.float({ min: 0, max: 2, multipleOf: 0.1 })
			: compliance < 80
				? faker.number.float({ min: 2, max: 5, multipleOf: 0.1 })
				: faker.number.float({ min: 0, max: 3, multipleOf: 0.1 });

	const procurementTrend =
		procurementValue > 50000
			? faker.number.float({ min: 10, max: 25, multipleOf: 0.1 })
			: procurementValue > 20000
				? faker.number.float({ min: 5, max: 15, multipleOf: 0.1 })
				: faker.number.float({ min: -5, max: 10, multipleOf: 0.1 });

	const depreciationTrend = faker.number.float({ min: 3, max: 8, multipleOf: 0.1 }); // Depreciation usually increases
	const warrantyTrend =
		warrantyValue > 5
			? faker.number.float({ min: -15, max: 5, multipleOf: 0.1 })
			: faker.number.float({ min: -5, max: 10, multipleOf: 0.1 });

	// Generate departmental usage from real asset data
	const deptAssets: Record<string, { assets: number; value: number }> = {
		Engineering: { assets: 0, value: 0 },
		Design: { assets: 0, value: 0 },
		Marketing: { assets: 0, value: 0 },
		Sales: { assets: 0, value: 0 },
		HR: { assets: 0, value: 0 },
	};

	const deptNames = Object.keys(deptAssets);
	assets.forEach((asset) => {
		// Randomly assign to departments for demo (in real app would use asset.department)
		const dept = deptNames[Math.floor(Math.random() * deptNames.length)];
		deptAssets[dept].assets++;
		deptAssets[dept].value += asset.price || 0;
	});

	const departmentUsage = Object.entries(deptAssets)
		.map(([dept, data]) => ({
			dept,
			assets: data.assets,
			value: Math.round(data.value),
			utilization:
				data.assets > 0
					? Math.min(
							95,
							Math.max(
								60,
								Math.round(
									(data.assets / totalAssets) * 100 * (utilization / 100) * faker.number.float({ min: 0.8, max: 1.2 }),
								),
							),
						)
					: 0,
		}))
		.filter((d) => d.assets > 0)
		.sort((a, b) => b.assets - a.assets);

	return {
		inventoryHealth: {
			utilization,
			utilizationChange: utilizationTrend,
			compliance,
			complianceChange: complianceTrend,
			chart: {
				categories: chartCategories,
				series: [
					{
						name: "Active Assets",
						data: Array.from({ length: 12 }, () => {
							// Simulate trend based on current utilization
							const base = Math.round((utilization * totalAssets) / 100);
							const variance = faker.number.int({ min: -10, max: 10 });
							return Math.max(0, base + variance);
						}),
					},
					{
						name: "Maintenance",
						data: Array.from({ length: 12 }, () => {
							const base = maintenanceAssets;
							const variance = faker.number.int({ min: -2, max: 2 });
							return Math.max(0, base + variance);
						}),
					},
				],
			},
		},
		procurement: {
			value: Math.round(procurementValue),
			change: procurementTrend,
		},
		depreciation: {
			value: Math.round(depreciationValue),
			change: depreciationTrend,
		},
		warranty: {
			value: warrantyValue,
			change: warrantyTrend,
		},
		topRequestedAssets: purchases
			.reduce(
				(acc, p) => {
					const existing = acc.find((item) => item.name === p.itemName);
					if (existing) {
						existing.requests += p.quantity;
					} else {
						const currentStock = assets.filter((a) => a.name.includes(p.itemName.split(" ")[0])).length;
						acc.push({
							name: p.itemName,
							requests: p.quantity,
							// Generate trend based on request volume
							change:
								p.quantity > 10
									? faker.number.float({ min: 15, max: 40, multipleOf: 0.1 })
									: p.quantity > 5
										? faker.number.float({ min: 5, max: 20, multipleOf: 0.1 })
										: faker.number.float({ min: -10, max: 15, multipleOf: 0.1 }),
							stock: currentStock,
							// Stock change based on current stock level
							stockChange:
								currentStock > 20
									? faker.number.float({ min: 10, max: 30, multipleOf: 0.1 })
									: currentStock > 10
										? faker.number.float({ min: 0, max: 20, multipleOf: 0.1 })
										: faker.number.float({ min: -20, max: 10, multipleOf: 0.1 }),
						});
					}
					return acc;
				},
				[] as { name: string; requests: number; change: number; stock: number; stockChange: number }[],
			)
			.sort((a, b) => b.requests - a.requests)
			.slice(0, 5),
		assetCategories,
		departmentUsage,
	};
};

const getDashboardAnalysis = http.get("/api/dashboard/analysis", async ({ request }) => {
	try {
		const url = new URL(request.url);
		const timeType = (url.searchParams.get("timeType") as "day" | "week" | "month") || "day";

		const data = generateDashboardData(timeType);

		return HttpResponse.json(
			{
				status: ResultStatus.SUCCESS,
				message: "",
				data,
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error("Dashboard Data Generation Error:", error);
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Failed to generate data",
				data: null,
			},
			{
				status: 500,
			},
		);
	}
});

// Helper functions for real data calculations
const calculateTrend = (current: number, previous: number): number => {
	if (previous === 0) return current > 0 ? 100 : 0;
	return Number((((current - previous) / previous) * 100).toFixed(1));
};

const generateMonthlySparkline = (
	assets: any[],
	field: "count" | "maintenance" | "licenses" | "requests",
	periods: number,
): number[] => {
	const now = Date.now();
	const periodMs = 30 * 24 * 60 * 60 * 1000; // ~30 days

	return Array.from({ length: periods }, (_, i) => {
		const periodEnd = now - i * periodMs;

		if (field === "count") {
			return assets.filter((a) => {
				const date = new Date(a.createdAt || a.purchaseDate || now).getTime();
				return date < periodEnd;
			}).length;
		}
		if (field === "maintenance") {
			return assets.filter((a) => {
				const date = new Date(a.createdAt || a.purchaseDate || now).getTime();
				return date < periodEnd && a.status === AssetStatus.Maintenance;
			}).length;
		}
		if (field === "licenses") {
			return assets.filter((a) => {
				const date = new Date(a.createdAt || a.purchaseDate || now).getTime();
				return date < periodEnd && (a.category === "Software" || a.category === "License");
			}).length;
		}
		return 0;
	}).reverse();
};

const generateRequestSparkline = (purchases: any[], periods: number): number[] => {
	const now = Date.now();
	const periodMs = 30 * 24 * 60 * 60 * 1000;

	return Array.from({ length: periods }, (_, i) => {
		const periodEnd = now - i * periodMs;
		const periodStart = periodEnd - periodMs;

		return purchases.filter((p) => {
			const date = new Date(p.createdAt || p.requestDate || now).getTime();
			return date >= periodStart && date < periodEnd && p.status === "pending";
		}).length;
	}).reverse();
};

const calculateMonthlyAssetValue = (assets: any[], monthsBack: number) => {
	const now = Date.now();
	const monthMs = 30 * 24 * 60 * 60 * 1000;

	return Array.from({ length: monthsBack }, (_, i) => {
		const monthEnd = now - i * monthMs;
		const totalValue = assets
			.filter((a) => {
				const purchaseDate = new Date(a.purchaseDate || a.createdAt || now).getTime();
				return purchaseDate < monthEnd;
			})
			.reduce((sum, a) => sum + (a.price || 0), 0);
		return Math.round(totalValue);
	}).reverse();
};

const generateMonthLabels = (count: number): string[] => {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const now = new Date();
	return Array.from({ length: count }, (_, i) => {
		const date = new Date(now);
		date.setMonth(date.getMonth() - (count - 1 - i));
		return months[date.getMonth()];
	});
};

const generateStableUsers = (count: number) => {
	// Use a fixed seed for stable user generation
	faker.seed(12345);
	const users = Array.from({ length: count }, () => ({
		name: faker.person.fullName(),
		avatar: faker.image.avatar(),
	}));
	// Reset seed to random
	faker.seed();
	return users;
};

const getDashboardWorkbench = http.get("/api/dashboard/workbench", async () => {
	try {
		const assets = assetManager.get() || [];
		const purchases = purchaseManager.get() || [];
		const audits = auditManager.get() || [];

		// Calculate Quick Stats with real trends
		const totalAssets = assets.length;
		const activeLicenses = assets.filter((a) => a.category === "Software" || a.category === "License").length;
		const pendingRequests = purchases.filter((p) => p.status === "pending").length;
		const maintenanceDue = assets.filter((a) => a.status === AssetStatus.Maintenance).length;

		// Generate sparklines and trends from real data
		const assetSparkline = generateMonthlySparkline(assets, "count", 9);
		const assetTrend = calculateTrend(totalAssets, assetSparkline[assetSparkline.length - 2] || 0);

		const licenseSparkline = generateMonthlySparkline(assets, "licenses", 9);
		const licenseTrend = calculateTrend(activeLicenses, licenseSparkline[licenseSparkline.length - 2] || 0);

		const requestSparkline = generateRequestSparkline(purchases, 9);
		const requestTrend = calculateTrend(pendingRequests, requestSparkline[requestSparkline.length - 2] || 0);

		const maintenanceSparkline = generateMonthlySparkline(assets, "maintenance", 9);
		const maintenanceTrend = calculateTrend(maintenanceDue, maintenanceSparkline[maintenanceSparkline.length - 2] || 0);

		// Calculate Asset Overview
		const inStock = assets.filter((a) => a.status === AssetStatus.InStock).length;
		const assigned = assets.filter((a) => a.status === AssetStatus.InUse).length;
		const disposed = assets.filter((a) => a.status === AssetStatus.Retired).length;

		// Calculate Asset Distribution
		const categoryCount: Record<string, number> = {};
		assets.forEach((asset) => {
			if (asset.category) {
				categoryCount[asset.category] = (categoryCount[asset.category] || 0) + 1;
			}
		});

		// Map to the format expected by the frontend
		const distributionLabels = ["Laptops", "Desktops", "Peripherals", "Mobiles"];
		const distributionSeries = [
			categoryCount.Laptop || 0,
			categoryCount.Desktop || 0,
			categoryCount.Peripherals || 0,
			categoryCount.Mobile || 0,
		];

		const distributionDetails = distributionLabels.map((label, index) => ({
			label,
			value: distributionSeries[index],
		}));

		// Generate Recent Activity from Audits
		const recentActivity = audits.slice(0, 5).map((log) => ({
			name: log.target || "Unknown Asset",
			action: log.action,
			user: log.actor.name,
			time: new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			icon: log.action.includes("Login")
				? "solar:user-circle-bold-duotone"
				: log.action.includes("Asset")
					? "solar:laptop-minimalistic-bold-duotone"
					: "solar:bell-bold-duotone",
			status: log.status,
		}));

		const data = {
			quickStats: [
				{
					label: "Total Assets",
					value: totalAssets.toLocaleString(),
					icon: "solar:laptop-minimalistic-bold-duotone",
					color: "#3b82f6",
					percent: assetTrend,
					chart: assetSparkline,
				},
				{
					label: "Active Licenses",
					value: activeLicenses.toLocaleString(),
					icon: "solar:key-minimalistic-square-bold-duotone",
					color: "#10b981",
					percent: licenseTrend,
					chart: licenseSparkline,
				},
				{
					label: "Pending Requests",
					value: pendingRequests.toLocaleString(),
					icon: "solar:clipboard-list-bold-duotone",
					color: "#f59e42",
					percent: requestTrend,
					chart: requestSparkline,
				},
				{
					label: "Maintenance Due",
					value: maintenanceDue.toLocaleString(),
					icon: "solar:settings-bold-duotone",
					color: "#ef4444",
					percent: maintenanceTrend,
					chart: maintenanceSparkline,
				},
			],
			assetValue: {
				percent: (() => {
					const monthlyValues = calculateMonthlyAssetValue(assets, 9);
					return calculateTrend(monthlyValues[monthlyValues.length - 1], monthlyValues[monthlyValues.length - 2]);
				})(),
				series: [
					{
						name: "Asset Value",
						data: calculateMonthlyAssetValue(assets, 9),
					},
				],
				categories: generateMonthLabels(9),
			},
			auditProgress: [
				{ label: "Q4 Hardware Audit", color: "#3b82f6" },
				{ label: "Software Compliance", color: "#10b981" },
				{ label: "Security Review", color: "#f59e42" },
			],
			assetOverview: {
				total: totalAssets,
				assigned,
				inStock,
				disposed,
			},
			projectUsers: generateStableUsers(4),
			recentActivity,
			assetDistribution: {
				series: distributionSeries,
				labels: distributionLabels,
				details: distributionDetails,
			},
		};

		return HttpResponse.json(
			{
				status: ResultStatus.SUCCESS,
				message: "",
				data,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Workbench Data Error:", error);
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Failed to fetch workbench data",
				data: null,
			},
			{ status: 500 },
		);
	}
});

export { getDashboardAnalysis, getDashboardWorkbench };
