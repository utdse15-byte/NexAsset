import { breakpointsTokens } from "./src/theme/tokens/breakpoints";
import { HtmlDataAttribute } from "./src/types/enum";
import { createColorChannel, createTailwindConfig } from "./src/utils/theme";

export default {
	darkMode: ["selector", `[${HtmlDataAttribute.ThemeMode}='dark']`],
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		fontFamily: createTailwindConfig("typography.fontFamily"),
		extend: {
			colors: {
				// nexasset theme tokens
				primary: createColorChannel("colors.palette.primary"),
				success: createColorChannel("colors.palette.success"),
				warning: createColorChannel("colors.palette.warning"),
				error: createColorChannel("colors.palette.error"),
				info: createColorChannel("colors.palette.info"),
				gray: createColorChannel("colors.palette.gray"),
				common: createColorChannel("colors.common"),
				text: createColorChannel("colors.text"),
				bg: createColorChannel("colors.background"),
				action: createTailwindConfig("colors.action"),

				// shadcn ui theme tokens
				background: "var(--background)",
				foreground: "var(--foreground)",
				card: "var(--card)",
				cardForeground: "var(--card-foreground)",
				popover: "var(--popover)",
				popoverForeground: "var(--popover-foreground)",
				primaryForeground: "var(--primary-foreground)",
				secondary: "var(--secondary)",
				secondaryForeground: "var(--secondary-foreground)",
				muted: "var(--muted)",
				mutedForeground: "var(--muted-foreground)",
				accent: "var(--accent)",
				accentForeground: "var(--accent-foreground)",
				destructive: "var(--destructive)",
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				chart1: "var(--chart-1)",
				chart2: "var(--chart-2)",
				chart3: "var(--chart-3)",
				chart4: "var(--chart-4)",
				chart5: "var(--chart-5)",
				sidebar: "var(--sidebar)",
				sidebarForeground: "var(--sidebar-foreground)",
				sidebarPrimary: "var(--sidebar-primary)",
				sidebarPrimaryForeground: "var(--sidebar-primary-foreground)",
				sidebarAccent: "var(--sidebar-accent)",
				sidebarAccentForeground: "var(--sidebar-accent-foreground)",
				sidebarBorder: "var(--sidebar-border)",
				sidebarRing: "var(--sidebar-ring)",
			},
			opacity: createTailwindConfig("opacity"),
			borderRadius: createTailwindConfig("borderRadius"),
			boxShadow: createTailwindConfig("shadows"),
			spacing: createTailwindConfig("spacing"),
			zIndex: createTailwindConfig("zIndex"),
			screens: breakpointsTokens,
		},
	},
};
