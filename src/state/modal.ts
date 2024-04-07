import { create } from "zustand";

type input = {
  id: string;
  value: string;
  placeholder?: string;
};

type button = {
  id: string;
  text: string;
  type: "primary" | "secondary" | "danger";
  submittable: boolean;
};

export type Modal = {
  id: string;
  title: string;
  message: string;
  inputs: {
    [key: string]: input;
  };
  buttons?: button[];
  submit?: () => void;
};

export interface ModalState {
  modals: Modal[];
  add: (t: Modal) => void;
  remove: (id: string) => void;
  getInputValue: (modalId: string, inputId: string) => string;
  setInputValue: (modalId: string, inputId: string, value: string) => void;
}

const useModals = create<ModalState>((set, get) => ({
  modals: [],
  add: (t) => {
    const { modals: toasts } = get();
    toasts.push(t);
    set({ modals: toasts });
  },
  remove: (id) => {
    const { modals: toasts } = get();
    set({ modals: toasts.filter((t) => t.id !== id) });
  },
  getInputValue: (modalId, inputId) => {
    const { modals: toasts } = get();
    const modal = toasts.find((t) => t.id === modalId);
    if (!modal) return "";
    return modal.inputs?.[inputId]?.value || "";
  },
  setInputValue: (modalId, inputId, value) => {
    const { modals: toasts } = get();
    const modal = toasts.find((t) => t.id === modalId);
    if (!modal) return;
    modal.inputs[inputId].value = value;
    set({ modals: toasts });
  },
}));

export default useModals;
