import apiClient from "@/api/apiClient";
import type { Asset, Consumable, PurchaseRequest, PurchaseStatus } from "@/types/entity";

export enum AssetApi {
	List = "/assets",
}

const getAssetList = () => apiClient.get<Asset[]>({ url: AssetApi.List });
const createAsset = (data: Partial<Asset>) => apiClient.post<Asset>({ url: AssetApi.List, data });
const getAssetById = (id: string) => apiClient.get<Asset>({ url: `${AssetApi.List}/${id}` });
const checkoutAssets = (assetIds: string[]) =>
	apiClient.post<void>({ url: `${AssetApi.List}/checkout`, data: { assetIds } });
const returnAsset = (id: string) => apiClient.post<void>({ url: `${AssetApi.List}/${id}/return` });
const getAssetStatistics = () =>
	apiClient.get<{
		statusDistribution: { label: string; value: number }[];
		categoryDistribution: { label: string; value: number }[];
	}>({ url: `${AssetApi.List}/statistics` });

// Mock Consumables API
const getConsumablesList = () => apiClient.get<Consumable[]>({ url: "/consumables" });
const updateConsumableStock = (id: string, quantity: number, type: "in" | "out") =>
	apiClient.post<void>({ url: `/consumables/${id}/stock`, data: { quantity, type } });

// Mock Purchase API
const getPurchaseRequests = () => apiClient.get<PurchaseRequest[]>({ url: "/purchase-requests" });
const createPurchaseRequest = (data: Partial<PurchaseRequest>) =>
	apiClient.post<PurchaseRequest>({ url: "/purchase-requests", data });
const updatePurchaseStatus = (id: string, status: PurchaseStatus) =>
	apiClient.post<void>({ url: `/purchase-requests/${id}/status`, data: { status } });

const reportMaintenance = (id: string) => apiClient.post<void>({ url: `${AssetApi.List}/${id}/maintenance` });
const finishMaintenance = (id: string) => apiClient.post<void>({ url: `${AssetApi.List}/${id}/maintenance/finish` });
const retireAsset = (id: string) => apiClient.post<void>({ url: `${AssetApi.List}/${id}/retire` });

export default {
	getAssetList,
	createAsset,
	getAssetById,
	checkoutAssets,
	returnAsset,
	getAssetStatistics,
	getConsumablesList,
	updateConsumableStock,
	getPurchaseRequests,
	createPurchaseRequest,
	updatePurchaseStatus,
	reportMaintenance,
	finishMaintenance,
	retireAsset,
};
