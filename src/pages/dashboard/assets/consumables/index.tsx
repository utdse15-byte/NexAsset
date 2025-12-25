import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, InputNumber, Modal, message, Progress, Row, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import assetService from "@/api/services/assetService";
import { Icon } from "@/components/icon";
import type { Consumable } from "@/types/entity";
import { Title } from "@/ui/typography";

export default function ConsumablesPage() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState<"in" | "out">("in");
	const [selectedItem, setSelectedItem] = useState<Consumable | null>(null);
	const [form] = Form.useForm();

	const { data, isLoading } = useQuery({
		queryKey: ["consumables"],
		queryFn: assetService.getConsumablesList,
	});

	const updateStockMutation = useMutation({
		mutationFn: (values: { quantity: number }) => {
			if (!selectedItem) return Promise.reject("No item selected");
			return assetService.updateConsumableStock(selectedItem.id, values.quantity, modalType);
		},
		onSuccess: () => {
			message.success(t("sys.assets.consumables.success"));
			setIsModalOpen(false);
			form.resetFields();
			queryClient.invalidateQueries({ queryKey: ["consumables"] });
		},
	});

	const handleAction = (item: Consumable, type: "in" | "out") => {
		setSelectedItem(item);
		setModalType(type);
		setIsModalOpen(true);
	};

	const stats = useMemo(() => {
		if (!data) return { totalValue: 0, lowStockCount: 0 };
		return data.reduce(
			(acc, item) => ({
				totalValue: acc.totalValue + item.unitPrice * item.quantity,
				lowStockCount: acc.lowStockCount + (item.status !== "in_stock" ? 1 : 0),
			}),
			{ totalValue: 0, lowStockCount: 0 },
		);
	}, [data]);

	const columns: ColumnsType<Consumable> = [
		{
			title: t("sys.assets.inventory.name"),
			key: "name",
			render: (_, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{record.name}</span>
					<span className="text-xs text-muted-foreground">{record.model}</span>
				</div>
			),
		},
		{
			title: t("sys.assets.inventory.category"),
			dataIndex: "category",
			key: "category",
			render: (text) => <Tag>{text}</Tag>,
		},
		{
			title: t("sys.assets.consumables.quantity"),
			key: "quantity",
			width: 200,
			render: (_, record) => {
				// Ant Design Progress status mapping tweak
				const percent = Math.min(100, Math.max(0, (record.quantity / (record.threshold * 5)) * 100));
				const strokeColor =
					record.status === "out_of_stock" ? "#ff4d4f" : record.status === "low_stock" ? "#faad14" : "#52c41a";

				return (
					<div className="flex items-center gap-2">
						<Progress percent={percent} showInfo={false} strokeColor={strokeColor} size="small" />
						<span className="font-mono w-12 text-right">{record.quantity}</span>
					</div>
				);
			},
		},
		{
			title: t("sys.assets.consumables.unitPrice"),
			dataIndex: "unitPrice",
			key: "unitPrice",
			render: (price) => `$${price.toFixed(2)}`,
		},
		{
			title: t("sys.assets.consumables.totalValue"),
			key: "total",
			render: (_, record) => `$${(record.unitPrice * record.quantity).toFixed(2)}`,
		},
		{
			title: t("sys.assets.consumables.actions"),
			key: "actions",
			render: (_, record) => (
				<Space>
					<Button size="small" icon={<Icon icon="solar:add-circle-bold" />} onClick={() => handleAction(record, "in")}>
						{t("sys.assets.consumables.restock")}
					</Button>
					<Button
						size="small"
						danger
						disabled={record.quantity === 0}
						icon={<Icon icon="solar:minus-circle-bold" />}
						onClick={() => handleAction(record, "out")}
					>
						{t("sys.assets.consumables.consume")}
					</Button>
				</Space>
			),
		},
	];

	return (
		<div className="flex flex-col gap-4 p-2">
			<Title as="h2" className="text-3xl font-bold tracking-tight">
				{t("sys.assets.consumables.title")}
			</Title>

			<Row gutter={16}>
				<Col span={12} md={6}>
					<Card bordered={false} className="shadow-sm">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-primary/10 rounded-full text-primary">
								<Icon icon="solar:wallet-money-bold-duotone" size={32} />
							</div>
							<div>
								<div className="text-muted-foreground text-sm">{t("sys.assets.consumables.totalValue")}</div>
								<div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
							</div>
						</div>
					</Card>
				</Col>
				<Col span={12} md={6}>
					<Card bordered={false} className="shadow-sm">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-warning/10 rounded-full text-warning">
								<Icon icon="solar:bell-bing-bold-duotone" size={32} />
							</div>
							<div>
								<div className="text-muted-foreground text-sm">{t("sys.assets.consumables.lowStock")}</div>
								<div className="text-2xl font-bold">{stats.lowStockCount}</div>
							</div>
						</div>
					</Card>
				</Col>
			</Row>

			<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
				<Table rowKey="id" columns={columns} dataSource={data} loading={isLoading} pagination={false} />
			</div>

			<Modal
				title={modalType === "in" ? t("sys.assets.consumables.addStock") : t("sys.assets.consumables.removeStock")}
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => form.submit()}
				confirmLoading={updateStockMutation.isPending}
			>
				<Form form={form} onFinish={updateStockMutation.mutate} layout="vertical">
					<Form.Item
						name="quantity"
						label={t("sys.assets.consumables.amount")}
						rules={[{ required: true, message: t("sys.assets.consumables.validation.required") }]}
					>
						<InputNumber min={1} style={{ width: "100%" }} autoFocus />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
