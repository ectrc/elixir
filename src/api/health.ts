import endpoints, { isDev } from "./endpoints";
import { GameServer } from "src/state/health";
import axios, { AxiosError, AxiosResponse } from "axios";
import useAuth from "src/state/auth";

interface HealthResponse {
  servers: Record<string, GameServer>;
}

export const getHealth = async (): Promise<ResponseOrError<HealthResponse>> => {
  const { token } = useAuth.getState();

  const response: AxiosResponse<HealthResponse> | AxiosError<HealthResponse> =
    await axios
      .get(endpoints(isDev).GET_SERVERS_ENDPOINT, {
        headers: {
          Authorization: token,
        },
      })
      .catch((_) => new AxiosError<HealthResponse>());

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
