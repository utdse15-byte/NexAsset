import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import { logAudit, MockDataManager } from "@/_mock/utils";
import type { Department } from "@/types/entity";
import { BasicStatus } from "@/types/enum";

const DB_DEPARTMENT: Department[] = [
	{
		id: "dept-1",
		name: "IT Department",
		code: "IT",
		principal: "John Doe",
		phone: "123-456-7890",
		email: "it@example.com",
		status: BasicStatus.ENABLE,
	},
	{
		id: "dept-2",
		name: "HR Department",
		code: "HR",
		principal: "Jane Smith",
		phone: "098-765-4321",
		email: "hr@example.com",
		status: BasicStatus.ENABLE,
	},
	{
		id: "dept-3",
		name: "Finance Department",
		code: "FIN",
		principal: "Mike Johnson",
		phone: "111-222-3333",
		email: "finance@example.com",
		status: BasicStatus.ENABLE,
	},
];

const deptManager = new MockDataManager<Department>("departments", DB_DEPARTMENT);

const departmentList = http.get("/api/department", () => {
	return HttpResponse.json({
		status: 0,
		message: "",
		data: deptManager.get(),
	});
});

const createDepartment = http.post("/api/department", async ({ request }) => {
	const newDept = (await request.json()) as any;

	const department: Department = {
		id: faker.string.uuid(),
		name: newDept.name,
		code: newDept.code,
		principal: newDept.principal,
		phone: newDept.phone,
		email: newDept.email,
		status: newDept.status || BasicStatus.ENABLE,
	};

	deptManager.add(department);
	logAudit("Create Department", department.name, department);

	return HttpResponse.json({
		status: 0,
		message: "Department created successfully",
		data: department,
	});
});

const updateDepartment = http.put("/api/department/:id", async ({ params, request }) => {
	const { id } = params;
	const updateData = (await request.json()) as any;

	const updated = deptManager.update(id as string, (dept) => ({ ...dept, ...updateData }));

	if (!updated) {
		return HttpResponse.json({ status: 1, message: "Department not found" }, { status: 404 });
	}

	logAudit("Update Department", updated.name, updateData);

	return HttpResponse.json({
		status: 0,
		message: "Department updated successfully",
		data: updated,
	});
});

const deleteDepartment = http.delete("/api/department/:id", ({ params }) => {
	const { id } = params;
	const deleted = deptManager.delete(id as string);

	if (!deleted) {
		return HttpResponse.json({ status: 1, message: "Department not found" }, { status: 404 });
	}

	logAudit("Delete Department", id as string, { departmentId: id });

	return HttpResponse.json({
		status: 0,
		message: "Department deleted successfully",
	});
});

export { departmentList, createDepartment, updateDepartment, deleteDepartment };
