import { NavHorizontal } from "@/components/nav";
import type { NavProps } from "@/components/nav/types";
import { ScrollArea, ScrollBar } from "@/ui/scroll-area";

export function NavHorizontalLayout({ data }: NavProps) {
	return (
		<nav
			data-slot="nexasset-layout-nav"
			className={
				"glass rounded-2xl mx-4 z-app-bar sticky top-[calc(var(--layout-header-height)+32px)] flex items-center justify-center"
			}
		>
			<ScrollArea className="whitespace-nowrap px-2">
				<NavHorizontal data={data} />
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</nav>
	);
}
