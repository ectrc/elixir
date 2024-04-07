import { create } from "zustand";
import {
  createAccessToken,
  AuthResponse,
  createExchangeCode,
} from "src/api/auth";
import usePath from "./path";
import { useEffect } from "react";

export interface AuthState {
  token: string;
  character: AuthResponse["character"];
  user: AuthResponse["user"];
  login: (code: string) => void;
  logout: () => void;
  verify: () => void;

  init: () => void;
}

const DEFAULT_CHARACTER_STRING = '{"rarity":"","templateId":""}';
const DEFAULT_ACCOUNT_STRING =
  '{"AccountID":"","DiscordID":"","DisplayName":"","LastLoginTime":"","LastLoginIP":"","Role":0,"Banned":false,"BanReason":"","Hardware":"","SoloWins":0,"SoloKills":0,"SoloMatches":0,"SoloTop10":0,"SoloTop25":0,"DuoWins":0,"DuoKills":0,"DuoMatches":0,"DuoTop5":0,"DuoTop12":0,"SquadWins":0,"SquadKills":0,"SquadMatches":0,"SquadTop3":0,"SquadTop6":0}';

const useAuth = create<AuthState>((set, get) => ({
  token: localStorage.getItem("auth.token") || "",
  character: JSON.parse(
    localStorage.getItem("auth.character") || DEFAULT_CHARACTER_STRING
  ) as AuthResponse["character"],
  user: JSON.parse(
    localStorage.getItem("auth.user") || DEFAULT_ACCOUNT_STRING
  ) as AuthResponse["user"],
  login: async (code: string) => {
    console.log("login", code);
    const r = await createAccessToken(code);
    if (!r.success) return;

    localStorage.setItem("auth.token", r.data.access_token);
    localStorage.setItem("auth.character", JSON.stringify(r.data.character));
    localStorage.setItem("auth.user", JSON.stringify(r.data.user));

    set({
      token: r.data.access_token,
      character: r.data.character,
      user: r.data.user,
    });
    if (usePath.getState().path === "/login") {
      usePath.getState().set("/");
    }
  },
  logout: () => {
    localStorage.removeItem("auth.token");
    localStorage.removeItem("auth.character");
    localStorage.removeItem("auth.user");

    set({
      token: "",
      character: undefined,
      user: undefined,
    });
    usePath.getState().set("/login");
  },
  verify: async () => {
    const r = await createExchangeCode(get().token);
    if (!r.success) return get().logout();

    get().login(r.data.code);
  },
  init: () => {
    useEffect(() => {
      get().verify();
    }, []);
  },
}));

export default useAuth;
