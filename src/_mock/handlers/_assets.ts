import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";

import { logAudit, MockDataManager } from "@/_mock/utils";
import { type Asset, AssetStatus, type Consumable, type PurchaseRequest, type PurchaseStatus } from "@/types/entity";
import { ResultStatus } from "@/types/enum";

const assetManager = new MockDataManager<Asset>(
	"assets",
	Array.from({ length: 100 }).map(() => {
		const category = faker.helpers.arrayElement([
			"Laptop",
			"Desktop",
			"Server",
			"Monitor",
			"Printer",
			"Mobile",
			"Tablet",
			"Projector",
			"Network Gear",
			"Peripherals",
		]);

		// Generate more realistic status based on category and random chance
		let status = AssetStatus.InUse;
		const rand = Math.random();
		if (rand > 0.7) status = AssetStatus.InStock;
		if (rand > 0.9) status = AssetStatus.Maintenance;
		if (rand > 0.95) status = AssetStatus.Retired;

		return {
			id: faker.string.uuid(),
			name: faker.commerce.productName(),
			category,
			model: `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`,
			serialNumber: faker.string.alphanumeric(10).toUpperCase(),
			status,
			purchaseDate: faker.date.past({ years: 3 }).toISOString(),
			price: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
			createdAt: faker.date.past().toISOString(),
		};
	}),
);

const assetList = http.get("/api/assets", async () => {
	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "",
			data: assetManager.get(),
		},
		{
			status: 200,
		},
	);
});

const createAsset = http.post("/api/assets", async ({ request }) => {
	const newAsset = (await request.json()) as Asset;
	newAsset.id = faker.string.uuid();
	newAsset.createdAt = new Date().toISOString();

	assetManager.add(newAsset);
	logAudit("Create Asset", newAsset.name, newAsset);

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Asset created successfully",
			data: newAsset,
		},
		{
			status: 200,
		},
	);
});

const assetDetail = http.get("/api/assets/:id", async ({ params }) => {
	const { id } = params;
	const asset = assetManager.find((item) => item.id === id);

	if (!asset) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Asset not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "",
			data: asset,
		},
		{
			status: 200,
		},
	);
});

const checkoutAssets = http.post("/api/assets/checkout", async ({ request }) => {
	const { assetIds } = (await request.json()) as { assetIds: string[] };

	assetIds.forEach((id) => {
		assetManager.update(id, (asset) => {
			logAudit("Checkout Asset", asset.name, { assetId: id, status: AssetStatus.InUse });
			return { ...asset, status: AssetStatus.InUse };
		});
	});

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Assets checked out successfully",
			data: null,
		},
		{
			status: 200,
		},
	);
});

