import axios, { AxiosError, AxiosResponse } from "axios";
import endpoints, { isDev } from "./endpoints";

export interface AuthResponse {
  access_token: string;
  success: boolean;
  character: {
    rarity: string;
    templateId: string;
  };
  user: {
    AccountID: string;
    DiscordID: string;
    DisplayName: string;
    LastLoginTime: string;
    LastLoginIP: string;
    Role: number;
    Banned: boolean;
    BanReason: string;
    Hardware: string;
    SoloWins: number;
    SoloKills: number;
    SoloMatches: number;
    SoloTop10: number;
    SoloTop25: number;
    DuoWins: number;
    DuoKills: number;
    DuoMatches: number;
    DuoTop5: number;
    DuoTop12: number;
    SquadWins: number;
    SquadKills: number;
    SquadMatches: number;
    SquadTop3: number;
    SquadTop6: number;
  };
  athena: {
    XP: number;
    Stars: number;
    Level: number;
    Tier: number;
    PurchasedPass: boolean;
    FullLocker: boolean;
    XPBoost: number;
  };
  common_core: {
    VBucks: number;
  };
}

interface ExchangeCodeResponse {
  code: string;
  success: boolean;
}

export const createAccessToken = async (
  code: string
): Promise<ResponseOrError<AuthResponse>> => {
  const response: AxiosResponse<AuthResponse> | AxiosError<AuthResponse> =
    await axios
      .post(endpoints(isDev).POST_ACCESS_TOKEN_ENDPOINT, {
        exchange_code: code,
      })
      .catch(() => new AxiosError<AuthResponse>());

  if (response instanceof Error) {
    return {
      success: false,
      data: response.response?.data!,
    };
  }

  return {
    success: true,
    data: response.data,
  };
};

export const createExchangeCode = async (
  access_token: string
): Promise<ResponseOrError<ExchangeCodeResponse>> => {
  const response:
    | AxiosResponse<ExchangeCodeResponse>
    | AxiosError<ExchangeCodeResponse> = await axios
    .post(
      endpoints(isDev).POST_EXCHANGE_CODE_ENDPOINT,
      {},
      {
        headers: {
          Authorization: `${access_token}`,
        },
      }
    )
    .catch(() => new AxiosError<ExchangeCodeResponse>());

  if (response instanceof Error) {
    return {
      success: false,
      data: response.response?.data!,
    };
  }

  return {
    success: true,
    data: response.data,
  };
};

export const getDiscordUri = async (): Promise<ResponseOrError<string>> => {
  const response: AxiosResponse<string> | AxiosError<string> = await axios
    .get(endpoints(isDev).GET_DISCORD_URI_ENDPOINT)
    .catch(() => new AxiosError<string>());

  if (response instanceof Error) {
    return {
      success: false,
      data: response.response?.data!,
    };
  }

  return {
    success: true,
    data: response.data,
  };
};
