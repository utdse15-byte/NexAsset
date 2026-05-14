/**
 * apiClient 拦截器单元测试
 *
 * 策略: 通过 vi.mock 截获 axios.create 调用, 用一个 stub instance 收集 interceptor handlers,
 * 然后直接调用这些 handler 验证逻辑。这样既不需要真发请求, 也不需要重构 apiClient 暴露内部细节。
 */
import type { AxiosError, AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const toastErrorMock = vi.fn();
const clearUserMock = vi.fn();

vi.mock("sonner", () => ({
	toast: { error: toastErrorMock },
}));

vi.mock("@/locales/i18n", () => ({
	t: (key: string) => key,
}));

vi.mock("@/store/userStore", () => ({
	default: {
		getState: () => ({
			userToken: { accessToken: undefined as string | undefined },
			actions: { clearUserInfoAndToken: clearUserMock },
		}),
	},
}));

// 关键: mock axios.create 返回一个能收集 handlers 的 stub
type SuccessHandler = (res: AxiosResponse) => unknown;
type ErrorHandler = (err: AxiosError) => unknown;
type RequestHandler = (cfg: { headers: Record<string, string> }) => unknown;

const handlers = {
	requestSuccess: undefined as RequestHandler | undefined,
	responseSuccess: undefined as SuccessHandler | undefined,
	responseError: undefined as ErrorHandler | undefined,
};

const responseSuccess = (): SuccessHandler => {
	if (!handlers.responseSuccess) throw new Error("responseSuccess handler 未注册");
	return handlers.responseSuccess;
};

const responseError = (): ErrorHandler => {
	if (!handlers.responseError) throw new Error("responseError handler 未注册");
	return handlers.responseError;
};

vi.mock("axios", () => {
	const stubInstance = {
		interceptors: {
			request: {
				use: (s: RequestHandler) => {
					handlers.requestSuccess = s;
				},
			},
			response: {
				use: (s: SuccessHandler, e: ErrorHandler) => {
					handlers.responseSuccess = s;
					handlers.responseError = e;
				},
			},
		},
		request: vi.fn(),
	};
	return {
		default: { create: () => stubInstance },
		create: () => stubInstance,
	};
});

beforeEach(async () => {
	vi.resetModules();
	handlers.requestSuccess = undefined;
	handlers.responseSuccess = undefined;
	handlers.responseError = undefined;
	toastErrorMock.mockClear();
	clearUserMock.mockClear();
	// 触发 apiClient 模块加载, 让它注册 interceptors
	await import("./apiClient");
});

afterEach(() => {
	vi.restoreAllMocks();
});

const makeResponse = <T>(data: T): AxiosResponse<T> =>
	({
		data,
		status: 200,
		statusText: "OK",
		headers: {},
		config: { headers: {} } as unknown,
	}) as AxiosResponse<T>;

describe("apiClient response interceptor (success path)", () => {
	it("returns data when status is SUCCESS (0)", () => {
		const res = makeResponse({ status: 0, message: "", data: { hello: "world" } });
		expect(responseSuccess()(res)).toEqual({ hello: "world" });
	});

	it("treats null body as undefined success (204 / empty body)", () => {
		const res = makeResponse(null);
		expect(responseSuccess()(res)).toBeUndefined();
	});

	it("returns falsy data unchanged when status is SUCCESS", () => {
		// data:0 / data:false / data:"" 都是合法成功响应, 不应当成失败
		const handler = responseSuccess();
		expect(handler(makeResponse({ status: 0, message: "", data: 0 }))).toBe(0);
		expect(handler(makeResponse({ status: 0, message: "", data: false }))).toBe(false);
		expect(handler(makeResponse({ status: 0, message: "", data: "" }))).toBe("");
	});

	it("throws with message when business status indicates failure", () => {
		const res = makeResponse({ status: -1, message: "biz err", data: null });
		expect(() => responseSuccess()(res)).toThrowError("biz err");
	});
});

describe("apiClient response interceptor (error path)", () => {
	it("toasts errors", async () => {
		const err = {
			response: {
				status: 500,
				data: { message: "server boom" },
			},
			message: "Request failed",
		} as unknown as AxiosError;
		await expect(responseError()(err)).rejects.toBe(err);
		expect(toastErrorMock).toHaveBeenCalledWith("server boom", { position: "top-center" });
	});

	it("clears user store and redirects on 401", async () => {
		const replaceSpy = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: { pathname: "/dashboard/workbench", replace: replaceSpy },
		});
		const err = {
			response: { status: 401, data: { message: "unauthorized" } },
		} as unknown as AxiosError;
		await expect(responseError()(err)).rejects.toBe(err);
		expect(clearUserMock).toHaveBeenCalledTimes(1);
		expect(replaceSpy).toHaveBeenCalledWith("/auth/login");
	});

	it("does NOT redirect on 401 when already on /auth/* page (avoid loop)", async () => {
		const replaceSpy = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: { pathname: "/auth/login", replace: replaceSpy },
		});
		const err = {
			response: { status: 401, data: { message: "wrong pwd" } },
		} as unknown as AxiosError;
		await expect(responseError()(err)).rejects.toBe(err);
		expect(clearUserMock).toHaveBeenCalledTimes(1);
		expect(replaceSpy).not.toHaveBeenCalled();
	});
});
