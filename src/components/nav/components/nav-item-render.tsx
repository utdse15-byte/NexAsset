import { RouterLink } from "@/routes/components/router-link";
import type { NavItemProps } from "../types";

type NavItemRendererProps = {
	item: NavItemProps;
	className: string;
	children: React.ReactNode;
};

/**
 * Renderer for Navigation Items.
 * Handles disabled, external link, clickable child container, and internal link logic.
 */
export const NavItemRenderer: React.FC<NavItemRendererProps> = ({ item, className, children }) => {
	const { disabled, hasChild, path, onClick } = item;

	if (disabled) {
		return <div className={className}>{children}</div>;
	}

	if (hasChild) {
		// Vertical nav items with children are clickable containers
		return (
			// biome-ignore lint/a11y/useSemanticElements: Styling relies on div
			<div
				className={className}
				onClick={onClick}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && onClick?.(e as any)}
			>
				{children}
			</div>
		);
	}

	// Default: internal link
	return (
		<RouterLink href={path} className={className}>
			{children}
		</RouterLink>
	);
};
