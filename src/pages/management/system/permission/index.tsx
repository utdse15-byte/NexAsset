import Table, { type ColumnsType } from "antd/es/table";
import { isNil } from "ramda";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Permission_Old } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import PermissionModal, { type PermissionModalProps } from "./permission-modal";

const defaultPermissionValue: Permission_Old = {
	id: "",
	parentId: "",
	name: "",
	label: "",
	route: "",
	component: "",
	icon: "",
	hide: false,
	status: BasicStatus.ENABLE,
	type: PermissionType.CATALOGUE,
};
export default function PermissionPage() {
	// const permissions = useUserPermission();
	const { t } = useTranslation();

	const [permissionModalProps, setPermissionModalProps] = useState<PermissionModalProps>({
		formValue: { ...defaultPermissionValue },
		title: t("sys.management.system.permission.new"),
		show: false,
		onOk: () => {
			setPermissionModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setPermissionModalProps((prev) => ({ ...prev, show: false }));
		},
	});
	const columns: ColumnsType<Permission_Old> = [
		{
			title: t("sys.management.system.permission.name"),
			dataIndex: "name",
			width: 300,
			render: (_, record) => <div>{t(record.label)}</div>,
		},
		{
			title: t("sys.management.system.permission.type"),
			dataIndex: "type",
			width: 60,
			render: (_, record) => <Badge variant="info">{PermissionType[record.type]}</Badge>,
		},
		{
			title: t("sys.management.system.permission.icon"),
			dataIndex: "icon",
			width: 60,
			render: (icon: string) => {
				if (isNil(icon)) return "";
				if (icon.startsWith("ic")) {
					return <Icon icon={`local:${icon}`} size={18} className="ant-menu-item-icon" />;
				}
				return <Icon icon={icon} size={18} className="ant-menu-item-icon" />;
			},
		},
		{
			title: t("sys.management.system.permission.component"),
			dataIndex: "component",
		},
		{
			title: t("sys.management.system.permission.status"),
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => (
				<Badge variant={status === BasicStatus.DISABLE ? "error" : "success"}>
					{status === BasicStatus.DISABLE
						? t("sys.management.system.role.disable")
						: t("sys.management.system.role.enable")}
				</Badge>
			),
		},
		{ title: t("sys.management.system.permission.order"), dataIndex: "order", width: 60 },
		{
			title: t("sys.management.system.permission.action"),
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-end text-gray">
					{record?.type === PermissionType.CATALOGUE && (
						<Button variant="ghost" size="icon" onClick={() => onCreate(record.id)}>
							<Icon icon="gridicons:add-outline" size={18} />
						</Button>
					)}
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon">
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = (parentId?: string) => {
		setPermissionModalProps((prev) => ({
			...prev,
			show: true,
			...defaultPermissionValue,
			title: t("sys.management.system.permission.new"),
			formValue: { ...defaultPermissionValue, parentId: parentId ?? "" },
		}));
	};

	const onEdit = (formValue: Permission_Old) => {
		setPermissionModalProps((prev) => ({
			...prev,
			show: true,
			title: t("sys.management.system.permission.edit"),
			formValue,
		}));
	};
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>{t("sys.management.system.permission.title")}</div>
					<Button onClick={() => onCreate()}>{t("sys.management.system.permission.new")}</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={[]}
				/>
			</CardContent>
			<PermissionModal {...permissionModalProps} />
		</Card>
	);
}
