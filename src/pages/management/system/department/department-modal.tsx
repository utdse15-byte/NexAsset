import { Form, Input, Modal, Radio } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Department } from "@/types/entity";
import { BasicStatus } from "@/types/enum";

export type DepartmentModalProps = {
	formValue: Department;
	title: string;
	show: boolean;
	onOk: (data: Department) => void;
	onCancel: () => void;
};

export function DepartmentModal({ title, show, formValue, onOk, onCancel }: DepartmentModalProps) {
	const { t } = useTranslation();
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue({ ...formValue });
	}, [formValue, form]);

	return (
		<Modal
			title={title}
			open={show}
			onOk={() => form.validateFields().then(onOk)}
			onCancel={onCancel}
			okText={t("sys.management.system.department.save")}
			cancelText={t("sys.management.system.department.cancel")}
		>
			<Form initialValues={formValue} form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} layout="horizontal">
				<Form.Item<Department>
					label={t("sys.management.system.department.name")}
					name="name"
					rules={[{ required: true, message: "Please input department name" }]}
				>
					<Input />
				</Form.Item>

				<Form.Item<Department>
					label={t("sys.management.system.department.code")}
					name="code"
					rules={[{ required: true, message: "Please input department code" }]}
				>
					<Input />
				</Form.Item>

				<Form.Item<Department> label={t("sys.management.system.department.principal")} name="principal">
					<Input />
				</Form.Item>

				<Form.Item<Department> label={t("sys.management.system.department.phone")} name="phone">
					<Input />
				</Form.Item>

				<Form.Item<Department> label={t("sys.management.system.department.email")} name="email">
					<Input />
				</Form.Item>

				<Form.Item<Department> label={t("sys.management.system.department.status")} name="status" required>
					<Radio.Group>
						<Radio value={BasicStatus.ENABLE}>{t("sys.management.system.department.enable")}</Radio>
						<Radio value={BasicStatus.DISABLE}>{t("sys.management.system.department.disable")}</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
