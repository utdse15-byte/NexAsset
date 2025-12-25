import type { NavItemDataProps } from "@/components/nav/types";
import type { BasicStatus, PermissionType } from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string;
	email: string;
	username: string;
	password?: string;
	avatar?: string;
	roles?: Role[];
	status?: BasicStatus;
	permissions?: Permission[];
	menu?: MenuTree[];
}

export interface Permission_Old {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission_Old[];
}

export interface Role_Old {
	id: string;
	name: string;
	code: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission_Old[];
}

export interface CommonOptions {
	status?: BasicStatus;
	desc?: string;
	createdAt?: string;
	updatedAt?: string;
}
export interface User extends CommonOptions {
	id: string; // uuid
	username: string;
	password: string;
	email: string;
	phone?: string;
	avatar?: string;
	role?: Role;
}

export interface Role extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string;
}

export interface Department extends CommonOptions {
	id: string;
	name: string;
	code: string;
	principal?: string; // Department head
	phone?: string;
	email?: string;
}

export interface Permission extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string; // resource:action  example: "user-management:read"
}

export interface Menu extends CommonOptions, MenuMetaInfo {
	id: string; // uuid
	parentId: string;
	name: string;
	code: string;
	order?: number;
	type: PermissionType;
}

export type MenuMetaInfo = Partial<
	Pick<NavItemDataProps, "path" | "icon" | "caption" | "info" | "disabled" | "auth" | "hidden">
> & {
	externalLink?: URL;
	component?: string;
};

export type MenuTree = Menu & {
	children?: MenuTree[];
};

export enum AssetStatus {
	InStock = "in_stock",
	InUse = "in_use",
	Maintenance = "maintenance",
	Retired = "retired",
}

export interface Asset extends Omit<CommonOptions, "status"> {
	id: string;
	name: string;
	category: string; // e.g., "Laptop", "Server"
	model: string;
	serialNumber: string;
	status: AssetStatus;
	purchaseDate: string;
	price: number;
	assignedTo?: string; // User ID
}

export interface Consumable extends Omit<CommonOptions, "status"> {
	id: string;
	name: string;
	category: string;
	model: string;
	unitPrice: number;
	quantity: number;
	threshold: number; // Low stock alert level
	status: "in_stock" | "low_stock" | "out_of_stock";
}

export type PurchaseStatus = "pending" | "approved" | "rejected" | "ordered" | "received";

export interface PurchaseRequest extends Omit<CommonOptions, "status"> {
	id: string;
	requestDate: string;
	requesterId: string;
	requesterName: string;
	itemName: string;
	category: string;
	quantity: number;
	estimatedPrice: number;
	totalPrice: number;
	reason: string;
	status: PurchaseStatus;
	approvedBy?: string;
	orderDate?: string;
	receivedDate?: string;
}
