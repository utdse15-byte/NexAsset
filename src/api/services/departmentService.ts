import type { Department } from "#/entity";
import apiClient from "../apiClient";

export enum DepartmentApi {
	Department = "/department",
}

const getDepartmentList = () => apiClient.get<Department[]>({ url: DepartmentApi.Department });
const createDepartment = (data: Partial<Department>) => apiClient.post({ url: DepartmentApi.Department, data });
const updateDepartment = (data: Partial<Department> & { id: string }) =>
	apiClient.put({ url: `${DepartmentApi.Department}/${data.id}`, data });
const deleteDepartment = (id: string) => apiClient.delete({ url: `${DepartmentApi.Department}/${id}` });

export default {
	getDepartmentList,
	createDepartment,
	updateDepartment,
	deleteDepartment,
};
