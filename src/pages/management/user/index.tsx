import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import userService from "@/api/services/userService";
import Icon from "@/components/icon/icon";
import type { User } from "@/types/entity";
import { BasicStatus } from "@/types/enum";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { UserModal } from "./user-modal";

export default function UserManagementPage() {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	// Data Fetching
	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => userService.getUserList(),
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: userService.createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User created successfully");
		},
		onError: () => {
			toast.error("Failed to create user");
		},
	});

	const updateMutation = useMutation({
		mutationFn: userService.updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User updated successfully");
		},
		onError: () => {
			toast.error("Failed to update user");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: userService.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete user");
		},
	});

	// Handlers
	const handleCreate = () => {
		setEditingUser(null);
		setIsModalOpen(true);
	};

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setIsModalOpen(true);
	};

	const handleDelete = (id: string) => {
		if (window.confirm("Are you sure you want to delete this user?")) {
			deleteMutation.mutate(id);
		}
	};

	const handleFormSubmit = (data: any) => {
		if (editingUser) {
			updateMutation.mutate({ ...editingUser, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	// Filtering
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(user.role?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

		const matchesRole = roleFilter === "all" || user.role?.id === roleFilter;
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "active" && user.status === BasicStatus.ENABLE) ||
			(statusFilter === "disabled" && user.status === BasicStatus.DISABLE);

		return matchesSearch && matchesRole && matchesStatus;
	});

	return (
		<div className="p-2 space-y-6">
			<Card className="bg-card/50 backdrop-blur-sm border-border shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-2xl font-bold">User Management</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
					</div>
					<Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
						<Icon icon="solar:user-plus-bold-duotone" className="mr-2" size={20} />
						Add User
					</Button>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<Icon
								icon="solar:magnifer-linear"
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
								size={18}
							/>
							<Input
								placeholder="Search users..."
								className="pl-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<Select value={roleFilter} onValueChange={setRoleFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by Role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="role_admin_id">Admin</SelectItem>
								<SelectItem value="role_test_id">Test</SelectItem>
							</SelectContent>
						</Select>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="disabled">Disabled</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Table */}
					<div className="rounded-md border overflow-hidden">
						<table className="w-full text-sm text-left">
							<thead className="bg-muted/50 text-muted-foreground font-medium">
								<tr>
									<th className="px-4 py-3">User</th>
									<th className="px-4 py-3">Role</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{isLoading ? (
									<tr>
										<td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
											Loading users...
										</td>
									</tr>
								) : filteredUsers.length === 0 ? (
									<tr>
										<td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
											No users found.
										</td>
									</tr>
								) : (
									filteredUsers.map((user) => (
										<tr key={user.id} className="hover:bg-muted/30 transition-colors">
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<Avatar className="h-9 w-9 border border-border">
														<AvatarImage src={user.avatar} alt={user.username} />
														<AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-medium text-foreground">{user.username}</div>
														<div className="text-xs text-muted-foreground">{user.email}</div>
													</div>
												</div>
											</td>
											<td className="px-4 py-3">
												<Badge
													variant="secondary"
													className={
														user.role?.code === "SUPER_ADMIN"
															? "bg-red-100 text-red-700 hover:bg-red-100/80"
															: "bg-blue-100 text-blue-700 hover:bg-blue-100/80"
													}
												>
													{user.role?.name || "User"}
												</Badge>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<span
														className={`h-2 w-2 rounded-full ${
															user.status === BasicStatus.ENABLE ? "bg-emerald-500" : "bg-slate-300"
														}`}
													/>
													<span className="text-muted-foreground">
														{user.status === BasicStatus.ENABLE ? "Active" : "Disabled"}
													</span>
												</div>
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-primary"
														onClick={() => handleEdit(user)}
													>
														<Icon icon="solar:pen-bold-duotone" size={16} />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-destructive"
														onClick={() => handleDelete(user.id)}
													>
														<Icon icon="solar:trash-bin-trash-bold-duotone" size={16} />
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<UserModal open={isModalOpen} onOpenChange={setIsModalOpen} user={editingUser} onSubmit={handleFormSubmit} />
		</div>
	);
}
