import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

type FieldType = {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export default function SecurityTab() {
	const { t } = useTranslation();
	const form = useForm<FieldType>({
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = () => {
		// Handle form submission here
		toast.success(t("sys.management.user.account.general.updateSuccess"));
	};

	return (
		<Card>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="oldPassword"
							rules={{ required: t("sys.management.user.account.security.oldPasswordRequired") }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("sys.management.user.account.security.oldPassword")}</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="newPassword"
							rules={{ required: t("sys.management.user.account.security.newPasswordRequired") }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("sys.management.user.account.security.newPassword")}</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							rules={{
								required: t("sys.management.user.account.security.confirmPasswordRequired"),
								validate: (value) =>
									value === form.getValues("newPassword") || t("sys.management.user.account.security.passwordMismatch"),
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("sys.management.user.account.security.confirmPassword")}</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex w-full justify-end">
							<Button type="submit">{t("sys.management.user.account.general.saveChanges")}</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
