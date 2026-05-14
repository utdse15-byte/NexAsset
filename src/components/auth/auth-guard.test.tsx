import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./auth-guard";

const mockUseUserToken = vi.fn();
const mockUseUserInfo = vi.fn();

vi.mock("@/store/userStore", () => ({
	useUserToken: () => mockUseUserToken(),
	useUserInfo: () => mockUseUserInfo(),
}));

beforeEach(() => {
	mockUseUserToken.mockReset();
	mockUseUserInfo.mockReset();
});

const setLoggedIn = (perms: { code: string }[] = [], roles: { code: string }[] = []) => {
	mockUseUserToken.mockReturnValue({ accessToken: "fake-token" });
	mockUseUserInfo.mockReturnValue({ permissions: perms, roles });
};

const setLoggedOut = () => {
	mockUseUserToken.mockReturnValue({ accessToken: undefined });
	mockUseUserInfo.mockReturnValue({});
};

describe("<AuthGuard>", () => {
	it("renders children when user has the required permission", () => {
		setLoggedIn([{ code: "user.create" }]);
		render(
			<AuthGuard check="user.create">
				<button type="button">create</button>
			</AuthGuard>,
		);
		expect(screen.getByText("create")).toBeInTheDocument();
	});

	it("renders fallback when user lacks the required permission", () => {
		setLoggedIn([{ code: "user.read" }]);
		render(
			<AuthGuard check="user.create" fallback={<span>denied</span>}>
				<button type="button">create</button>
			</AuthGuard>,
		);
		expect(screen.queryByText("create")).not.toBeInTheDocument();
		expect(screen.getByText("denied")).toBeInTheDocument();
	});

	it("renders nothing (null fallback) by default when access denied", () => {
		setLoggedIn([]);
		const { container } = render(
			<AuthGuard check="user.create">
				<span>secret</span>
			</AuthGuard>,
		);
		expect(container.firstChild).toBeNull();
	});

	it("denies access when user is not logged in", () => {
		setLoggedOut();
		render(
			<AuthGuard check="user.create" fallback={<span>denied</span>}>
				<span>secret</span>
			</AuthGuard>,
		);
		expect(screen.getByText("denied")).toBeInTheDocument();
	});

	it("checkAny: any-of-N grants access", () => {
		setLoggedIn([{ code: "user.read" }]);
		render(
			<AuthGuard checkAny={["user.create", "user.read"]} fallback={<span>denied</span>}>
				<span>ok</span>
			</AuthGuard>,
		);
		expect(screen.getByText("ok")).toBeInTheDocument();
	});

	it("checkAll: missing one denies access", () => {
		setLoggedIn([{ code: "user.read" }]);
		render(
			<AuthGuard checkAll={["user.read", "user.create"]} fallback={<span>denied</span>}>
				<span>ok</span>
			</AuthGuard>,
		);
		expect(screen.getByText("denied")).toBeInTheDocument();
	});

	it("checkAll: empty list grants access", () => {
		setLoggedIn([]);
		render(
			<AuthGuard checkAll={[]}>
				<span>ok</span>
			</AuthGuard>,
		);
		expect(screen.getByText("ok")).toBeInTheDocument();
	});

	it("baseOn=role: matches against roles instead of permissions", () => {
		setLoggedIn([], [{ code: "admin" }]);
		render(
			<AuthGuard check="admin" baseOn="role" fallback={<span>denied</span>}>
				<span>panel</span>
			</AuthGuard>,
		);
		expect(screen.getByText("panel")).toBeInTheDocument();
	});

	it("with no check props: grants access (open by default)", () => {
		setLoggedIn([]);
		render(
			<AuthGuard>
				<span>open</span>
			</AuthGuard>,
		);
		expect(screen.getByText("open")).toBeInTheDocument();
	});
});
