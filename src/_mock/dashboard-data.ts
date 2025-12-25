import { faker } from "@faker-js/faker";

// Workbench Data (ITAM Context)
export const workbenchData = {
	quickStats: [
		{
			label: "Total Assets",
			value: "12,450",
			icon: "solar:laptop-minimalistic-bold-duotone",
			color: "#3b82f6",
			percent: 12.5,
			chart: [10, 41, 35, 51, 49, 62, 69, 91, 148],
		},
		{
			label: "Active Licenses",
			value: "8,210",
			icon: "solar:key-minimalistic-square-bold-duotone",
			color: "#10b981",
			percent: 8.2,
			chart: [40, 34, 61, 18, 63, 60, 52, 85, 90],
		},
		{
			label: "Pending Requests",
			value: "145",
			icon: "solar:clipboard-list-bold-duotone",
			color: "#f59e42",
			percent: -2.4,
			chart: [20, 50, 30, 40, 30, 20, 10, 5, 2],
		},
		{
			label: "Maintenance Due",
			value: "28",
			icon: "solar:settings-bold-duotone",
			color: "#ef4444",
			percent: 5.1,
			chart: [5, 10, 8, 12, 15, 10, 8, 12, 15],
		},
	],
	assetValue: {
		percent: 4.8,
		series: [
			{
				name: "Hardware Value",
				data: [120000, 135000, 128000, 142000, 150000, 158000, 165000, 172000, 180000],
			},
			{
				name: "Software Licenses",
				data: [80000, 82000, 85000, 88000, 92000, 95000, 98000, 102000, 105000],
			},
		],
		categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
	},
	auditProgress: [
		{ label: "Q4 Hardware Audit", color: "#3b82f6" },
		{ label: "Software Compliance", color: "#10b981" },
		{ label: "Security Review", color: "#f59e42" },
	],
	assetOverview: {
		total: 12450,
		assigned: 10890,
		inStock: 1250,
		disposed: 310,
	},
	projectUsers: [
		{ name: faker.person.fullName(), avatar: faker.image.avatar() },
		{ name: faker.person.fullName(), avatar: faker.image.avatar() },
		{ name: faker.person.fullName(), avatar: faker.image.avatar() },
		{ name: faker.person.fullName(), avatar: faker.image.avatar() },
	],
	recentActivity: [
		{
			name: "MacBook Pro M3",
			action: "Checked Out",
			user: "Alice Smith",
			time: "2 hours ago",
			icon: "solar:laptop-minimalistic-bold-duotone",
			status: "success",
		},
		{
			name: "Adobe CC License",
			action: "Assigned",
			user: "Bob Jones",
			time: "4 hours ago",
			icon: "solar:key-minimalistic-square-bold-duotone",
			status: "success",
		},
		{
			name: "Dell Monitor 27",
			action: "Maintenance",
			user: "IT Support",
			time: "1 day ago",
			icon: "solar:monitor-bold-duotone",
			status: "warning",
		},
		{
			name: "Office Chair",
			action: "Retired",
			user: "Warehouse",
			time: "2 days ago",
			icon: "solar:chair-2-bold-duotone",
			status: "error",
		},
		{
			name: "iPhone 15",
			action: "Checked In",
			user: "Charlie Brown",
			time: "3 days ago",
			icon: "solar:smartphone-bold-duotone",
			status: "success",
		},
	],
	assetDistribution: {
		series: [45, 25, 20, 10],
		labels: ["Laptops", "Desktops", "Peripherals", "Mobiles"],
		details: [
			{ label: "Laptops", value: 5602 },
			{ label: "Desktops", value: 3112 },
			{ label: "Peripherals", value: 2490 },
			{ label: "Mobiles", value: 1246 },
		],
	},
};

