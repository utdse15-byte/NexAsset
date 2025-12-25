import { setupWorker } from "msw/browser";

import * as assetHandlers from "./handlers/_assets";
import * as auditHandlers from "./handlers/_audit";
import * as dashboardHandlers from "./handlers/_dashboard";
import * as departmentHandlers from "./handlers/_department";
import * as menuHandlers from "./handlers/_menu";
import * as userHandlers from "./handlers/_user";

export const handlers = [
	...Object.values(userHandlers),
	...Object.values(departmentHandlers),
	...Object.values(menuHandlers),
	// Explicitly list asset handlers to avoid export issues
	assetHandlers.assetList,
	assetHandlers.createAsset,
	// More specific routes MUST come before generic routes with path parameters
	assetHandlers.assetStatistics, // /api/assets/statistics must come before /api/assets/:id
	assetHandlers.assetDetail,
	assetHandlers.checkoutAssets,
	assetHandlers.returnAsset,
	assetHandlers.reportMaintenance,
	assetHandlers.finishMaintenance,
	assetHandlers.retireAsset,
	assetHandlers.getConsumablesList,
	assetHandlers.updateConsumableStock,
	assetHandlers.getPurchaseRequests,
	assetHandlers.createPurchaseRequest,
	assetHandlers.updatePurchaseStatus,
	// Explicitly list audit handlers
	auditHandlers.getAuditLogs,
	auditHandlers.getAuditStats,
	// Dashboard handlers
	dashboardHandlers.getDashboardAnalysis,
	dashboardHandlers.getDashboardWorkbench,
];

export const worker = setupWorker(...handlers);
