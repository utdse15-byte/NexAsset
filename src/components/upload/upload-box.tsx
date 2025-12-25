import type { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import type { ReactElement } from "react";
import { Icon } from "@/components/icon";

interface Props extends UploadProps {
	placeholder?: ReactElement;
}
export function UploadBox({ placeholder, ...other }: Props) {
	return (
		<div className="[&_.ant-upload-list]:hidden [&_.ant-upload]:!border-none">
			<Dragger {...other} showUploadList={false}>
				<div className="opacity-60 hover:opacity-50">
					{placeholder || (
						<div className="mx-auto flex h-16 w-16 items-center justify-center">
							<Icon icon="eva:cloud-upload-fill" size={28} />
						</div>
					)}
				</div>
			</Dragger>
		</div>
	);
}
