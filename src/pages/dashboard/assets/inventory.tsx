import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message, Popconfirm, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import assetService from "@/api/services/assetService";
import { Icon } from "@/components/icon";
import { useCartActions, useCartItems } from "@/store/cartStore";
import { type Asset, AssetStatus } from "@/types/entity";
import { Title } from "@/ui/typography";

export default function AssetInventoryPage() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ["assets"],
		queryFn: assetService.getAssetList,
	});

	const cartItems = useCartItems();
	const { addItem, removeItem, clearCart } = useCartActions();

	// Filter States
	const [searchText, setSearchText] = useState("");
	const [statusFilter, setStatusFilter] = useState<AssetStatus | null>(null);
	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

	const checkoutMutation = useMutation({
		mutationFn: assetService.checkoutAssets,
		onSuccess: () => {
			message.success(t("sys.assets.inventory.checkoutSuccess"));
			clearCart();
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});

	const returnMutation = useMutation({
		mutationFn: assetService.returnAsset,
		onSuccess: () => {
			message.success(t("sys.assets.inventory.checkinSuccess"));
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});

	const reportMaintenanceMutation = useMutation({
		mutationFn: assetService.reportMaintenance,
		onSuccess: (_, variables) => {
			message.success(t("sys.assets.inventory.maintenanceSuccess"));
			removeItem(variables); // Remove from cart if present
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});

	const finishMaintenanceMutation = useMutation({
		mutationFn: assetService.finishMaintenance,
		onSuccess: () => {
			message.success(t("sys.assets.inventory.finishMaintenanceSuccess"));
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});

	const retireMutation = useMutation({
		mutationFn: assetService.retireAsset,
		onSuccess: (_, variables) => {
			message.success(t("sys.assets.inventory.retireSuccess"));
			removeItem(variables); // Remove from cart if present
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});

	const handleCheckout = () => {
		if (cartItems.length === 0) return;
		checkoutMutation.mutate(cartItems.map((item) => item.id));
	};

	// Filter Logic
	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.filter((item) => {
			const matchesSearch =
				item.name.toLowerCase().includes(searchText.toLowerCase()) ||
				item.model.toLowerCase().includes(searchText.toLowerCase()) ||
				item.serialNumber.toLowerCase().includes(searchText.toLowerCase());
			const matchesStatus = statusFilter ? item.status === statusFilter : true;
			const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
			return matchesSearch && matchesStatus && matchesCategory;
		});
	}, [data, searchText, statusFilter, categoryFilter]);

	// Unique Categories for Filter
	const categories = useMemo(() => {
		if (!data) return [];
		return Array.from(new Set(data.map((item) => item.category)));
	}, [data]);

	const columns: ColumnsType<Asset> = [
		{
			title: t("sys.assets.inventory.name"),
			dataIndex: "name",
			key: "name",
			render: (text, record) => (
				<Link to={`/assets/detail/${record.id}`} className="font-medium hover:text-primary transition-colors">
					{text}
				</Link>
			),
		},
		{
			title: t("sys.assets.inventory.category"),
			dataIndex: "category",
			key: "category",
		},
		{
			title: t("sys.assets.inventory.model"),
			dataIndex: "model",
			key: "model",
		},
		{
			title: t("sys.assets.inventory.serialNumber"),
			dataIndex: "serialNumber",
			key: "serialNumber",
			render: (text) => <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{text}</span>,
		},
		{
			title: t("sys.assets.inventory.status"),
			dataIndex: "status",
			key: "status",
			render: (status: AssetStatus) => {
				let color = "default";
				if (status === AssetStatus.InStock) color = "success";
				if (status === AssetStatus.InUse) color = "processing";
				if (status === AssetStatus.Maintenance) color = "warning";
				if (status === AssetStatus.Retired) color = "error";
				return (
					<Tag color={color} className="border-none px-2 py-0.5 rounded-full font-semibold">
						{status.toUpperCase()}
					</Tag>
				);
			},
		},
		{
			title: t("sys.assets.inventory.price"),
			dataIndex: "price",
			key: "price",
			render: (price) => `$${price}`,
		},
		{
			title: t("sys.assets.inventory.action"),
			key: "action",
			render: (_, record) => {
				if (record.status === AssetStatus.Retired) {
					return <span className="text-muted-foreground text-xs italic">Archived</span>;
				}

				return (
					<div className="flex items-center gap-2">
						{record.status === AssetStatus.InUse && (
							<Button
								type="primary"
								size="small"
								ghost
								onClick={() => returnMutation.mutate(record.id)}
								loading={returnMutation.isPending && returnMutation.variables === record.id}
								icon={<Icon icon="solar:inbox-in-bold-duotone" />}
							>
								{t("sys.assets.inventory.checkin")}
							</Button>
						)}

						{record.status === AssetStatus.InStock && (
							<Button
								type={cartItems.some((item) => item.id === record.id) ? "default" : "primary"}
								size="small"
								disabled={cartItems.some((item) => item.id === record.id)}
								onClick={() => addItem(record)}
								icon={<Icon icon="solar:cart-plus-bold-duotone" />}
							>
								{cartItems.some((item) => item.id === record.id)
									? t("sys.assets.inventory.added")
									: t("sys.assets.inventory.addToCart")}
							</Button>
						)}

						{record.status === AssetStatus.Maintenance && (
							<Button
								size="small"
								className="bg-green-500 hover:bg-green-600 text-white border-none"
								onClick={() => finishMaintenanceMutation.mutate(record.id)}
								loading={finishMaintenanceMutation.isPending && finishMaintenanceMutation.variables === record.id}
								icon={<Icon icon="solar:check-circle-bold-duotone" />}
							>
								{t("sys.assets.inventory.finishMaintenance")}
							</Button>
						)}

						{(record.status === AssetStatus.InStock || record.status === AssetStatus.InUse) && (
							<Button
								size="small"
								className="bg-orange-500 hover:bg-orange-600 text-white border-none"
								onClick={() => reportMaintenanceMutation.mutate(record.id)}
								loading={reportMaintenanceMutation.isPending && reportMaintenanceMutation.variables === record.id}
								icon={<Icon icon="solar:wrench-bold-duotone" />}
							>
								{t("sys.assets.inventory.maintenance")}
							</Button>
						)}

						{(record.status === AssetStatus.InStock || record.status === AssetStatus.Maintenance) && (
							<Popconfirm
								title={t("sys.assets.inventory.retireConfirmTitle") || "Retire Asset"}
								description={
									t("sys.assets.inventory.retireConfirmDesc") || "Are you sure you want to retire this asset?"
								}
								onConfirm={() => retireMutation.mutate(record.id)}
								okText={t("sys.common.yes") || "Yes"}
								cancelText={t("sys.common.no") || "No"}
							>
								<Button
									size="small"
									danger
									loading={retireMutation.isPending && retireMutation.variables === record.id}
									icon={<Icon icon="solar:trash-bin-trash-bold-duotone" />}
								>
									{t("sys.assets.inventory.retire")}
								</Button>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className="flex flex-col gap-4 p-2">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<Title as="h2" className="text-3xl font-bold tracking-tight">
						{t("sys.assets.inventory.title")}
					</Title>
					<div className="text-muted-foreground text-sm">
						{t("sys.assets.inventory.totalAssets")}: {data?.length || 0}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{cartItems.length > 0 && (
						<div className="flex items-center gap-2 mr-2 bg-primary/10 px-3 py-1 rounded-lg">
							<span className="text-sm font-medium text-primary">
								{cartItems.length} {t("sys.assets.inventory.selected")}
							</span>
							<Button
								type="primary"
								size="small"
								onClick={handleCheckout}
								loading={checkoutMutation.isPending}
								className="shadow-none"
							>
								{t("sys.assets.inventory.checkout")}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border shadow-sm">
				<Input
					placeholder={t("sys.assets.inventory.searchPlaceholder")}
					prefix={<Icon icon="solar:magnifer-linear" className="text-muted-foreground" />}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					className="w-full md:w-64"
					allowClear
				/>
				<Select
					placeholder={t("sys.assets.inventory.filterStatus")}
					style={{ width: 150 }}
					allowClear
					value={statusFilter}
					onChange={setStatusFilter}
					options={Object.values(AssetStatus).map((status) => ({ label: status, value: status }))}
				/>
				<Select
					placeholder={t("sys.assets.inventory.filterCategory")}
					style={{ width: 150 }}
					allowClear
					value={categoryFilter}
					onChange={setCategoryFilter}
					options={categories.map((cat) => ({ label: cat, value: cat }))}
				/>
				{(searchText || statusFilter || categoryFilter) && (
					<Button
						type="text"
						icon={<Icon icon="solar:trash-bin-trash-bold" />}
						onClick={() => {
							setSearchText("");
							setStatusFilter(null);
							setCategoryFilter(null);
						}}
						className="text-muted-foreground hover:text-destructive"
					>
						{t("sys.assets.inventory.clearFilters")}
					</Button>
				)}
			</div>

			{/* Table */}
			<div className="bg-card rounded-xl border shadow-sm overflow-hidden">
				<Table
					rowKey="id"
					columns={columns}
					dataSource={filteredData}
					loading={isLoading}
					pagination={{ pageSize: 10 }}
					scroll={{ x: 800 }}
				/>
			</div>
		</div>
	);
}
