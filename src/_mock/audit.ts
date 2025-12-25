import { faker } from "@faker-js/faker";

export const AUDIT_STATUS_OPTIONS = [
	{ label: "Success", value: "success" },
	{ label: "Failure", value: "failure" },
	{ label: "Warning", value: "warning" },
];

export const AUDIT_ACTION_OPTIONS = [
	{ label: "Login", value: "login" },
	{ label: "Create Asset", value: "create_asset" },
	{ label: "Update Asset", value: "update_asset" },
	{ label: "Delete Asset", value: "delete_asset" },
	{ label: "Export Data", value: "export_data" },
	{ label: "System Config", value: "system_config" },
];

const ACTORS = [
	{
		name: "Admin User",
		email: "admin@nexasset.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
		role: "Administrator",
	},
	{
		name: "John Doe",
		email: "john.doe@nexasset.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
		role: "IT Manager",
	},
	{
		name: "Sarah Smith",
		email: "sarah.smith@nexasset.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
		role: "Asset Coordinator",
	},
	{
		name: "Mike Johnson",
		email: "mike.j@nexasset.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
		role: "Technician",
	},
];

const generateAuditLog = () => {
	const status = faker.helpers.weightedArrayElement([
		{ weight: 8, value: "success" },
		{ weight: 1, value: "failure" },
		{ weight: 1, value: "warning" },
	]);
	const actionOption = faker.helpers.arrayElement(AUDIT_ACTION_OPTIONS);
	const actor = faker.helpers.arrayElement(ACTORS);

	return {
		id: faker.string.uuid(),
		timestamp: faker.date.recent({ days: 60 }).toISOString(),
		actor: {
			...actor,
			ip: faker.internet.ip(),
			location: `${faker.location.city()}, ${faker.location.country()}`,
		},
		action: actionOption.value,
		target: faker.commerce.productName(),
		status,
		risk_score: status === "success" ? faker.number.int({ min: 0, max: 30 }) : faker.number.int({ min: 50, max: 95 }),
		details: {
			before: { status: "active", location: "Warehouse A" },
			after: { status: "maintenance", location: "Repair Shop" },
			diff: `Performed ${actionOption.label} on asset`,
		},
		user_agent: faker.internet.userAgent(),
	};
};

export const auditLogs = Array.from({ length: 100 }, () => generateAuditLog());

export const auditStats = {
	total_events: 1250,
	compliance_rate: 98.5,
	critical_risks: 12,
	active_users: 45,
};
