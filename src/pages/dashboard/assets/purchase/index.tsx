import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, Col, Form, Input, InputNumber, Modal, message, Row, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import assetService from "@/api/services/assetService";
import { Icon } from "@/components/icon";
import type { PurchaseRequest, PurchaseStatus } from "@/types/entity";
import { Title } from "@/ui/typography";

const { Option } = Select;

export default function PurchasePage() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	const { data, isLoading } = useQuery({
		queryKey: ["purchase-requests"],
		queryFn: assetService.getPurchaseRequests,
	});

	const createMutation = useMutation({
		mutationFn: assetService.createPurchaseRequest,
		onSuccess: () => {
			message.success(t("sys.assets.purchase.success") || "Request created successfully");
			setIsModalOpen(false);
			form.resetFields();
			queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
		},
	});

	const updateStatusMutation = useMutation({
		mutationFn: ({ id, status }: { id: string; status: PurchaseStatus }) =>
			assetService.updatePurchaseStatus(id, status),
		onSuccess: () => {
			message.success(t("sys.assets.purchase.success") || "Status updated successfully");
			queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
		},
	});

	const stats = useMemo(() => {
		if (!data) return { totalSpend: 0, pendingCount: 0, completedCount: 0 };
		return data.reduce(
			(acc, item) => {
				if (item.status === "received") {
					acc.totalSpend += item.totalPrice;
					acc.completedCount += 1;
				} else if (item.status === "pending") {
					acc.pendingCount += 1;
				}
				return acc;
			},
			{ totalSpend: 0, pendingCount: 0, completedCount: 0 },
		);
	}, [data]);

	const getStatusColor = (status: PurchaseStatus) => {
		switch (status) {
			case "pending":
				return "processing";
			case "approved":
				return "success";
			case "rejected":
				return "error";
			case "ordered":
				return "geekblue";
			case "received":
				return "default";
			default:
				return "default";
		}
	};

	const columns: ColumnsType<PurchaseRequest> = [
		{
			title: t("sys.assets.purchase.requestDate"),
			dataIndex: "requestDate",
			key: "requestDate",
			render: (date) => dayjs(date).format("YYYY-MM-DD"),
		},
		{
			title: t("sys.assets.purchase.requester"),
			dataIndex: "requesterName",
			key: "requesterName",
		},
		{
			title: t("sys.assets.purchase.item"),
			key: "item",
			render: (_, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{record.itemName}</span>
					<span className="text-xs text-muted-foreground">{record.category}</span>
				</div>
			),
		},
		{
			title: t("sys.assets.purchase.quantity"),
			dataIndex: "quantity",
			key: "quantity",
		},
		{
			title: t("sys.assets.purchase.totalPrice"),
			key: "totalPrice",
			render: (_, record) => `$${record.totalPrice.toFixed(2)}`,
		},
		{
			title: t("sys.assets.purchase.status"),
			key: "status",
			render: (_, record) => (
				<Badge
					status={getStatusColor(record.status) as any}
					text={t(`sys.assets.purchase.statusMap.${record.status}`)}
				/>
			),
		},
		{
			title: t("sys.assets.purchase.actions"),
			key: "actions",
			render: (_, record) => (
				<Space>
					{record.status === "pending" && (
						<>
							<Button
								size="small"
								type="primary"
								ghost
								onClick={() => updateStatusMutation.mutate({ id: record.id, status: "approved" })}
							>
								{t("sys.assets.purchase.approve")}
							</Button>
							<Button
								size="small"
								danger
								onClick={() => updateStatusMutation.mutate({ id: record.id, status: "rejected" })}
							>
								{t("sys.assets.purchase.reject")}
							</Button>
						</>
					)}
					{record.status === "approved" && (
						<Button
							size="small"
							type="primary"
							onClick={() => updateStatusMutation.mutate({ id: record.id, status: "ordered" })}
						>
							{t("sys.assets.purchase.order")}
						</Button>
					)}
					{record.status === "ordered" && (
						<Button
							size="small"
							type="primary"
							onClick={() => updateStatusMutation.mutate({ id: record.id, status: "received" })}
						>
							{t("sys.assets.purchase.receive")}
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="flex flex-col gap-4 p-2">
			<div className="flex justify-between items-center">
				<Title as="h2" className="text-3xl font-bold tracking-tight">
					{t("sys.assets.purchase.title")}
				</Title>
				<Button type="primary" icon={<Icon icon="solar:add-circle-bold" />} onClick={() => setIsModalOpen(true)}>
					{t("sys.assets.purchase.createRequest")}
				</Button>
			</div>

			<Row gutter={16}>
				<Col span={8}>
					<Card bordered={false} className="shadow-sm">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-primary/10 rounded-full text-primary">
								<Icon icon="solar:wallet-money-bold-duotone" size={32} />
							</div>
							<div>
								<div className="text-muted-foreground text-sm">{t("sys.assets.purchase.stats.totalSpend")}</div>
								<div className="text-2xl font-bold">${stats.totalSpend.toFixed(2)}</div>
							</div>
						</div>
					</Card>
				</Col>
				<Col span={8}>
					<Card bordered={false} className="shadow-sm">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-warning/10 rounded-full text-warning">
								<Icon icon="solar:clock-circle-bold-duotone" size={32} />
							</div>
							<div>
								<div className="text-muted-foreground text-sm">{t("sys.assets.purchase.stats.pendingRequests")}</div>
								<div className="text-2xl font-bold">{stats.pendingCount}</div>
							</div>
						</div>
					</Card>
				</Col>
				<Col span={8}>
					<Card bordered={false} className="shadow-sm">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-success/10 rounded-full text-success">
								<Icon icon="solar:check-circle-bold-duotone" size={32} />
							</div>
							<div>
								<div className="text-muted-foreground text-sm">{t("sys.assets.purchase.stats.completedOrders")}</div>
								<div className="text-2xl font-bold">{stats.completedCount}</div>
							</div>
						</div>
					</Card>
				</Col>
			</Row>

			<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
				<Table rowKey="id" columns={columns} dataSource={data} loading={isLoading} pagination={{ pageSize: 10 }} />
			</div>

			<Modal
				title={t("sys.assets.purchase.createRequest")}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => form.submit()}
				confirmLoading={createMutation.isPending}
			>
				<Form form={form} onFinish={createMutation.mutate} layout="vertical">
					<Form.Item
						name="itemName"
						label={t("sys.assets.purchase.form.itemName")}
						rules={[{ required: true, message: "Required" }]}
					>
						<Input />
					</Form.Item>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name="category"
								label={t("sys.assets.purchase.form.category")}
								rules={[{ required: true, message: "Required" }]}
							>
								<Select>
									<Option value="Computer">Computer</Option>
									<Option value="Peripherals">Peripherals</Option>
									<Option value="Furniture">Furniture</Option>
									<Option value="Office Supplies">Office Supplies</Option>
								</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name="quantity"
								label={t("sys.assets.purchase.form.quantity")}
								rules={[{ required: true, message: "Required" }]}
								initialValue={1}
							>
								<InputNumber min={1} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item
						name="estimatedPrice"
						label={t("sys.assets.purchase.form.estimatedPrice")}
						rules={[{ required: true, message: "Required" }]}
					>
						<InputNumber
							min={0}
							style={{ width: "100%" }}
							formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, "")) : 0) as any}
						/>
					</Form.Item>
					<Form.Item
						name="reason"
						label={t("sys.assets.purchase.form.reason")}
						rules={[{ required: true, message: "Required" }]}
					>
						<Input.TextArea rows={3} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
