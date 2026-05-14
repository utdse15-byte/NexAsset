import "./global.css";
import "./locales/i18n";
import "./theme/theme.css";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";

import { worker } from "./_mock";
import App from "./App";
import { registerLocalIcons } from "./components/icon";
import { GLOBAL_CONFIG } from "./global-config";
import ErrorBoundary from "./routes/components/error-boundary";
import { routesSection } from "./routes/sections";
import { urlJoin } from "./utils";

// 全局错误兜底: 记录最近一次未捕获错误到 window 全局, 便于 DevTools 复盘。
// 生产环境 esbuild drop console, 但 window 属性赋值不会被 drop。
declare global {
	interface Window {
		__nexassetLastError?: { kind: "error" | "rejection"; message: string; at: string; stack?: string };
	}
}
const captureGlobalError = (kind: "error" | "rejection", err: unknown) => {
	const msg = err instanceof Error ? err.message : String(err);
	const stack = err instanceof Error ? err.stack : undefined;
	window.__nexassetLastError = { kind, message: msg, at: new Date().toISOString(), stack };
	// 开发环境直接打 console; 生产环境 console.* 会被 drop, 这一行也无妨
	console.error(`[nexasset:${kind}]`, err);
};
window.addEventListener("error", (e) => captureGlobalError("error", e.error ?? e.message));
window.addEventListener("unhandledrejection", (e) => captureGlobalError("rejection", e.reason));

await registerLocalIcons();

// MSW 仅在开发环境启动, 生产环境不注册 mock service worker
if (import.meta.env.DEV) {
	await worker.start({
		onUnhandledRequest: "bypass",
		serviceWorker: { url: urlJoin(GLOBAL_CONFIG.publicPath, "mockServiceWorker.js") },
	});
}

const router = createBrowserRouter(
	[
		{
			Component: () => (
				<App>
					<Outlet />
				</App>
			),
			errorElement: <ErrorBoundary />,
			children: routesSection,
		},
	],
	{
		basename: GLOBAL_CONFIG.publicPath,
	},
);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
