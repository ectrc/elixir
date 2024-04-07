import axios, { AxiosError, AxiosResponse } from "axios";
import endpoints, { isDev } from "./endpoints";
interface FilesResponse {
  success: boolean;
  files: Record<string, number>;
}

export const getFileSizes = async (): Promise<
  ResponseOrError<FilesResponse["files"]>
> => {
  const response: AxiosResponse<FilesResponse> | AxiosError<FilesResponse> =
    await axios
      .get(endpoints(isDev).GET_SIZES_ENDPOINT)
      .catch((_) => new AxiosError<FilesResponse>());

  if (response instanceof Error) {
    return {
      success: false,
      data: response.response?.data!.files!,
    };
  }

  return {
    success: true,
    data: response.data.files,
  };
};