const assetStatistics = http.get("/api/assets/statistics", async () => {
	try {
		const assets = assetManager.get() || [];

		if (!Array.isArray(assets)) {
			return HttpResponse.json(
				{
					status: ResultStatus.SUCCESS,
					message: "",
					data: {
						statusDistribution: [],
						categoryDistribution: [],
						stockAlerts: [],
						mostRepaired: [],
					},
				},
				{
					status: 200,
				},
			);
		}

		// Deep clone to remove any potential Proxies
		const cleanAssets = JSON.parse(JSON.stringify(assets));

		const validAssets = cleanAssets.filter((asset: any) => {
			return asset && typeof asset.status === "string" && typeof asset.category === "string";
		});

		const statusDistribution =
			validAssets.reduce(
				(acc: any, asset: any) => {
					const status = asset.status;
					if (status) {
						acc[status] = (acc[status] || 0) + 1;
					}
					return acc;
				},
				{} as Record<string, number>,
			) || {};

		const categoryDistribution =
			validAssets.reduce(
				(acc: any, asset: any) => {
					const category = asset.category;
					if (category) {
						acc[category] = (acc[category] || 0) + 1;
					}
					return acc;
				},
				{} as Record<string, number>,
			) || {};

		// Calculate Age Distribution (based on purchaseDate)
		const ageDistribution: Record<string, number> = {
			"0-1 years": 0,
			"1-2 years": 0,
			"2-3 years": 0,
			"3+ years": 0,
		};
		const now = Date.now();
		validAssets.forEach((asset: any) => {
			if (asset.purchaseDate) {
				const ageInYears = (now - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
				if (ageInYears < 1) ageDistribution["0-1 years"]++;
				else if (ageInYears < 2) ageDistribution["1-2 years"]++;
				else if (ageInYears < 3) ageDistribution["2-3 years"]++;
				else ageDistribution["3+ years"]++;
			}
		});

		// Generate Stock Alerts (Low stock categories)
		// Use stable threshold based on category size (20% of total or minimum 5)
		const allCategories = Object.keys(categoryDistribution);

		const stockAlerts = allCategories
			.map((category) => {
				// Count InStock items for this category
				const count = validAssets.filter(
					(a: any) => a.category === category && a.status === AssetStatus.InStock,
				).length;
				const totalInCategory = categoryDistribution[category] || 0;

				// Threshold is 20% of category total, minimum 5
				const threshold = Math.max(5, Math.floor(totalInCategory * 0.2));

				if (count < threshold) {
					return {
						category,
						remaining: count,
						threshold,
						status: count < threshold / 2 ? "critical" : "warning",
					};
				}
				return null;
			})
			.filter(Boolean)
			.slice(0, 5); // Limit to 5 alerts

		// Generate Most Repaired (Based on real maintenance status)
		const mostRepaired = (Object.entries(categoryDistribution) as [string, number][])
			.map(([category, total]) => {
				const maintenanceCount = validAssets.filter(
					(a: any) => a.category === category && a.status === AssetStatus.Maintenance,
				).length;
				const rate = total > 0 ? Math.round((maintenanceCount / total) * 100) : 0;
				return {
					model: `${category} Series`,
					count: maintenanceCount,
					rate,
				};
			})
			.filter((item) => item.count > 0) // Only show categories with actual maintenance
			.sort((a, b) => b.count - a.count) // Sort by maintenance count
			.slice(0, 3); // Top 3

		return HttpResponse.json(
			{
				status: ResultStatus.SUCCESS,
				message: "",
				data: {
					statusDistribution: Object.entries(statusDistribution).map(([label, value]) => ({
						label,
						value,
					})),
					categoryDistribution: Object.entries(categoryDistribution).map(([label, value]) => ({
						label,
						value,
					})),
					ageDistribution: Object.entries(ageDistribution).map(([label, value]) => ({
						label,
						value,
					})),
					stockAlerts,
					mostRepaired,
				},
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error("Asset Stats Error:", error);
		return HttpResponse.json(
			{
				status: ResultStatus.SUCCESS,
				message: "Failed to fetch stats (Recovered)",
				data: { statusDistribution: [], categoryDistribution: [], stockAlerts: [], mostRepaired: [] },
			},
			{ status: 200 },
		);
	}
});

const returnAsset = http.post("/api/assets/:id/return", async ({ params }) => {
	const { id } = params;
	const updated = assetManager.update(id as string, (asset) => {
		logAudit("Return Asset", asset.name, { assetId: id, status: AssetStatus.InStock });
		return { ...asset, status: AssetStatus.InStock };
	});

	if (!updated) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Asset not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Asset returned successfully",
			data: null,
		},
		{
			status: 200,
		},
	);
});

const reportMaintenance = http.post("/api/assets/:id/maintenance", async ({ params }) => {
	const { id } = params;
	const updated = assetManager.update(id as string, (asset) => {
		logAudit("Report Maintenance", asset.name, { assetId: id, status: AssetStatus.Maintenance });
		return { ...asset, status: AssetStatus.Maintenance };
	});

	if (!updated) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Asset not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Asset sent for maintenance",
			data: null,
		},
		{
			status: 200,
		},
	);
});

const finishMaintenance = http.post("/api/assets/:id/maintenance/finish", async ({ params }) => {
	const { id } = params;
	const updated = assetManager.update(id as string, (asset) => {
		logAudit("Finish Maintenance", asset.name, { assetId: id, status: AssetStatus.InStock });
		return { ...asset, status: AssetStatus.InStock };
	});

	if (!updated) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Asset not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Maintenance finished",
			data: null,
		},
		{
			status: 200,
		},
	);
});

const retireAsset = http.post("/api/assets/:id/retire", async ({ params }) => {
	const { id } = params;
	const updated = assetManager.update(id as string, (asset) => {
		logAudit("Retire Asset", asset.name, { assetId: id, status: AssetStatus.Retired });
		return { ...asset, status: AssetStatus.Retired };
	});

	if (!updated) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Asset not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Asset retired",
			data: null,
		},
		{
			status: 200,
		},
	);
});

// Mock Consumables Data
const consumableManager = new MockDataManager<Consumable>("consumables", [
	{
		id: faker.string.uuid(),
		name: "Printer Paper A4",
		category: "Office Supplies",
		model: "Standard 80gsm",
		unitPrice: 5.0,
		quantity: 500,
		threshold: 50,
		status: "in_stock",
	},
	{
		id: faker.string.uuid(),
		name: "HDMI Cable 2m",
		category: "Peripherals",
		model: "Gold Plated",
		unitPrice: 12.5,
		quantity: 15,
		threshold: 10,
		status: "in_stock",
	},
	{
		id: faker.string.uuid(),
		name: "Black Ink Cartridge",
		category: "Office Supplies",
		model: "HP 65XL",
		unitPrice: 45.0,
		quantity: 3,
		threshold: 5,
		status: "low_stock",
	},
	{
		id: faker.string.uuid(),
		name: "USB-C Hub",
		category: "Peripherals",
		model: "7-in-1 Adapter",
		unitPrice: 35.0,
		quantity: 0,
		threshold: 5,
		status: "out_of_stock",
	},
]);

const getConsumablesList = http.get("/api/consumables", async () => {
	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "",
			data: consumableManager.get(),
		},
		{
			status: 200,
		},
	);
});

