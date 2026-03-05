import { Upload } from "antd";
import type { UploadChangeParam, UploadFile, UploadProps } from "antd/es/upload";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { themeVars } from "@/theme/theme.css";
import { Text } from "@/ui/typography";
import { fBytes } from "@/utils/format-number";

import { beforeAvatarUpload, getBlobUrl } from "./utils";

interface Props extends UploadProps {
	defaultAvatar?: string;
	helperText?: React.ReactElement | string;
}
export function UploadAvatar({ helperText, defaultAvatar = "", ...other }: Props) {
	const [imageUrl, setImageUrl] = useState<string>(defaultAvatar);

	const handleChange: UploadProps["onChange"] = (info: UploadChangeParam<UploadFile>) => {
		if (info.file.status === "uploading") {
			return;
		}
		if (info.file.status === "done" || info.file.status === "error") {
			if (info.file.originFileObj) {
				setImageUrl(getBlobUrl(info.file.originFileObj));
			}
		}
	};

	const renderPreview = <img src={imageUrl} alt="" className="absolute rounded-full h-full w-full object-cover" />;

	const renderPlaceholder = (
		<div
			style={{
				backgroundColor: themeVars.colors.background.neutral,
			}}
			className={`absolute z-10 flex h-full w-full flex-col items-center justify-center transition-opacity duration-200 ${
				imageUrl ? "opacity-0 group-hover:opacity-100" : ""
			}`}
		>
			<Icon icon="solar:camera-add-bold" size={32} />
			<div className="mt-1 text-xs">Upload Photo</div>
		</div>
	);

	const renderContent = (
		<div className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
			{imageUrl ? renderPreview : null}
			{renderPlaceholder}
		</div>
	);

	const defaultHelperText = (
		<Text variant="caption" color="secondary">
			Allowed *.jpeg, *.jpg, *.png, *.gif
			<br /> max size of {fBytes(3145728)}
		</Text>
	);
	const renderHelpText = <div className="text-center">{helperText || defaultHelperText}</div>;

	return (
		<div className="transition-opacity duration-200 ease-in-out [&_.ant-upload-select]:!border-none [&_.ant-upload]:!border-none">
			<Upload
				name="avatar"
				showUploadList={false}
				listType="picture-circle"
				className="avatar-uploader flex! items-center justify-center"
				{...other}
				beforeUpload={beforeAvatarUpload}
				onChange={handleChange}
			>
				{renderContent}
			</Upload>
			{renderHelpText}
		</div>
	);
}
