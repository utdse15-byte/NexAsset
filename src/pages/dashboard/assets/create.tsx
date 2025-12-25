import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, message, Select } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import assetService from "@/api/services/assetService";
import { Icon } from "@/components/icon";
import { AssetStatus } from "@/types/entity";
import { Title } from "@/ui/typography";

export default function AssetCreatePage() {
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: assetService.createAsset,
		onSuccess: () => {
			message.success(t("sys.assets.create.success"));
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			navigate("/assets/inventory");
		},
	});

	const onFinish = (values: any) => {
		createMutation.mutate({
			...values,
			status: AssetStatus.InStock, // Default status
		});
	};

	return (
		<div className="flex flex-col gap-4 p-2 max-w-4xl mx-auto w-full">
			<div className="flex items-center gap-4 mb-4">
				<Button
					type="text"
					icon={<Icon icon="solar:arrow-left-linear" size={24} />}
					onClick={() => navigate("/assets/inventory")}
					className="text-muted-foreground hover:text-foreground"
				/>
				<Title as="h2" className="text-3xl font-bold tracking-tight m-0">
					{t("sys.assets.create.title")}
				</Title>
			</div>

			<div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
				<Form
					form={form}
					layout="vertical"
					onFinish={onFinish}
					initialValues={{ status: AssetStatus.InStock }}
					requiredMark={false}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Form.Item
							name="name"
							label={t("sys.assets.create.name")}
							rules={[{ required: true, message: t("sys.assets.create.validation.required") }]}
						>
							<Input placeholder={t("sys.assets.create.placeholder.name")} className="h-10" />
						</Form.Item>

						<Form.Item
							name="category"
							label={t("sys.assets.create.category")}
							rules={[{ required: true, message: t("sys.assets.create.validation.required") }]}
						>
							<Select
								className="h-10"
								options={[
									{ value: "Laptop", label: "Laptop" },
									{ value: "Desktop", label: "Desktop" },
									{ value: "Server", label: "Server" },
									{ value: "Monitor", label: "Monitor" },
									{ value: "Printer", label: "Printer" },
									{ value: "Mobile", label: "Mobile" },
									{ value: "Tablet", label: "Tablet" },
									{ value: "Projector", label: "Projector" },
									{ value: "Network Gear", label: "Network Gear" },
									{ value: "Peripherals", label: "Peripherals" },
								]}
							/>
						</Form.Item>

						<Form.Item
							name="model"
							label={t("sys.assets.create.model")}
							rules={[{ required: true, message: t("sys.assets.create.validation.required") }]}
						>
							<Input placeholder={t("sys.assets.create.placeholder.model")} className="h-10" />
						</Form.Item>

						<Form.Item
							name="serialNumber"
							label={t("sys.assets.create.serialNumber")}
							rules={[{ required: true, message: t("sys.assets.create.validation.required") }]}
						>
							<Input placeholder={t("sys.assets.create.placeholder.serialNumber")} className="h-10" />
						</Form.Item>

						<Form.Item
							name="price"
							label={t("sys.assets.create.price")}
							rules={[{ required: true, message: t("sys.assets.create.validation.required") }]}
						>
							<InputNumber
								style={{ width: "100%" }}
								min={0}
								prefix="$"
								className="h-10 flex items-center"
								placeholder="0.00"
							/>
						</Form.Item>
					</div>

					<div className="flex justify-end gap-4 mt-8 pt-6 border-t">
						<Button onClick={() => navigate("/assets/inventory")} className="h-10 px-6">
							{t("sys.assets.create.cancel")}
						</Button>
						<Button type="primary" htmlType="submit" loading={createMutation.isPending} className="h-10 px-6">
							{t("sys.assets.create.submit")}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
