import type { Department } from "#/entity";
import apiClient from "../apiClient";

export enum DepartmentApi {
	Department = "/department",
}

const getDepartmentList = () => apiClient.get<Department[]>({ url: DepartmentApi.Department });
const createDepartment = (data: any) => apiClient.post({ url: DepartmentApi.Department, data });
const updateDepartment = (data: any) => apiClient.put({ url: `${DepartmentApi.Department}/${data.id}`, data });
const deleteDepartment = (id: string) => apiClient.delete({ url: `${DepartmentApi.Department}/${id}` });

export default {
	getDepartmentList,
	createDepartment,
	updateDepartment,
	deleteDepartment,
};
