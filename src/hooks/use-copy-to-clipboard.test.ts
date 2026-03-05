import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "./use-copy-to-clipboard";

vi.mock("sonner", () => ({
	toast: { success: vi.fn() },
}));

describe("useCopyToClipboard", () => {
	const originalClipboard = navigator.clipboard;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		Object.defineProperty(navigator, "clipboard", {
			value: originalClipboard,
			configurable: true,
		});
	});

	// 辅助函数：减少重复
	function mockClipboard(writeText?: ReturnType<typeof vi.fn>) {
		const mock = writeText ?? vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: mock },
			configurable: true,
		});
		return mock;
	}

	it("should initialize with null copiedText", () => {
		const { result } = renderHook(() => useCopyToClipboard());
		expect(result.current.copiedText).toBeNull();
		expect(typeof result.current.copyFn).toBe("function");
	});

	it("should copy text to clipboard successfully", async () => {
		const mockWriteText = mockClipboard();
		const { result } = renderHook(() => useCopyToClipboard());

		let success = false;
		await act(async () => {
			success = await result.current.copyFn("Hello World");
		});

		expect(success).toBe(true);
		expect(mockWriteText).toHaveBeenCalledWith("Hello World");
		expect(result.current.copiedText).toBe("Hello World");
		expect(toast.success).toHaveBeenCalledWith("Copied!");
		expect(toast.success).toHaveBeenCalledTimes(1);
	});

	it("should handle clipboard not supported", async () => {
		Object.defineProperty(navigator, "clipboard", {
			value: undefined,
			configurable: true,
		});
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { result } = renderHook(() => useCopyToClipboard());

		let success = false;
		await act(async () => {
			success = await result.current.copyFn("Hello World");
		});

		expect(success).toBe(false);
		expect(result.current.copiedText).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith("Clipboard not supported");
		expect(toast.success).not.toHaveBeenCalled(); // ← 补充

		consoleSpy.mockRestore();
	});

	it("should handle writeText rejection", async () => {
		mockClipboard(vi.fn().mockRejectedValue(new Error("Denied")));
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { result } = renderHook(() => useCopyToClipboard());

		let success = false;
		await act(async () => {
			success = await result.current.copyFn("Hello World");
		});

		expect(success).toBe(false);
		expect(result.current.copiedText).toBeNull();
		expect(toast.success).not.toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("should update copiedText on consecutive copies", async () => {
		mockClipboard();
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copyFn("First");
		});
		expect(result.current.copiedText).toBe("First");

		await act(async () => {
			await result.current.copyFn("Second");
		});
		expect(result.current.copiedText).toBe("Second");
	});

	it("should handle empty string", async () => {
		const mockWriteText = mockClipboard();
		const { result } = renderHook(() => useCopyToClipboard());

		await act(async () => {
			await result.current.copyFn("");
		});

		expect(mockWriteText).toHaveBeenCalledWith("");
	});
});
