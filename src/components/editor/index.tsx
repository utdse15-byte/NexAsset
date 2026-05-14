/* eslint-disable import/order */
/**
 * ⚠️ DEPRECATED: react-quill 与 React 19 不兼容 (使用了已移除的 findDOMNode)。
 * 计划迁移到 @tiptap/react 或其他 React 19 兼容的富文本编辑器。
 * 当前保留以避免功能回退, 但在 React 19 strict mode 下可能报警告。
 */
import "@/utils/highlight";
import { useTranslation } from "react-i18next";
import ReactQuill, { type ReactQuillProps } from "react-quill";
import "./editor.css";
import Toolbar, { formats } from "./toolbar";

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
