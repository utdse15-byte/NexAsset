import { useQuery } from "@tanstack/react-query";
import { Button, Card, Descriptions, Spin, Tag, Typography } from "antd";
import { useNavigate, useParams } from "react-router";

import assetService from "@/api/services/assetService";
import { AssetStatus } from "@/types/entity";

export default function AssetDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data: asset, isLoading } = useQuery({
		queryKey: ["asset", id],
		queryFn: () => assetService.getAssetById(id || ""),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<Spin size="large" />
			</div>
		);
	}

	if (!asset) {
		return <div>Asset not found</div>;
	}

	return (
		<Card title="Asset Details" extra={<Button onClick={() => navigate(-1)}>Back</Button>} bordered={false}>
			<Descriptions bordered column={1}>
				<Descriptions.Item label="Name">
					<Typography.Text strong>{asset.name}</Typography.Text>
				</Descriptions.Item>
				<Descriptions.Item label="Category">{asset.category}</Descriptions.Item>
				<Descriptions.Item label="Model">{asset.model}</Descriptions.Item>
				<Descriptions.Item label="Serial Number">
					<Typography.Text code>{asset.serialNumber}</Typography.Text>
				</Descriptions.Item>
				<Descriptions.Item label="Status">
					<Tag
						color={
							asset.status === AssetStatus.InStock
								? "success"
								: asset.status === AssetStatus.InUse
									? "processing"
									: asset.status === AssetStatus.Maintenance
										? "warning"
										: "error"
						}
					>
						{asset.status.toUpperCase()}
					</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Price">${asset.price}</Descriptions.Item>
				<Descriptions.Item label="Created At">{new Date(asset.createdAt || "").toLocaleString()}</Descriptions.Item>
			</Descriptions>
		</Card>
	);
}
