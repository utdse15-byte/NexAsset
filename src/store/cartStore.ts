import { create } from "zustand";
import type { Asset } from "@/types/entity";

interface CartStore {
	items: Asset[];
	actions: {
		addItem: (item: Asset) => void;
		removeItem: (id: string) => void;
		clearCart: () => void;
	};
}

const useCartStore = create<CartStore>((set) => ({
	items: [],
	actions: {
		addItem: (item) =>
			set((state) => {
				if (state.items.find((i) => i.id === item.id)) return state;
				return { items: [...state.items, item] };
			}),
		removeItem: (id) =>
			set((state) => ({
				items: state.items.filter((item) => item.id !== id),
			})),
		clearCart: () => set({ items: [] }),
	},
}));

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartActions = () => useCartStore((state) => state.actions);

export default useCartStore;
