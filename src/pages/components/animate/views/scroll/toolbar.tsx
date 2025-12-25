import { Icon } from "@/components/icon";

type Props = {
	onRefresh: VoidFunction;
};
export default function Toolbar({ onRefresh }: Props) {
	return (
		<button
			type="button"
			className="mb-4 flex items-center justify-end w-full bg-transparent border-none"
			onClick={onRefresh}
		>
			<Icon icon="material-symbols:refresh" className="cursor-pointer" size={24} />
		</button>
	);
}
