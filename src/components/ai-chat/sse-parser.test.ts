import { describe, expect, it } from "vitest";
import { feedSse, parseSseLine } from "./sse-parser";

describe("parseSseLine", () => {
	it("parses a token event", () => {
		expect(parseSseLine('data: {"token":"hello"}')).toEqual({ kind: "token", value: "hello" });
	});

	it("parses an error event", () => {
		expect(parseSseLine('data: {"error":"boom"}')).toEqual({ kind: "error", value: "boom" });
	});

	it("recognises [DONE] terminator", () => {
		expect(parseSseLine("data: [DONE]")).toEqual({ kind: "done" });
	});

	it("treats invalid JSON as keepalive", () => {
		expect(parseSseLine("data: not-json").kind).toBe("keepalive");
	});

	it("treats SSE comments as keepalive", () => {
		expect(parseSseLine(":heartbeat").kind).toBe("keepalive");
	});

	it("ignores empty token (server sends '' as no-op)", () => {
		expect(parseSseLine('data: {"token":""}').kind).toBe("keepalive");
	});

	it("trims surrounding whitespace inside data payload", () => {
		expect(parseSseLine('data:  {"token":"x"}  ')).toEqual({ kind: "token", value: "x" });
	});
});

describe("feedSse - chunk-level streaming", () => {
	it("yields events when full lines arrive in one chunk", () => {
		const out = feedSse("", 'data: {"token":"a"}\n\ndata: {"token":"b"}\n\n');
		expect(out.buffer).toBe("");
		expect(out.events).toEqual([
			{ kind: "token", value: "a" },
			{ kind: "token", value: "b" },
		]);
	});

	it("buffers a half line until the next chunk completes it", () => {
		const first = feedSse("", 'data: {"tok');
		expect(first.events).toEqual([]);
		expect(first.buffer).toBe('data: {"tok');
		const second = feedSse(first.buffer, 'en":"hi"}\n\n');
		expect(second.buffer).toBe("");
		expect(second.events).toEqual([{ kind: "token", value: "hi" }]);
	});

	it("handles a chunk that splits across multiple events including [DONE]", () => {
		const out = feedSse("", 'data: {"token":"x"}\n\ndata: [DONE]\n\n');
		expect(out.buffer).toBe("");
		expect(out.events).toEqual([{ kind: "token", value: "x" }, { kind: "done" }]);
	});

	it("interleaves token and error events", () => {
		const out = feedSse("", 'data: {"token":"x"}\n\ndata: {"error":"boom"}\n\n');
		expect(out.events).toEqual([
			{ kind: "token", value: "x" },
			{ kind: "error", value: "boom" },
		]);
	});

	it("filters out keepalives so consumers don't have to", () => {
		const out = feedSse("", ':comment\n\ndata: {"token":"y"}\n\n');
		expect(out.events).toEqual([{ kind: "token", value: "y" }]);
	});

	it("preserves trailing partial line as buffer for next feed", () => {
		const out = feedSse("", 'data: {"token":"a"}\n\ndata: {"to');
		expect(out.events).toEqual([{ kind: "token", value: "a" }]);
		expect(out.buffer).toBe('data: {"to');
	});
});
