import { getHealth } from "src/api/health";
import { create } from "zustand";

export interface GameServer {
  sessionId: string;
  playlist: string;
  region: string;
  state: string;
  players: number;
  startedAt: string;
}

export interface HealthState {
  servers: Record<string, GameServer>;
  fetch: () => Promise<void>;
}

const useHealth = create<HealthState>((set) => ({
  servers: {},
  fetch: async () => {
    const data = await getHealth();
    if (!data.success) return;

    console.log(data.data.servers);
    set({ servers: data.data.servers });
  },
}));

export default useHealth;
