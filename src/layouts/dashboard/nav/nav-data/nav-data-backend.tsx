import { DB_MENU } from "@/_mock/assets";
import { Icon } from "@/components/icon";
import type { NavItemDataProps, NavProps } from "@/components/nav";
import type { MenuTree } from "@/types/entity";
import { Badge } from "@/ui/badge";
import { convertFlatToTree } from "@/utils/tree";

const convertChildren = (children?: MenuTree[]): NavItemDataProps[] => {
	if (!children?.length) return [];

	return children.map((child) => ({
		title: child.name,
		path: child.path || "",
		icon: child.icon ? typeof child.icon === "string" ? <Icon icon={child.icon} size="24" /> : child.icon : null,
		caption: child.caption,
		info: child.info ? <Badge variant="default">{child.info}</Badge> : null,
		disabled: child.disabled,
		externalLink: child.externalLink,
		auth: child.auth,
		hidden: child.hidden,
		children: convertChildren(child.children),
	}));
};

const convert = (menuTree: MenuTree[]): NavProps["data"] => {
	return menuTree.map((item) => ({
		name: item.name,
		items: convertChildren(item.children),
	}));
};

/**
 * Backend nav data.
 *
 * ⚠ 与 routes/sections/dashboard/backend.tsx 一致, 这里也是"静态"实现:
 * 直接读 DB_MENU 同步生成导航数据。routerMode === "backend" 当前并不真正
 * 调用 /api/menu。要切到真后端时必须把 backendNavData 改成 hook 形式 (例如
 * useBackendNavData() 内部用 react-query), 并让 nav 组件等待数据。
 */
export const backendNavData: NavProps["data"] = convert(convertFlatToTree(DB_MENU));
