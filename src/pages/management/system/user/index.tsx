import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Popconfirm, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import type { Role_Old, User } from "@/types/entity";
import { BasicStatus } from "@/types/enum";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Title } from "@/ui/typography";
import { UserModal, type UserModalProps } from "./user-modal";

export default function UserPage() {
	const { t } = useTranslation();
	const { push } = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();

	const [searchText, setSearchText] = useState("");
	const [statusFilter, setStatusFilter] = useState<BasicStatus | null>(null);

	const [userModalProps, setUserModalProps] = useState<UserModalProps>({
		formValue: {
			id: "",
			username: "",
			email: "",
			password: "",
			status: BasicStatus.ENABLE,
		},
		title: "Create User",
		show: false,
		onOk: (_data: User) => {
			setUserModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setUserModalProps((prev) => ({ ...prev, show: false }));
		},
	});

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
			toast.success(t("sys.management.system.user.create_success"));
			setUserModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error(t("sys.management.system.user.create_failed"));
		},
	});

	const updateMutation = useMutation({
		mutationFn: userService.updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(t("sys.management.system.user.update_success"));
			setUserModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error(t("sys.management.system.user.update_failed"));
		},
	});

	const deleteMutation = useMutation({
		mutationFn: userService.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(t("sys.management.system.user.delete_success"));
		},
		onError: () => {
			toast.error(t("sys.management.system.user.delete_failed"));
		},
	});

	// Handlers
	const handleCreate = () => {
		setUserModalProps((prev) => ({
			...prev,
			show: true,
			title: t("sys.management.system.user.new"),
			formValue: {
				id: "",
				username: "",
				email: "",
				password: "",
				status: BasicStatus.ENABLE,
			},
			onOk: (data: User) => {
				createMutation.mutate(data);
			},
		}));
	};

	const handleEdit = (user: User) => {
		setUserModalProps({
			formValue: user,
			title: t("sys.management.system.user.edit"),
			show: true,
			onOk: (data: User) => {
				updateMutation.mutate({ ...user, ...data });
			},
			onCancel: () => {
				setUserModalProps((prev) => ({ ...prev, show: false }));
			},
		});
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id);
	};

	// Filter Logic
	const filteredData = useMemo(() => {
		if (!users) return [];
		return users.filter((item) => {
			const matchesSearch =
				item.username.toLowerCase().includes(searchText.toLowerCase()) ||
				item.email.toLowerCase().includes(searchText.toLowerCase());
			const matchesStatus = statusFilter !== null ? item.status === statusFilter : true;
			return matchesSearch && matchesStatus;
		});
	}, [users, searchText, statusFilter]);

	const columns: ColumnsType<User> = [
		{
			title: t("sys.management.system.user.name"),
			dataIndex: "username",
			width: 300,
			render: (_, record) => {
				return (
					<div className="flex">
						<img alt="" src={record.avatar} className="h-10 w-10 rounded-full" />
						<div className="ml-2 flex flex-col">
							<span className="text-sm font-medium">{record.username}</span>
							<span className="text-xs text-muted-foreground">{record.email}</span>
						</div>
					</div>
				);
			},
		},
		{
			title: t("sys.management.system.user.role"),
			dataIndex: "role",
			align: "center",
			width: 120,
			render: (role: Role_Old) => <Badge variant="secondary">{role?.name || "User"}</Badge>,
		},
		{
			title: t("sys.management.system.user.status"),
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => {
				const color = status === BasicStatus.DISABLE ? "error" : "success";
				return (
					<Tag color={color} className="border-none px-2 py-0.5 rounded-full font-semibold">
						{status === BasicStatus.DISABLE
							? t("sys.management.system.user.disable")
							: t("sys.management.system.user.enable")}
					</Tag>
				);
			},
		},
		{
			title: t("sys.management.system.user.action"),
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/${record.id}`);
						}}
						className="text-muted-foreground hover:text-primary"
					>
						<Icon icon="mdi:card-account-details" size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => handleEdit(record)}
						className="text-muted-foreground hover:text-primary"
					>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Popconfirm
						title={t("sys.management.system.user.delete_confirm")}
						onConfirm={() => handleDelete(record.id)}
						okText={t("common.okText")}
						cancelText={t("common.cancelText")}
					>
						<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
							<Icon icon="mingcute:delete-2-fill" size={18} />
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<div className="flex flex-col gap-4 p-2">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<Title as="h2" className="text-3xl font-bold tracking-tight">
						{t("sys.management.system.user.title")}
					</Title>
					<div className="text-muted-foreground text-sm">
						{t("sys.management.system.user.total") || "Total Users"}: {users.length}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Button onClick={handleCreate} className="shadow-none">
						<Icon icon="mingcute:add-line" className="mr-2" size={18} />
						{t("sys.management.system.user.new")}
					</Button>
				</div>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm">
				<Input
					placeholder={t("sys.management.system.user.search") || "Search users..."}
					prefix={<Icon icon="solar:magnifer-linear" className="text-muted-foreground" />}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					className="w-full md:w-64"
					allowClear
				/>
				<Select
					placeholder={t("sys.management.system.user.filterStatus") || "Filter Status"}
					style={{ width: 150 }}
					allowClear
					value={statusFilter}
					onChange={setStatusFilter}
					options={[
						{ label: t("sys.management.system.user.enable"), value: BasicStatus.ENABLE },
						{ label: t("sys.management.system.user.disable"), value: BasicStatus.DISABLE },
					]}
				/>
				{(searchText || statusFilter) && (
					<Button
						variant="ghost"
						onClick={() => {
							setSearchText("");
							setStatusFilter(null);
						}}
						className="text-muted-foreground hover:text-destructive"
					>
						<Icon icon="solar:trash-bin-trash-bold" className="mr-2" />
						{t("sys.assets.inventory.clearFilters") || "Clear"}
					</Button>
				)}
			</div>

			{/* Table */}
			<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={{ pageSize: 10 }}
					columns={columns}
					dataSource={filteredData}
					loading={isLoading}
				/>
			</div>
			<UserModal {...userModalProps} />
		</div>
	);
}
