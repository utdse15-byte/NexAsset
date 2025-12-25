import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import userService from "@/api/services/userService";
import { Icon } from "@/components/icon";
import { useRouter } from "@/routes/hooks";
import { BasicStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function UserDetail() {
	const { t } = useTranslation();
	const { back } = useRouter();
	const { id } = useParams();

	const { data: user, isLoading } = useQuery({
		queryKey: ["user", id],
		queryFn: () => userService.findById(id || ""),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-8 w-[200px]" />
				</CardHeader>
				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-[300px]" />
					<Skeleton className="h-4 w-[250px]" />
					<Skeleton className="h-20 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!user) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center text-muted-foreground">{t("sys.api.errMsg404")}</div>
					<div className="mt-4 text-center">
						<Button onClick={back} variant="outline">
							{t("sys.common.back")}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// The API returns an array for findById based on the type definition in userService,
	// but usually findById returns a single object.
	// Let's handle both cases just to be safe, assuming the first item if it's an array.
	// Cast to any to avoid type mismatch between UserInfo (roles) and mock data (role)
	const userData = (Array.isArray(user) ? user[0] : user) as any;

	if (!userData) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center text-muted-foreground">{t("sys.api.errMsg404")}</div>
					<div className="mt-4 text-center">
						<Button onClick={back} variant="outline">
							{t("sys.common.back")}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>{t("sys.nav.system.user_detail")}</CardTitle>
				<Button onClick={back} variant="outline" size="sm">
					<Icon icon="solar:arrow-left-linear" className="mr-2" />
					{t("sys.common.back")}
				</Button>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-6">
					<div className="flex items-center gap-4">
						<img
							src={userData.avatar}
							alt={userData.username}
							className="h-20 w-20 rounded-full border-2 border-border"
						/>
						<div>
							<h2 className="text-2xl font-bold">{userData.username}</h2>
							<p className="text-muted-foreground">{userData.email}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-1">
							<div className="text-sm font-medium text-muted-foreground">{t("sys.management.system.user.role")}</div>
							<div className="font-medium">{userData.role?.name || "User"}</div>
						</div>

						<div className="space-y-1">
							<div className="text-sm font-medium text-muted-foreground">{t("sys.management.system.user.status")}</div>
							<div>
								{/* Use hardcoded text for status or map to translations if available */}
								{userData.status === BasicStatus.DISABLE
									? t("sys.management.system.user.disable")
									: t("sys.management.system.user.enable")}
							</div>
						</div>

						<div className="space-y-1">
							<div className="text-sm font-medium text-muted-foreground">User ID</div>
							<div className="font-mono text-sm">{userData.id}</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
