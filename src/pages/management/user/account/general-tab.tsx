import { faker } from "@faker-js/faker";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { UploadAvatar } from "@/components/upload";
import { useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardFooter } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import { Text } from "@/ui/typography";

type FieldType = {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	code?: string;
	about: string;
};

export default function GeneralTab() {
	const { t } = useTranslation();
	const { avatar, username, email } = useUserInfo();
	const form = useForm<FieldType>({
		defaultValues: {
			name: username,
			email,
			phone: faker.phone.number(),
			address: faker.location.county(),
			city: faker.location.city(),
			code: faker.location.zipCode(),
			about: faker.lorem.paragraphs(),
		},
	});

	const handleClick = () => {
		toast.success(t("sys.management.user.account.general.updateSuccess"));
	};

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<div className="col-span-1">
				<Card className="flex-col items-center px-6! pb-10! pt-20!">
					<UploadAvatar defaultAvatar={avatar} />

					<div className="flex items-center py-6 gap-2 w-40">
						<Text variant="body1">{t("sys.management.user.account.general.publicProfile")}</Text>
						<Switch />
					</div>

					<Button variant="destructive" className="w-40">
						{t("sys.management.user.account.general.deleteUser")}
					</Button>
				</Card>
			</div>
			<div className="col-span-1">
				<Card>
					<CardContent>
						<Form {...form}>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.username")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.email")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.phone")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.address")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.city")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.code")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
							<div className="mt-4">
								<FormField
									control={form.control}
									name="about"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("sys.management.user.account.general.about")}</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</Form>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button onClick={handleClick}>{t("sys.management.user.account.general.saveChanges")}</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
