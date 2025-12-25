import type { UploadProps } from "antd";
import { Upload as AntdUpload } from "antd";
import type { ItemRender } from "antd/es/upload/interface";
import { useTranslation } from "react-i18next";

import UploadIllustration from "./upload-illustration";
import UploadListItem from "./upload-list-item";

const { Dragger } = AntdUpload;

interface Props extends UploadProps {
	thumbnail?: boolean;
}

const itemRender: (thumbnail: boolean) => ItemRender = (thumbnail) => {
	return function temp(...args) {
		const [, file, , actions] = args;
		return <UploadListItem file={file} actions={actions} thumbnail={thumbnail} />;
	};
};
export function Upload({ thumbnail = false, ...other }: Props) {
	const { t } = useTranslation();
	return (
		<div className={thumbnail ? "flex flex-wrap" : "block"}>
			<div className="[&_.ant-upload]:!border-none [&_.ant-upload-list]:!flex [&_.ant-upload-list]:flex-wrap">
				<Dragger {...other} itemRender={itemRender(thumbnail)}>
					<div className="opacity-100 hover:opacity-80">
						<p className="m-auto max-w-[200px]">
							<UploadIllustration />
						</p>
						<div>
							<h5 className="mt-4">{t("sys.components.upload.dropOrSelect")}</h5>
							<p className="text-sm text-gray-500">
								{t("sys.components.upload.dropHere")}
								<span className="mx-2 text-primary underline">{t("sys.components.upload.browse")}</span>
								{t("sys.components.upload.thorough")}
							</p>
						</div>
					</div>
				</Dragger>
			</div>
		</div>
	);
}
