import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { Card, CardContent, CardFooter } from "@/ui/card";
import { Switch } from "@/ui/switch";

export default function NotificationsTab() {
	const { t } = useTranslation();
	const handleClick = () => {
		toast.success(t("sys.management.user.account.general.updateSuccess"));
	};
	return (
		<Card>
			<CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div className="flex-1">
					<h4>{t("sys.management.user.account.notifications.activity")}</h4>
					<p className="text-text-secondary">{t("sys.management.user.account.notifications.activityDesc")}</p>
				</div>
				<div className="flex-2">
					<div className="flex w-full flex-col gap-4 rounded-lg px-6 py-8 bg-bg-neutral">
						<div className="flex w-full justify-between">
							<div>{t("sys.management.user.account.notifications.emailAnswers")}</div>
							<Switch defaultChecked />
						</div>
						<div className="flex w-full justify-between">
							<div>{t("sys.management.user.account.notifications.emailComments")}</div>
							<Switch />
						</div>
						<div className="flex w-full justify-between">
							<div>{t("sys.management.user.account.notifications.emailFollows")}</div>
							<Switch defaultChecked />
						</div>
					</div>
				</div>

				<div className="flex-1">
					<h4>{t("sys.management.user.account.notifications.applications")}</h4>
					<p className="text-text-secondary">{t("sys.management.user.account.notifications.applicationsDesc")}</p>
				</div>
				<div className="flex-2">
					<div className="flex w-full flex-col gap-4 rounded-lg px-6 py-8 bg-bg-neutral">
						<div className="flex w-full justify-between">
							<div>{t("sys.management.user.account.notifications.news")}</div>
							<Switch />
						</div>
						<div className="flex w-full justify-between">
							<div>{t("sys.management.user.account.notifications.productUpdates")}</div>
							<Switch defaultChecked />
						</div>
						<div className="flex w-full justify-between">
							<div>{t("sys.management.user.account.notifications.blogDigest")}</div>
							<Switch />
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex w-full justify-end">
				<Button onClick={handleClick}>{t("sys.management.user.account.general.saveChanges")}</Button>
			</CardFooter>
		</Card>
	);
}
