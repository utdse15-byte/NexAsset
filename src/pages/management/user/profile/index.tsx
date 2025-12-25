import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import bannerImage from "@/assets/images/background/banner-1.png";
import { Icon } from "@/components/icon";
import { useUserInfo } from "@/store/userStore";
import { themeVars } from "@/theme/theme.css";
import { Avatar, AvatarImage } from "@/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Text, Title } from "@/ui/typography";
import ConnectionsTab from "./connections-tab";
import ProfileTab from "./profile-tab";
import ProjectsTab from "./projects-tab";
import TeamsTab from "./teams-tab";

function UserProfile() {
	const { t } = useTranslation();
	const { avatar, username } = useUserInfo();

	const bgStyle: CSSProperties = {
		position: "absolute",
		inset: 0,
		background: `url(${bannerImage})`,
		backgroundSize: "cover",
		backgroundPosition: "50%",
		backgroundRepeat: "no-repeat",
	};

	const tabs = [
		{
			value: "1",
			icon: <Icon icon="solar:user-id-bold" size={24} className="mr-2" />,
			title: t("sys.nav.user.profile"),
			content: <ProfileTab />,
		},
		{
			value: "2",
			icon: <Icon icon="mingcute:profile-fill" size={24} className="mr-2" />,
			title: t("sys.management.user.profile.teams"),
			content: <TeamsTab />,
		},
		{
			value: "3",
			icon: <Icon icon="mingcute:profile-fill" size={24} className="mr-2" />,
			title: t("sys.management.user.profile.projects"),
			content: <ProjectsTab />,
		},
		{
			value: "4",
			icon: <Icon icon="mingcute:profile-fill" size={24} className="mr-2" />,
			title: t("sys.management.user.profile.connections"),
			content: <ConnectionsTab />,
		},
	];

	return (
		<Tabs defaultValue="1" className="w-full">
			<div className="relative flex flex-col justify-center items-center gap-4 p-4">
				<div style={bgStyle} className="h-full w-full z-1" />
				<div className="flex flex-col items-center justify-center gap-2 z-2">
					<Avatar className="h-24 w-24">
						<AvatarImage src={avatar} className="rounded-full" />
					</Avatar>
					<div className="flex flex-col justify-center items-center gap-2">
						<div className="flex items-center gap-2">
							<Title as="h5" className="text-xl">
								{username}
							</Title>
							<Icon icon="heroicons:check-badge-solid" size={20} color={themeVars.colors.palette.primary.default} />
						</div>
						<Text variant="body2">TS FullStack</Text>
					</div>
				</div>
				<TabsList className="z-5">
					{tabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.icon}
							{tab.title}
						</TabsTrigger>
					))}
				</TabsList>
			</div>

			{tabs.map((tab) => (
				<TabsContent key={tab.value} value={tab.value}>
					{tab.content}
				</TabsContent>
			))}
		</Tabs>
	);
}

export default UserProfile;
