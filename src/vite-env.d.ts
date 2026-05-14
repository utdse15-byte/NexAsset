/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Default route path for the application */
	readonly VITE_APP_DEFAULT_ROUTE: string;
	/** Public path for static assets */
	readonly VITE_APP_PUBLIC_PATH: string;
	/** Base URL for API endpoints */
	readonly VITE_APP_API_BASE_URL: string;
	/** Routing mode: frontend routing or backend routing */
	readonly VITE_APP_ROUTER_MODE: "frontend" | "backend";
	/**
	 * AI backend URL. Leave empty to use same-origin `/api/ai` (recommended,
	 * proxied by Nginx in production / Vite in dev). Set to e.g. `http://localhost:8000`
	 * only when bypassing the proxy for debugging.
	 *
	 * ⚠ All `VITE_*` variables are inlined into the public bundle. Never store secrets here.
	 */
	readonly VITE_AI_BACKEND_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
