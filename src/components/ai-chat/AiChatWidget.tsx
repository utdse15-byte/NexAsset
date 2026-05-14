import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils";
import { feedSse } from "./sse-parser";

// ── Types ────────────────────────────────────────────
interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

// ── Config ───────────────────────────────────────────
// 默认空串 → 走同源 /api/ai → 由 Nginx (生产) 或 Vite (开发) 反代到后端。
// 仅在直连后端调试时才设 VITE_AI_BACKEND_URL=http://localhost:8000。
const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL ?? "";

const SESSION_STORAGE_KEY = "nexasset.ai-chat.session-id";
const MESSAGE_MAX_LENGTH = 2000;

function generateSessionId(): string {
	return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getOrCreateSessionId(): string {
	try {
		const cached = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
		if (cached) return cached;
		const generated = generateSessionId();
		window.sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
		return generated;
	} catch {
		// SSR / 隐私模式下 sessionStorage 不可用
		return generateSessionId();
	}
}

const WELCOME_CONTENT =
	"你好！我是 NexAsset 智能助手 🤖\n\n我可以回答关于 IT 资产管理制度、设备维护、采购流程等问题。请问有什么可以帮助你的？";

// ── Component ────────────────────────────────────────
export default function AiChatWidget() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>(() => [
		{
			id: "welcome",
			role: "assistant",
			content: WELCOME_CONTENT,
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);

	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const triggerButtonRef = useRef<HTMLButtonElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const isMountedRef = useRef(true);
	const scrollPendingRef = useRef(false);
	// 只有显式打开过, 关闭时才把焦点送回触发按钮; 避免初次渲染抢焦点
	const wasOpenRef = useRef(false);

	const sessionId = useMemo(getOrCreateSessionId, []);

	// 只滚动消息容器自身，避免 smooth 抖动 + 防止 scrollIntoView 把祖先一起滚走
	const scrollToBottom = useCallback(() => {
		if (scrollPendingRef.current) return;
		scrollPendingRef.current = true;
		requestAnimationFrame(() => {
			scrollPendingRef.current = false;
			const el = messagesContainerRef.current;
			if (el) el.scrollTop = el.scrollHeight;
		});
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 仅用于内容变化时滚动
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 卸载时取消 in-flight 请求，避免内存泄漏 + 状态更新告警
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			abortControllerRef.current?.abort();
			abortControllerRef.current = null;
		};
	}, []);

	// 打开聚焦输入框；关闭把焦点还给触发按钮（仅在曾经打开过的情况下）
	useEffect(() => {
		if (isOpen) {
			wasOpenRef.current = true;
			const t = window.setTimeout(() => inputRef.current?.focus(), 200);
			return () => window.clearTimeout(t);
		}
		if (wasOpenRef.current) {
			triggerButtonRef.current?.focus();
		}
		return undefined;
	}, [isOpen]);

	// ESC 关闭
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen]);

	const safeSetMessages = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
		if (!isMountedRef.current) return;
		setMessages(updater);
	}, []);

	const handleSend = useCallback(async () => {
		const trimmed = input.trim();
		if (!trimmed || isStreaming) return;
		if (trimmed.length > MESSAGE_MAX_LENGTH) return;

		const userMsg: ChatMessage = {
			id: `user-${Date.now()}`,
			role: "user",
			content: trimmed,
			timestamp: new Date(),
		};
		const assistantMsgId = `assistant-${Date.now()}`;
		const assistantMsg: ChatMessage = {
			id: assistantMsgId,
			role: "assistant",
			content: "",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMsg, assistantMsg]);
		setInput("");
		setIsStreaming(true);

		// 取消上一次未完成请求
		abortControllerRef.current?.abort();
		const controller = new AbortController();
		abortControllerRef.current = controller;

		// 兜底超时 90s: 后端 SSE 长流时间也不应超过这个量级
		const STREAM_TIMEOUT_MS = 90_000;
		let timedOut = false;
		const timeoutId = window.setTimeout(() => {
			timedOut = true;
			controller.abort();
		}, STREAM_TIMEOUT_MS);

		// rAF 节流：每帧最多 commit 一次，避免每 token 全量重渲染消息列表
		let pendingChunk = "";
		let flushScheduled = false;
		const scheduleFlush = () => {
			if (flushScheduled) return;
			flushScheduled = true;
			requestAnimationFrame(() => {
				flushScheduled = false;
				if (!pendingChunk) return;
				const chunk = pendingChunk;
				pendingChunk = "";
				safeSetMessages((prev) =>
					prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m)),
				);
			});
		};

		try {
			const response = await fetch(`${AI_BACKEND_URL}/api/ai/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: trimmed, session_id: sessionId }),
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) throw new Error("浏览器不支持流式响应");
			const decoder = new TextDecoder();

			let buffer = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunkText = decoder.decode(value, { stream: true });
				const fed = feedSse(buffer, chunkText);
				buffer = fed.buffer;
				for (const ev of fed.events) {
					if (ev.kind === "token") {
						pendingChunk += ev.value;
						scheduleFlush();
					} else if (ev.kind === "error") {
						safeSetMessages((prev) =>
							prev.map((m) => (m.id === assistantMsgId ? { ...m, content: `❌ ${ev.value}` } : m)),
						);
					}
					// kind === "done" 不做特殊处理, 后续 reader 会自然 done
				}
			}
			// 最终 flush
			if (pendingChunk) {
				const chunk = pendingChunk;
				pendingChunk = "";
				safeSetMessages((prev) =>
					prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m)),
				);
			}
		} catch (error) {
			// 超时由我们触发的 abort: 显示超时文案
			if (timedOut) {
				safeSetMessages((prev) =>
					prev.map((m) =>
						m.id === assistantMsgId
							? {
									...m,
									content: "⚠️ 响应超时，请重试或稍后再问。",
								}
							: m,
					),
				);
				return;
			}
			// 用户主动取消时静默
			if (controller.signal.aborted) return;
			const detail = error instanceof Error ? error.message : "未知错误";
			safeSetMessages((prev) =>
				prev.map((m) =>
					m.id === assistantMsgId
						? {
								...m,
								content: `⚠️ AI 助手暂时不可用，请稍后再试。\n（${detail}）`,
							}
						: m,
				),
			);
		} finally {
			window.clearTimeout(timeoutId);
			if (abortControllerRef.current === controller) {
				abortControllerRef.current = null;
			}
			if (isMountedRef.current) setIsStreaming(false);
		}
	}, [input, isStreaming, sessionId, safeSetMessages]);

	const handleReset = useCallback(async () => {
		// 取消正在进行的流
		abortControllerRef.current?.abort();
		try {
			await fetch(`${AI_BACKEND_URL}/api/ai/chat/reset?session_id=${encodeURIComponent(sessionId)}`, {
				method: "POST",
			});
		} catch {
			// 忽略错误，前端仍清空
		}
		safeSetMessages(() => [
			{
				id: "welcome",
				role: "assistant",
				content: "对话已重置。请问有什么可以帮助你的？",
				timestamp: new Date(),
			},
		]);
	}, [sessionId, safeSetMessages]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// 中文输入法合成阶段按 Enter 不应发送
			if (e.nativeEvent.isComposing) return;
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				void handleSend();
			}
		},
		[handleSend],
	);

	return (
		<>
			{/* ── 悬浮按钮 ── */}
			<motion.button
				ref={triggerButtonRef}
				type="button"
				data-testid="ai-chat-toggle"
				aria-label={isOpen ? "关闭 AI 助手" : "打开 AI 助手"}
				aria-expanded={isOpen}
				aria-controls="ai-chat-panel"
				onClick={() => setIsOpen((v) => !v)}
				className={cn(
					"fixed bottom-6 right-6 z-[9999]",
					"w-14 h-14 rounded-full",
					"bg-gradient-to-br from-violet-500 to-indigo-600",
					"text-white shadow-lg shadow-indigo-500/30",
					"flex items-center justify-center",
					"hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105",
					"active:scale-95",
					"transition-all duration-200",
				)}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
			>
				{isOpen ? (
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<title>关闭</title>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				) : (
					<svg
						width="26"
						height="26"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						aria-hidden="true"
					>
						<title>AI 助手</title>
						<path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
						<line x1="9" y1="22" x2="15" y2="22" />
						<line x1="10" y1="19" x2="10" y2="22" />
						<line x1="14" y1="19" x2="14" y2="22" />
						<circle cx="10" cy="9" r="1" fill="currentColor" />
						<circle cx="14" cy="9" r="1" fill="currentColor" />
					</svg>
				)}
			</motion.button>

			{/* ── 聊天窗口 ── */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						id="ai-chat-panel"
						role="dialog"
						aria-modal="false"
						aria-labelledby="ai-chat-title"
						data-testid="ai-chat-panel"
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className={cn(
							"fixed bottom-24 right-3 sm:right-6 z-[9998]",
							"w-[calc(100vw-1.5rem)] sm:w-[400px] max-w-[400px]",
							"h-[min(560px,calc(100vh-8rem))]",
							"flex flex-col",
							"rounded-2xl overflow-hidden",
							"bg-white/95 dark:bg-gray-900/95",
							"backdrop-blur-xl",
							"border border-gray-200/60 dark:border-gray-700/60",
							"shadow-2xl shadow-black/10 dark:shadow-black/30",
						)}
					>
						{/* ── Header ── */}
						<div
							className={cn(
								"flex items-center justify-between",
								"px-5 py-4",
								"bg-gradient-to-r from-violet-500 to-indigo-600",
								"text-white",
							)}
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<title>AI</title>
										<path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
										<circle cx="10" cy="9" r="1" fill="currentColor" />
										<circle cx="14" cy="9" r="1" fill="currentColor" />
									</svg>
								</div>
								<div>
									<div id="ai-chat-title" className="font-semibold text-sm">
										NexAsset AI 助手
									</div>
									<div className="text-xs text-white/70">RAG 知识检索 · LangChain</div>
								</div>
							</div>
							<button
								type="button"
								onClick={handleReset}
								title="重置对话"
								aria-label="重置对话"
								className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									aria-hidden="true"
								>
									<title>重置</title>
									<path d="M1 4v6h6" />
									<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
								</svg>
							</button>
						</div>

						{/* ── Messages ── */}
						<div
							ref={messagesContainerRef}
							className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
							aria-live="polite"
							aria-busy={isStreaming}
						>
							{messages.map((msg) => (
								<div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
									<div
										className={cn(
											"max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
											"whitespace-pre-wrap break-words",
											msg.role === "user"
												? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-br-md"
												: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md",
										)}
									>
										{msg.content || (
											<output className="inline-flex items-center gap-1 text-gray-400" aria-label="正在输入">
												<span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0ms]" />
												<span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:150ms]" />
												<span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:300ms]" />
											</output>
										)}
									</div>
								</div>
							))}
						</div>

						{/* ── Input ── */}
						<div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
							<div
								className={cn(
									"flex items-end gap-2",
									"bg-gray-50 dark:bg-gray-800/50",
									"rounded-xl px-3 py-2",
									"border border-gray-200 dark:border-gray-700",
									"focus-within:border-violet-400 dark:focus-within:border-violet-500",
									"transition-colors",
								)}
							>
								<textarea
									ref={inputRef}
									data-testid="ai-chat-input"
									aria-label="输入问题"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="输入问题，如：笔记本报修流程是什么？"
									disabled={isStreaming}
									rows={1}
									maxLength={MESSAGE_MAX_LENGTH}
									className={cn(
										"flex-1 bg-transparent resize-none",
										"text-sm text-gray-800 dark:text-gray-200",
										"placeholder:text-gray-400 dark:placeholder:text-gray-500",
										"outline-none",
										"max-h-24",
										"disabled:opacity-50",
									)}
									style={{ minHeight: "24px" }}
								/>
								<button
									type="button"
									onClick={() => void handleSend()}
									disabled={!input.trim() || isStreaming}
									aria-label="发送"
									className={cn(
										"flex-shrink-0 p-1.5 rounded-lg",
										"bg-gradient-to-br from-violet-500 to-indigo-600",
										"text-white",
										"hover:opacity-90 active:scale-95",
										"disabled:opacity-30 disabled:cursor-not-allowed",
										"transition-all",
									)}
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										aria-hidden="true"
									>
										<title>发送</title>
										<line x1="22" y1="2" x2="11" y2="13" />
										<polygon points="22 2 15 22 11 13 2 9 22 2" />
									</svg>
								</button>
							</div>
							<div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
								Powered by LangChain + ChromaDB RAG
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
