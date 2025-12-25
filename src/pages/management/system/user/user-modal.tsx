import { Form, Input, Modal, Radio } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { User } from "@/types/entity";
import { BasicStatus } from "@/types/enum";

export type UserModalProps = {
	formValue: User;
	title: string;
	show: boolean;
	onOk: (data: User) => void;
	onCancel: () => void;
};

export function UserModal({ title, show, formValue, onOk, onCancel }: UserModalProps) {
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
			okText={t("sys.management.system.user.save")}
			cancelText={t("sys.management.system.user.cancel")}
		>
			<Form initialValues={formValue} form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} layout="horizontal">
				<Form.Item<User>
					label={t("sys.management.system.user.name")}
					name="username"
					rules={[{ required: true, message: "Please input username" }]}
				>
					<Input />
				</Form.Item>

				<Form.Item<User>
					label={t("sys.management.system.user.email")}
					name="email"
					rules={[
						{ required: true, message: "Please input email" },
						{ type: "email", message: "Please input valid email" },
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item<User> label={t("sys.management.system.user.status")} name="status" required>
					<Radio.Group>
						<Radio value={BasicStatus.ENABLE}>{t("sys.management.system.user.enable")}</Radio>
						<Radio value={BasicStatus.DISABLE}>{t("sys.management.system.user.disable")}</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
