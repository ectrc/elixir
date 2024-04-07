import { create } from "zustand";
import { getFriends } from "src/api/friends";
import useLoading from "./loading";

export interface FriendsState {
  people: {
    accountId: string;
    activeCharacterTemplateId: string;
    created: string;
    direction: string;
    displayName: string;
    favorite: boolean;
    status: string;
  }[];
  fetch: () => Promise<void>;
  fetchedOnce: boolean;
}

const useFriends = create<FriendsState>((set) => ({
  people: [],
  fetch: async () => {
    const loading = useLoading.getState();
    loading.setFriendLoading(true);
    const r = await getFriends();
    if (!r.success) return set({ fetchedOnce: true });

    set({ people: r.data.friends, fetchedOnce: true });
    loading.setFriendLoading(false);
  },
  fetchedOnce: false,
}));

export default useFriends;
