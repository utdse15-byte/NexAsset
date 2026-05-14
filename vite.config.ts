/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const base = env.VITE_APP_PUBLIC_PATH || "/";
	const isProduction = mode === "production";
	// 开发期: AI 后端默认本地 8000; 通过 vite 代理使前端可走同源 /api/ai
	const aiBackendTarget = env.VITE_DEV_AI_BACKEND_PROXY_TARGET || "http://localhost:8000";

	return {
		base,
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./src/setupTests.ts"],
		},
		plugins: [
			react(),
			vanillaExtractPlugin({
				identifiers: ({ debugId }) => `${debugId}`,
			}),
			tailwindcss(),
			tsconfigPaths(),

			isProduction &&
				visualizer({
					open: true,
					gzipSize: true,
					brotliSize: true,
					template: "treemap",
				}),
		].filter(Boolean),

		server: {
			open: true,
			host: true,
			port: 3001,
			proxy: {
				// AI 后端: 与 nginx.conf 行为对齐, 让前端 fetch("/api/ai/...") 在开发与生产一致
				"/api/ai": {
					target: aiBackendTarget,
					changeOrigin: true,
					ws: false,
					// SSE 流式: 不走默认缓冲
					configure: (proxy) => {
						proxy.on("proxyReq", (proxyReq) => {
							proxyReq.setHeader("X-Forwarded-Proto", "http");
						});
					},
				},
			},
		},

		build: {
			target: "esnext",
			minify: "esbuild",
			sourcemap: !isProduction,
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					manualChunks: {
						"vendor-core": ["react", "react-dom", "react-router"],
						"vendor-ui": ["antd", "@ant-design/cssinjs"],
						"vendor-utils": ["axios", "dayjs", "i18next", "zustand", "@iconify/react"],
						"vendor-charts": ["apexcharts", "react-apexcharts"],
					},
				},
			},
		},

		optimizeDeps: {
			include: ["react", "react-dom", "react-router", "antd", "axios", "dayjs"],
			exclude: ["@iconify/react"],
		},

		esbuild: {
			drop: isProduction ? ["console", "debugger"] : [],
			legalComments: "none",
			target: "esnext",
		},
	};
});