const updateConsumableStock = http.post("/api/consumables/:id/stock", async ({ params, request }) => {
	const { id } = params;
	const { quantity, type } = (await request.json()) as { quantity: number; type: "in" | "out" };

	const updated = consumableManager.update(id as string, (item) => {
		if (type === "in") {
			item.quantity += quantity;
		} else {
			item.quantity = Math.max(0, item.quantity - quantity);
		}
		// Update status based on threshold
		if (item.quantity === 0) item.status = "out_of_stock";
		else if (item.quantity <= item.threshold) item.status = "low_stock";
		else item.status = "in_stock";

		logAudit("Update Stock", item.name, { quantity, type, newQuantity: item.quantity });
		return item;
	});

	if (!updated) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Consumable not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Stock updated successfully",
			data: null,
		},
		{
			status: 200,
		},
	);
});

// Mock Purchase Requests Data
const purchaseManager = new MockDataManager<PurchaseRequest>("purchase_requests", [
	{
		id: faker.string.uuid(),
		requestDate: faker.date.recent({ days: 2 }).toISOString(),
		requesterId: "user_test_id",
		requesterName: "Test User",
		itemName: "MacBook Pro M3",
		category: "Computer",
		quantity: 1,
		estimatedPrice: 2000,
		totalPrice: 2000,
		reason: "New hire equipment",
		status: "pending",
	},
	{
		id: faker.string.uuid(),
		requestDate: faker.date.recent({ days: 5 }).toISOString(),
		requesterId: "user_admin_id",
		requesterName: "Admin User",
		itemName: "Ergonomic Chair",
		category: "Furniture",
		quantity: 2,
		estimatedPrice: 300,
		totalPrice: 600,
		reason: "Office upgrade",
		status: "approved",
		approvedBy: "Manager",
	},
	{
		id: faker.string.uuid(),
		requestDate: faker.date.past().toISOString(),
		requesterId: "user_test_id",
		requesterName: "Test User",
		itemName: "Gaming Mouse",
		category: "Peripherals",
		quantity: 1,
		estimatedPrice: 80,
		totalPrice: 80,
		reason: "Personal preference",
		status: "rejected",
		approvedBy: "Manager",
	},
	{
		id: faker.string.uuid(),
		requestDate: faker.date.recent({ days: 10 }).toISOString(),
		requesterId: "user_admin_id",
		requesterName: "Admin User",
		itemName: "Dell Monitor 27",
		category: "Peripherals",
		quantity: 5,
		estimatedPrice: 250,
		totalPrice: 1250,
		reason: "Design team expansion",
		status: "ordered",
		approvedBy: "Manager",
		orderDate: faker.date.recent({ days: 2 }).toISOString(),
	},
]);

const getPurchaseRequests = http.get("/api/purchase-requests", async () => {
	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "",
			data: purchaseManager.get(),
		},
		{
			status: 200,
		},
	);
});

const createPurchaseRequest = http.post("/api/purchase-requests", async ({ request }) => {
	const data = (await request.json()) as Partial<PurchaseRequest>;
	const newRequest: PurchaseRequest = {
		id: faker.string.uuid(),
		requestDate: new Date().toISOString(),
		requesterId: "user_test_id", // Mock current user
		requesterName: "Test User",
		itemName: data.itemName || "",
		category: data.category || "",
		quantity: data.quantity || 1,
		estimatedPrice: data.estimatedPrice || 0,
		totalPrice: (data.estimatedPrice || 0) * (data.quantity || 1),
		reason: data.reason || "",
		status: "pending",
		...data,
	} as PurchaseRequest;

	purchaseManager.add(newRequest);
	logAudit("Create Purchase Request", newRequest.itemName, newRequest);

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Purchase request created successfully",
			data: newRequest,
		},
		{
			status: 200,
		},
	);
});

const updatePurchaseStatus = http.post("/api/purchase-requests/:id/status", async ({ params, request }) => {
	const { id } = params;
	const { status } = (await request.json()) as { status: PurchaseStatus };

	const updated = purchaseManager.update(id as string, (request) => {
		const updatedRequest = { ...request, status };
		// Auto-create asset when received
		if (status === "received" && request.status !== "received") {
			updatedRequest.receivedDate = new Date().toISOString();
			// Mock adding to inventory
			// In a real app, this would call an asset creation endpoint
		} else if (status === "ordered") {
			updatedRequest.orderDate = new Date().toISOString();
		}

		logAudit("Update Purchase Status", request.itemName, { oldStatus: request.status, newStatus: status });
		return updatedRequest;
	});

	if (!updated) {
		return HttpResponse.json(
			{
				status: ResultStatus.ERROR,
				message: "Purchase request not found",
				data: null,
			},
			{
				status: 404,
			},
		);
	}

	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS,
			message: "Status updated successfully",
			data: null,
		},
		{
			status: 200,
		},
	);
});

export {
	assetManager,
	purchaseManager,
	assetList,
	createAsset,
	assetDetail,
	checkoutAssets,
	assetStatistics,
	returnAsset,
	reportMaintenance,
	finishMaintenance,
	retireAsset,
	getConsumablesList,
	updateConsumableStock,
	getPurchaseRequests,
	createPurchaseRequest,
	updatePurchaseStatus,
};
