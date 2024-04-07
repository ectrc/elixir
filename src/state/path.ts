import { create } from "zustand";

export interface PathState {
  set: (p: string) => void;
  path: string;
  registered: Set<string>;
  register: (p: string) => void;
}

const usePath = create<PathState>((set, get) => ({
  set: (p) => {
    history.pushState({}, "", p);
    set({ path: p });
  },
  path: window.location.pathname,
  registered: new Set<string>(),
  register: (p) => {
    const { registered } = get();
    registered.add(p);
    set({ registered });
  },
}));

export default usePath;
