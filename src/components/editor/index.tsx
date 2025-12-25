/* eslint-disable import/order */
import "@/utils/highlight";
import { useTranslation } from "react-i18next";
import ReactQuill, { type ReactQuillProps } from "react-quill";
import "./editor.css";
import Toolbar, { formats } from "./toolbar";

// TODO: repace react-quill with tiptap
interface Props extends ReactQuillProps {
	sample?: boolean;
}
export default function Editor({ id = "nexasset-quill", sample = false, ...other }: Props) {
	const { t } = useTranslation();
	const modules = {
		toolbar: {
			container: `#${id}`,
		},
		history: {
			delay: 500,
			maxStack: 100,
			userOnly: true,
		},
		syntax: true,
		clipboard: {
			matchVisual: false,
		},
	};
	return (
		<div className="editor-wrapper">
			<Toolbar id={id} isSimple={sample} />
			<ReactQuill modules={modules} formats={formats} {...other} placeholder={t("sys.components.editor.placeholder")} />
		</div>
	);
}
