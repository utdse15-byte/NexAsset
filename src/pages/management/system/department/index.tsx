import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Popconfirm, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import departmentService from "@/api/services/departmentService";
import { Icon } from "@/components/icon";
import type { Department } from "@/types/entity";
import { BasicStatus } from "@/types/enum";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Title } from "@/ui/typography";
import { DepartmentModal, type DepartmentModalProps } from "./department-modal";

export default function DepartmentPage() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const [departmentModalProps, setDepartmentModalProps] = useState<DepartmentModalProps>({
		formValue: {
			id: "",
			name: "",
			code: "",
			status: BasicStatus.ENABLE,
		},
		title: "Create Department",
		show: false,
		onOk: (_data: Department) => {
			setDepartmentModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setDepartmentModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	// Data Fetching
	const { data: departments = [], isLoading } = useQuery({
		queryKey: ["departments"],
		queryFn: () => departmentService.getDepartmentList(),
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: departmentService.createDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			toast.success(t("sys.api.createSuccess"));
			setDepartmentModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error(t("sys.api.createFailed"));
		},
	});

	const updateMutation = useMutation({
		mutationFn: departmentService.updateDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			toast.success(t("sys.api.updateSuccess"));
			setDepartmentModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: () => {
			toast.error(t("sys.api.updateFailed"));
		},
	});

	const deleteMutation = useMutation({
		mutationFn: departmentService.deleteDepartment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["departments"] });
			toast.success(t("sys.api.deleteSuccess"));
		},
		onError: () => {
			toast.error(t("sys.api.deleteFailed"));
		},
	});

	// Handlers
	const handleCreate = () => {
		setDepartmentModalProps((prev) => ({
			...prev,
			show: true,
			title: t("sys.management.system.department.create"),
			formValue: {
				id: "",
				name: "",
				code: "",
				status: BasicStatus.ENABLE,
			},
			onOk: (data: Department) => {
				createMutation.mutate(data);
			},
		}));
	};

	const handleEdit = (department: Department) => {
		setDepartmentModalProps({
			formValue: department,
			title: t("sys.management.system.department.edit"),
			show: true,
			onOk: (data: Department) => {
				updateMutation.mutate({ ...department, ...data });
			},
			onCancel: () => {
				setDepartmentModalProps((prev) => ({ ...prev, show: false }));
			},
		});
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id);
	};

	// Filtering
	const filteredDepartments = useMemo(() => {
		return departments.filter((department) => {
			const matchesSearch =
				department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				department.code.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "active" && department.status === BasicStatus.ENABLE) ||
				(statusFilter === "disabled" && department.status === BasicStatus.DISABLE);

			return matchesSearch && matchesStatus;
		});
	}, [departments, searchQuery, statusFilter]);

	const columns: ColumnsType<Department> = [
		{
			title: t("sys.management.system.department.name"),
			dataIndex: "name",
			key: "name",
			render: (text) => <span className="font-medium">{text}</span>,
		},
		{
			title: t("sys.management.system.department.code"),
			dataIndex: "code",
			key: "code",
			render: (text) => (
				<Badge variant="outline" className="font-mono text-xs">
					{text}
				</Badge>
			),
		},
		{
			title: t("sys.management.system.department.principal"),
			dataIndex: "principal",
			key: "principal",
			render: (text) => <span className="text-muted-foreground">{text || "-"}</span>,
		},
		{
			title: t("sys.management.system.department.status"),
			dataIndex: "status",
			key: "status",
			render: (status) => {
				const color = status === BasicStatus.ENABLE ? "success" : "error";
				return (
					<Tag color={color} className="border-none px-2 py-0.5 rounded-full font-semibold">
						{status === BasicStatus.ENABLE
							? t("sys.management.system.department.enable")
							: t("sys.management.system.department.disable")}
					</Tag>
				);
			},
		},
		{
			title: t("sys.management.system.department.action"),
			key: "action",
			align: "right",
			render: (_, record) => (
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-primary"
						onClick={() => handleEdit(record)}
					>
						<Icon icon="solar:pen-bold-duotone" size={16} />
					</Button>
					<Popconfirm
						title={t("sys.management.system.department.delete_confirm") || "Are you sure?"}
						onConfirm={() => handleDelete(record.id)}
						okText={t("common.okText")}
						cancelText={t("common.cancelText")}
					>
						<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
							<Icon icon="solar:trash-bin-trash-bold-duotone" size={16} />
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
						{t("sys.management.system.department.title")}
					</Title>
					<div className="text-muted-foreground text-sm">
						{t("sys.management.system.department.total") || "Total Departments"}: {departments.length}
					</div>
				</div>
				<Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
					<Icon icon="solar:users-group-two-rounded-bold-duotone" className="mr-2" size={20} />
					{t("sys.management.system.department.new")}
				</Button>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm">
				<Input
					placeholder="Search departments..."
					prefix={<Icon icon="solar:magnifer-linear" className="text-muted-foreground" />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full md:w-64"
					allowClear
				/>
				<Select
					value={statusFilter}
					onChange={setStatusFilter}
					style={{ width: 180 }}
					options={[
						{ label: "All Status", value: "all" },
						{ label: "Active", value: "active" },
						{ label: "Disabled", value: "disabled" },
					]}
				/>
				{(searchQuery || statusFilter !== "all") && (
					<Button
						variant="ghost"
						onClick={() => {
							setSearchQuery("");
							setStatusFilter("all");
						}}
						className="text-muted-foreground hover:text-destructive"
					>
						<Icon icon="solar:trash-bin-trash-bold" className="mr-2" />
						Clear
					</Button>
				)}
			</div>

			{/* Table */}
			<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
				<Table
					rowKey="id"
					columns={columns}
					dataSource={filteredDepartments}
					loading={isLoading}
					pagination={{ pageSize: 10 }}
					scroll={{ x: 800 }}
				/>
			</div>
			<DepartmentModal {...departmentModalProps} />
		</div>
	);
}