// Analysis Data (ITAM Context)
export const analysisData = {
	inventoryHealth: {
		day: {
			utilization: 85,
			utilizationChange: 2.5,
			compliance: 98,
			complianceChange: 0.5,
			chart: {
				categories: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"],
				series: [
					{ name: "Active Assets", data: [80, 82, 95, 120, 115, 90, 85] },
					{ name: "Maintenance", data: [5, 5, 8, 12, 10, 6, 5] },
				],
			},
		},
		week: {
			utilization: 88,
			utilizationChange: 1.2,
			compliance: 99,
			complianceChange: 0.2,
			chart: {
				categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
				series: [
					{ name: "Active Assets", data: [850, 920, 950, 980, 900, 400, 350] },
					{ name: "Maintenance", data: [20, 25, 30, 28, 35, 15, 10] },
				],
			},
		},
		month: {
			utilization: 92,
			utilizationChange: 3.8,
			compliance: 97,
			complianceChange: -0.5,
			chart: {
				categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
				series: [
					{ name: "Active Assets", data: [8200, 8500, 8800, 9100] },
					{ name: "Maintenance", data: [150, 180, 160, 140] },
				],
			},
		},
	},
	procurement: {
		day: { value: 12500, change: 12.5 },
		week: { value: 85000, change: 5.2 },
		month: { value: 345000, change: 8.4 },
	},
	depreciation: {
		day: { value: 450, change: -2.1 },
		week: { value: 3200, change: -1.5 },
		month: { value: 12800, change: -0.8 },
	},
	warranty: {
		day: { value: 5, change: 0 },
		week: { value: 28, change: 15.2 },
		month: { value: 112, change: 4.5 },
	},
	topRequestedAssets: {
		day: [
			{ name: "MacBook Pro 16", requests: 12, change: 5.2, stock: 45, stockChange: -2 },
			{ name: "Dell XPS 15", requests: 8, change: 2.1, stock: 30, stockChange: -1 },
			{ name: "iPhone 15", requests: 15, change: 8.4, stock: 20, stockChange: -5 },
			{ name: "Logitech MX Master", requests: 22, change: 12.5, stock: 80, stockChange: -10 },
		],
		week: [
			{ name: "MacBook Pro 16", requests: 58, change: 15.2, stock: 45, stockChange: -12 },
			{ name: "Dell XPS 15", requests: 42, change: 8.1, stock: 30, stockChange: -8 },
			{ name: "iPhone 15", requests: 65, change: 22.4, stock: 20, stockChange: -25 },
			{ name: "Logitech MX Master", requests: 98, change: 18.5, stock: 80, stockChange: -40 },
		],
		month: [
			{ name: "MacBook Pro 16", requests: 245, change: 25.2, stock: 45, stockChange: -42 },
			{ name: "Dell XPS 15", requests: 180, change: 12.1, stock: 30, stockChange: -28 },
			{ name: "iPhone 15", requests: 210, change: 32.4, stock: 20, stockChange: -85 },
			{ name: "Logitech MX Master", requests: 350, change: 15.5, stock: 80, stockChange: -120 },
		],
	},
	assetCategories: {
		day: [
			{ label: "Laptops", value: 45, color: "#3b82f6", icon: "solar:laptop-minimalistic-bold-duotone" },
			{ label: "Desktops", value: 25, color: "#10b981", icon: "solar:monitor-bold-duotone" },
			{ label: "Mobiles", value: 15, color: "#f59e42", icon: "solar:smartphone-bold-duotone" },
			{ label: "Others", value: 15, color: "#6366f1", icon: "solar:devices-bold-duotone" },
		],
		week: [
			{ label: "Laptops", value: 45, color: "#3b82f6", icon: "solar:laptop-minimalistic-bold-duotone" },
			{ label: "Desktops", value: 25, color: "#10b981", icon: "solar:monitor-bold-duotone" },
			{ label: "Mobiles", value: 15, color: "#f59e42", icon: "solar:smartphone-bold-duotone" },
			{ label: "Others", value: 15, color: "#6366f1", icon: "solar:devices-bold-duotone" },
		],
		month: [
			{ label: "Laptops", value: 45, color: "#3b82f6", icon: "solar:laptop-minimalistic-bold-duotone" },
			{ label: "Desktops", value: 25, color: "#10b981", icon: "solar:monitor-bold-duotone" },
			{ label: "Mobiles", value: 15, color: "#f59e42", icon: "solar:smartphone-bold-duotone" },
			{ label: "Others", value: 15, color: "#6366f1", icon: "solar:devices-bold-duotone" },
		],
	},
	departmentUsage: {
		day: [
			{ dept: "Engineering", assets: 450, value: 1200000, utilization: 92, tickets: 5 },
			{ dept: "Design", assets: 120, value: 450000, utilization: 88, tickets: 2 },
			{ dept: "Marketing", assets: 85, value: 180000, utilization: 75, tickets: 1 },
			{ dept: "Sales", assets: 150, value: 220000, utilization: 82, tickets: 3 },
			{ dept: "HR", assets: 45, value: 65000, utilization: 60, tickets: 0 },
		],
		week: [
			{ dept: "Engineering", assets: 450, value: 1200000, utilization: 94, tickets: 25 },
			{ dept: "Design", assets: 120, value: 450000, utilization: 90, tickets: 12 },
			{ dept: "Marketing", assets: 85, value: 180000, utilization: 78, tickets: 5 },
			{ dept: "Sales", assets: 150, value: 220000, utilization: 85, tickets: 15 },
			{ dept: "HR", assets: 45, value: 65000, utilization: 65, tickets: 2 },
		],
		month: [
			{ dept: "Engineering", assets: 450, value: 1200000, utilization: 95, tickets: 120 },
			{ dept: "Design", assets: 120, value: 450000, utilization: 92, tickets: 45 },
			{ dept: "Marketing", assets: 85, value: 180000, utilization: 80, tickets: 20 },
			{ dept: "Sales", assets: 150, value: 220000, utilization: 88, tickets: 60 },
			{ dept: "HR", assets: 45, value: 65000, utilization: 70, tickets: 8 },
		],
	},
	topChannels: {
		day: [],
		week: [],
		month: [],
	},
	// New Operational Metrics
	lifecycle: {
		new: 45,
		inStock: 1250,
		assigned: 10890,
		inRepair: 128,
		retired: 310,
	},
	stockAlerts: [
		{ category: "Laptops", remaining: 5, threshold: 10, status: "critical" },
		{ category: "Keyboards", remaining: 12, threshold: 20, status: "warning" },
		{ category: "Monitors", remaining: 8, threshold: 15, status: "critical" },
		{ category: "Headsets", remaining: 25, threshold: 30, status: "warning" },
	],
	ageDistribution: [
		{ label: "< 1 Year", value: 3500 },
		{ label: "1-3 Years", value: 5200 },
		{ label: "> 3 Years", value: 2100 },
		{ label: "Retired", value: 310 },
	],
	maintenanceStats: {
		repairRate: 2.4, // %
		avgRepairTime: 3.5, // days
		mostRepaired: [
			{ model: "Dell XPS 15", count: 45, rate: 15.2 },
			{ model: "MacBook Pro 13", count: 28, rate: 8.5 },
			{ model: "Lenovo ThinkPad X1", count: 15, rate: 5.1 },
		],
	},
};
