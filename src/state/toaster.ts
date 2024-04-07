import { create } from "zustand";
import { v4 } from "uuid";
import * as Icons from "react-icons/hi";

export type Toast = {
  id: string;
  message: string;
  icon?: keyof typeof Icons;
  type: "error" | "success";
};

export interface ToasterState {
  toasts: Toast[];
  add: (t: Exclude<Toast, "id">) => void;
  remove: (id: string) => void;
}

const useToaster = create<ToasterState>((set, get) => ({
  toasts: [],
  add: (t) => {
    const { toasts } = get();
    t.id = v4();
    toasts.push(t);
    set({ toasts });
  },
  remove: (id) => {
    const { toasts } = get();
    set({ toasts: toasts.filter((t) => t.id !== id) });
  },
}));

export default useToaster;
