import axios, { AxiosError, AxiosResponse } from "axios";
import endpoints, { isDev } from "./endpoints";
import useAuth from "src/state/auth";

interface ServerResponse {
  success: boolean;
}

export const postCreateServer = async (
  custom_id: string,
  playlist: string,
  region: string
): Promise<ResponseOrError<ServerResponse>> => {
  const { token } = useAuth.getState();
  const response: AxiosResponse<ServerResponse> | AxiosError<ServerResponse> =
    await axios
      .post(
        endpoints(isDev).POST_CREATE_SERVER_ENDPOINT,
        {
          sessionId: custom_id,
          playlist,
          region,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .catch((_) => new AxiosError<ServerResponse>());

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

export const postEditServer = async (
  custom_id: string,
  state: string
): Promise<ResponseOrError<ServerResponse>> => {
  const { token } = useAuth.getState();
  const response: AxiosResponse<ServerResponse> | AxiosError<ServerResponse> =
    await axios
      .post(
        endpoints(isDev).POST_EDIT_SERVER_ENDPOINT,
        {
          sessionId: custom_id,
          state,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .catch((_) => new AxiosError<ServerResponse>());

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

export const postDeleteServer = async (
  custom_id: string
): Promise<ResponseOrError<ServerResponse>> => {
  const { token } = useAuth.getState();
  const response: AxiosResponse<ServerResponse> | AxiosError<ServerResponse> =
    await axios
      .post(
        endpoints(isDev).POST_DELETE_SERVER_ENDPOINT,
        {
          sessionId: custom_id,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .catch((_) => new AxiosError<ServerResponse>());

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

export const postDeleteAllServers = async (): Promise<
  ResponseOrError<ServerResponse>
> => {
  const { token } = useAuth.getState();
  const response: AxiosResponse<ServerResponse> | AxiosError<ServerResponse> =
    await axios
      .post(
        endpoints(isDev).POST_DELETE_ALL_SERVERS_ENDPOINT,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .catch((_) => new AxiosError<ServerResponse>());

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
