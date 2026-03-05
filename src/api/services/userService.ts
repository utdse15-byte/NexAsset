import type { User, UserInfo, UserToken } from "#/entity";
import apiClient from "../apiClient";

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}
export type SignInRes = UserToken & { user: UserInfo };

export enum UserApi {
	SignIn = "/auth/signin",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh",
	User = "/user",
}

const signin = (data: SignInReq) => apiClient.post<SignInRes>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });
const findById = (id: string) => apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

const getUserList = () => apiClient.get<User[]>({ url: UserApi.User });
const createUser = (data: Partial<User>) => apiClient.post({ url: UserApi.User, data });
const updateUser = (data: Partial<User> & { id: string }) => apiClient.put({ url: `${UserApi.User}/${data.id}`, data });
const deleteUser = (id: string) => apiClient.delete({ url: `${UserApi.User}/${id}` });

export default {
	signin,
	signup,
	findById,
	logout,
	getUserList,
	createUser,
	updateUser,
	deleteUser,
};
