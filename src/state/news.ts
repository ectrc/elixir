import { create } from "zustand";
import {
  getFortniteNews,
  getLauncherNews,
  FNNewsResponse,
  LNewsResponse,
} from "src/api/news";

export interface NewsState {
  fnitems: FNNewsResponse["battleroyalenews"]["news"]["messages"];
  launcheritems: LNewsResponse[];
  fetchFn: () => Promise<void>;
  fetchedFnOnce: boolean;
  fetchLauncher: () => Promise<void>;
  fetchedLauncherOnce: boolean;
}

const useNews = create<NewsState>((set, get) => ({
  fnitems: [],
  launcheritems: [],
  fetchFn: async () => {
    const r = await getFortniteNews();
    if (!r.success) return set({ fetchedFnOnce: true });

    const news = r.data.battleroyalenews.news.messages.filter(
      (message) => !message.hidden
    );

    set({ fnitems: news, fetchedFnOnce: true });
  },
  fetchedFnOnce: false,
  fetchLauncher: async () => {
    const r = await getLauncherNews();
    if (!r.success) return set({ fetchedLauncherOnce: true });
    set({ launcheritems: r.data, fetchedLauncherOnce: true });
  },
  fetchedLauncherOnce: false,
  fetch: async () => {
    await Promise.all([get().fetchFn(), get().fetchLauncher()]);
  },
}));

export default useNews;
