import { ThemeLayout } from "#/enum";
import Logo from "@/components/logo";
import { down, useMediaQuery } from "@/hooks";
import { useSettings } from "@/store/settingStore";
import Header from "./header";
import Main from "./main";
import { NavHorizontalLayout, NavMobileLayout, NavVerticalLayout, useFilteredNavData } from "./nav";

export default function DashboardLayout() {
	const isMobile = useMediaQuery(down("md"));

	return (
		<div
			data-slot="nexasset-layout-root"
			className="w-full min-h-screen bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background dark:from-indigo-950 dark:via-background dark:to-background"
		>
			{isMobile ? <MobileLayout /> : <PcLayout />}
		</div>
	);
}

function MobileLayout() {
	const navData = useFilteredNavData();
	return (
		<>
			{/* Sticky Header */}
			<Header leftSlot={<NavMobileLayout data={navData} />} />
			<Main />
		</>
	);
}

function PcLayout() {
	const { themeLayout } = useSettings();

	if (themeLayout === ThemeLayout.Horizontal) return <PcHorizontalLayout />;
	return <PcVerticalLayout />;
}

function PcHorizontalLayout() {
	const navData = useFilteredNavData();
	return (
		<>
			{/* Sticky Header */}
			<Header leftSlot={<Logo />} />
			{/* Sticky Nav */}
			<NavHorizontalLayout data={navData} />

			<Main />
		</>
	);
}

function PcVerticalLayout() {
	const settings = useSettings();
	const { themeLayout } = settings;
	const navData = useFilteredNavData();

	const mainPaddingLeft =
		themeLayout === ThemeLayout.Vertical
			? "calc(var(--layout-nav-width) + 32px)"
			: "calc(var(--layout-nav-width-mini) + 32px)";

	return (
		<>
			{/* Fixed Header */}
			<NavVerticalLayout data={navData} />

			<div
				className="relative w-full min-h-screen flex flex-col transition-[padding] duration-300 ease-in-out"
				style={{
					paddingLeft: mainPaddingLeft,
				}}
			>
				<Header />
				<Main />
			</div>
		</>
	);
}
