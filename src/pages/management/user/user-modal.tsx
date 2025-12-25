import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { User } from "@/types/entity";
import { BasicStatus } from "@/types/enum";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";

const userSchema = z.object({
	username: z.string().min(2, "Username must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
	role: z.string().min(1, "Role is required"),
	status: z.nativeEnum(BasicStatus),
	avatar: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: User | null;
	onSubmit: (data: UserFormValues) => void;
}

export function UserModal({ open, onOpenChange, user, onSubmit }: UserModalProps) {
	const isEdit = !!user;

	const form = useForm<UserFormValues>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			role: "",
			status: BasicStatus.ENABLE,
			avatar: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				username: user.username,
				email: user.email,
				role: user.role?.id || "", // Assuming we store role ID or code
				status: user.status ?? BasicStatus.ENABLE,
				avatar: user.avatar,
			});
		} else {
			form.reset({
				username: "",
				email: "",
				password: "",
				role: "",
				status: BasicStatus.ENABLE,
				avatar: "",
			});
		}
	}, [user, form]);

	const handleSubmit = (data: UserFormValues) => {
		onSubmit(data);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
					<DialogDescription>
						{isEdit ? "Make changes to the user profile here." : "Add a new user to the system."}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input placeholder="jdoe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="john@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{!isEdit && (
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" placeholder="******" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="role_admin_id">Admin</SelectItem>
											<SelectItem value="role_test_id">Test</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel>Active Status</FormLabel>
									</div>
									<FormControl>
										<Switch
											checked={field.value === BasicStatus.ENABLE}
											onCheckedChange={(checked) => field.onChange(checked ? BasicStatus.ENABLE : BasicStatus.DISABLE)}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit">{isEdit ? "Save changes" : "Create User"}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
