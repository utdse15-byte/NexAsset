import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import type { User } from "#/entity";
import { logAudit, MockDataManager } from "@/_mock/utils";
import { UserApi } from "@/api/services/userService";
import { ResultStatus } from "@/types/enum";
import { convertFlatToTree } from "@/utils/tree";
import { DB_MENU, DB_PERMISSION, DB_ROLE, DB_ROLE_PERMISSION, DB_USER, DB_USER_ROLE } from "../assets";

const userManager = new MockDataManager<User>("users", DB_USER);

const signIn = http.post(`/api${UserApi.SignIn}`, async ({ request }) => {
	const { username, password } = (await request.json()) as Record<string, string>;

	const users = userManager.get();
	const user = users.find((item) => item.username === username);

	if (!user || user.password !== password) {
		return HttpResponse.json({
			status: 10001,
			message: "Incorrect username or password.",
		});
	}
	// delete password
	const { password: _, ...userWithoutPassword } = user;

	// user role
	const roles = DB_USER_ROLE.filter((item) => item.userId === user.id).map((item) =>
		DB_ROLE.find((role) => role.id === item.roleId),
	);

	// user permissions
	const permissions = DB_ROLE_PERMISSION.filter((item) => roles.some((role) => role?.id === item.roleId)).map((item) =>
		DB_PERMISSION.find((permission) => permission.id === item.permissionId),
	);

	const menu = convertFlatToTree(DB_MENU);

	logAudit("User Login", user.username, { userId: user.id });

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "",
		data: {
			user: { ...userWithoutPassword, roles, permissions, menu },
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const userList = http.get("/api/user", async () => {
	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "",
		data: userManager.get(),
	});
});

const createUser = http.post("/api/user", async ({ request }) => {
	const newUser = (await request.json()) as any;
	newUser.id = faker.string.uuid();
	newUser.avatar = faker.image.avatarGitHub();

	userManager.add(newUser);
	logAudit("Create User", newUser.username, newUser);

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "User created successfully",
		data: newUser,
	});
});

const updateUser = http.put("/api/user/:id", async ({ params, request }) => {
	const { id } = params;
	const updatedUser = (await request.json()) as any;

	const updated = userManager.update(id as string, (user) => ({ ...user, ...updatedUser }));

	if (updated) {
		logAudit("Update User", updated.username, updatedUser);
		return HttpResponse.json({
			status: ResultStatus.SUCCESS,
			message: "User updated successfully",
			data: updated,
		});
	}
	return HttpResponse.json({
		status: ResultStatus.ERROR,
		message: "User not found",
	});
});

const deleteUser = http.delete("/api/user/:id", async ({ params }) => {
	const { id } = params;
	const deleted = userManager.delete(id as string);

	if (deleted) {
		logAudit("Delete User", id as string, { userId: id });
		return HttpResponse.json({
			status: ResultStatus.SUCCESS,
			message: "User deleted successfully",
		});
	}
	return HttpResponse.json({
		status: ResultStatus.ERROR,
		message: "User not found",
	});
});

const findById = http.get("/api/user/:id", async ({ params }) => {
	const { id } = params;
	const user = userManager.find((item) => item.id === id);
	if (user) {
		return HttpResponse.json({
			status: ResultStatus.SUCCESS,
			message: "",
			data: [user],
		});
	}
	return HttpResponse.json({
		status: ResultStatus.ERROR,
		message: "User not found",
	});
});

export { signIn, userList, createUser, updateUser, deleteUser, findById };
