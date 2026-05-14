/**
 * 极小的 SSE 行解析器, 与 AiChatWidget 中的解析逻辑等价。
 *
 * 协议 (与后端 main.py 中的 event_stream 对齐):
 *   data: {"token":"片段"}\n\n
 *   data: {"error":"消息"}\n\n
 *   data: [DONE]\n\n
 *
 * 跨包/半行时由调用方维护 buffer, 把每次 fetch chunk 经 TextDecoder 解码后的 text 喂给
 * `feed`, 拿到 (剩余 buffer, 当前可消费的事件数组)。
 */

export type SseEvent =
	| { kind: "token"; value: string }
	| { kind: "error"; value: string }
	| { kind: "done" }
	| { kind: "keepalive" };

/**
 * 解析单行 `data: ...`。空行 / 非 data 行返回 keepalive (调用方可以忽略)。
 * 解析失败 (例如真正的 SSE 心跳行 `:keepalive`) 也归为 keepalive。
 */
export function parseSseLine(line: string): SseEvent {
	if (!line.startsWith("data: ")) return { kind: "keepalive" };
	const data = line.slice(6).trim();
	if (data === "[DONE]") return { kind: "done" };
	try {
		const parsed = JSON.parse(data) as { token?: string; error?: string };
		if (typeof parsed.token === "string" && parsed.token.length > 0) {
			return { kind: "token", value: parsed.token };
		}
		if (typeof parsed.error === "string") {
			return { kind: "error", value: parsed.error };
		}
		return { kind: "keepalive" };
	} catch {
		return { kind: "keepalive" };
	}
}

/**
 * 把一段新到达的 text 与已有 buffer 拼接, 切分出完整行并解析,
 * 返回剩余的不完整 buffer (尾巴) 和可立即消费的事件列表。
 *
 * 与 AiChatWidget 中的逻辑等价: 用 `\n` 切分, pop 最后一段作为 buffer。
 */
export function feedSse(prevBuffer: string, chunk: string): { buffer: string; events: SseEvent[] } {
	const merged = prevBuffer + chunk;
	const lines = merged.split("\n");
	const buffer = lines.pop() ?? "";
	const events: SseEvent[] = [];
	for (const line of lines) {
		const ev = parseSseLine(line);
		if (ev.kind !== "keepalive") events.push(ev);
	}
	return { buffer, events };
}
