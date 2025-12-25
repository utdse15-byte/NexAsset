import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import LocalePicker from "@/components/locale-picker";
import { useSettings } from "@/store/settingStore";
import { Button } from "@/ui/button";
import { cn } from "@/utils";
import AccountDropdown from "../components/account-dropdown";
import BreadCrumb from "../components/bread-crumb";
import NoticeButton from "../components/notice";
import SearchBar from "../components/search-bar";
import SettingButton from "../components/setting-button";

interface HeaderProps {
	leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
	const { breadCrumb } = useSettings();
	return (
		<header
			data-slot="nexasset-layout-header"
			className={cn(
				"sticky top-4 z-app-bar",
				"flex items-center justify-between px-4 grow-0 shrink-0",
				"glass rounded-2xl mx-4 mb-4",
				"h-[var(--layout-header-height)] ",
			)}
		>
			<div className="flex items-center">
				{leftSlot}

				<div className="hidden md:block ml-4">{breadCrumb && <BreadCrumb />}</div>
			</div>

			<div className="flex items-center gap-1">
				<SearchBar />
				<LocalePicker />
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full"
					onClick={() => window.open("https://github.com/your-org/nexasset")}
				>
					<Icon icon="mdi:github" size={24} />
				</Button>
				<Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.open("https://discord.com")}>
					<Icon icon="carbon:logo-discord" size={24} />
				</Button>
				<NoticeButton />
				<SettingButton />
				<AccountDropdown />
			</div>
		</header>
	);
}
