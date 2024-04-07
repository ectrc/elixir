import axios, { AxiosError, AxiosResponse } from "axios";

import { buildsEndpoint } from "./endpoints";

export interface BuildResponse {
  build: string;
  cl: string;
  release_data: string;
  download: string;
}

export const getBuilds = async (): Promise<
  ResponseOrError<BuildResponse[]>
> => {
  const response: AxiosResponse<BuildResponse[]> | AxiosError<BuildResponse[]> =
    await axios
      .get(buildsEndpoint)
      .catch((_) => new AxiosError<BuildResponse[]>());

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
