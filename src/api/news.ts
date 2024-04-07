import axios, { AxiosError, AxiosResponse } from "axios";
import endpoints, { isDev } from "./endpoints";
import * as icons from "react-icons/hi";
import useAuth from "src/state/auth";

export interface FNNewsResponse {
  battleroyalenews: {
    news: {
      messages: {
        title: string;
        body: string;
        image: string;
        hidden: boolean;
        spotlight: boolean;
      }[];
    };
  };
  battlepassaboutmessages: Record<string, unknown>;
  subgameselectdata: Record<string, unknown>;
  playlistinformation: Record<string, unknown>;
  tournamentinformation: Record<string, unknown>;
}

export interface LNewsResponse {
  title: string;
  body: string;
  icon: keyof typeof icons;
  colouredIcon: boolean;
}

export const getFortniteNews = async (): Promise<
  ResponseOrError<FNNewsResponse>
> => {
  const response: AxiosResponse<FNNewsResponse> | AxiosError<FNNewsResponse> =
    await axios
      .get(endpoints(isDev).GET_CONTENT_PAGES_ENDPOINT)
      .catch((_) => new AxiosError<FNNewsResponse>());

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

export const getLauncherNews = async (): Promise<
  ResponseOrError<LNewsResponse[]>
> => {
  const { token } = useAuth.getState();

  const response: AxiosResponse<LNewsResponse[]> | AxiosError<LNewsResponse[]> =
    await axios
      .get(endpoints(isDev).GET_NEWS_ENDPOINT, {
        headers: {
          Authorization: token,
        },
      })
      .catch((_) => new AxiosError<LNewsResponse[]>());

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
