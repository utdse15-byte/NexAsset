import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { DB_MENU } from "@/_mock/assets";
import type { MenuMetaInfo, MenuTree } from "@/types/entity";
import { PermissionType } from "@/types/enum";
import { convertFlatToTree } from "@/utils/tree";
import { Component } from "./utils";

/**
 * get route path from menu path and parent path
 * @param menuPath '/a/b/c'
 * @param parentPath '/a/b'
 * @returns '/c'
 *
 * @example
 * getRoutePath('/a/b/c', '/a/b') // '/c'
 */
const getRoutePath = (menuPath?: string, parentPath?: string) => {
	const menuPathArr = menuPath?.split("/").filter(Boolean) || [];
	const parentPathArr = parentPath?.split("/").filter(Boolean) || [];

	// remove parentPath items from menuPath
	const result = menuPathArr.slice(parentPathArr.length).join("/");
	return result;
};

/**
 * generate props for menu component
 * @param metaInfo
 * @returns
 */
type ComponentProps = {
	src?: string;
};

/**
 * generate props for menu component
 * @param metaInfo
 * @returns
 */
const generateProps = (metaInfo: MenuMetaInfo): ComponentProps => {
	const props: ComponentProps = {};
	if (metaInfo.externalLink) {
		props.src = metaInfo.externalLink?.toString() || "";
	}
	return props;
};

/**
 * convert menu to route
 * @param items
 * @param parent
 * @returns
 */
const convertToRoute = (items: MenuTree[], parent?: MenuTree): RouteObject[] => {
	const routes: RouteObject[] = [];

	const processItem = (item: MenuTree) => {
		// if group, process children
		if (item.type === PermissionType.GROUP) {
			for (const child of item.children || []) {
				processItem(child);
			}
		}

		// if catalogue, process children
		if (item.type === PermissionType.CATALOGUE) {
			const children = item.children || [];
			if (children.length > 0) {
				const firstChild = children[0];
				if (firstChild.path) {
					routes.push({
						path: getRoutePath(item.path, parent?.path),
						children: [
							{
								index: true,
								element: <Navigate to={getRoutePath(firstChild.path, item.path)} replace />,
							},
							...convertToRoute(children, item),
						],
					});
				}
			}
		}

		// if menu, create route
		if (item.type === PermissionType.MENU) {
			const props = generateProps(item);

			routes.push({
				path: getRoutePath(item.path, parent?.path),
				element: Component(item.component, props),
			});
		}
	};

	for (const item of items) {
		processItem(item);
	}
	return routes;
};

/**
 * Backend dashboard route generator.
 *
 * ⚠ 当前实现是"静态"的: 直接读取本地 mock 数据 (DB_MENU) 同步生成路由树。
 * routerMode === "backend" 仅在语义上表示"未来由后端 /api/menu 提供",
 * 真实接入后端时需要把数据来源换成异步加载结果, 并在 main.tsx 启动时
 * 等待菜单返回后再 createBrowserRouter (或改用 lazy route)。在改造前请务必确保:
 *   1. 菜单加载失败时有降级策略 (例如回退到 frontend 路由表);
 *   2. 加载期间 UI 不闪烁 (建议加全屏 loading);
 *   3. 401 时菜单接口被拦截后不会卡死。
 */
export function getBackendDashboardRoutes() {
	const backendDashboardRoutes = convertToRoute(convertFlatToTree(DB_MENU));
	return backendDashboardRoutes;
}
