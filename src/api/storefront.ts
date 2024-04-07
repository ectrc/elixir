import axios, { AxiosError, AxiosResponse } from "axios";
import endpoints, { isDev } from "./endpoints";
import useAuth from "src/state/auth";
import { Storefront } from "src/state/storefront";

export interface StorefrontResponse {
  dailyPurchaseHrs: number;
  expiration: string;
  refreshIntervalHrs: string;
  storefronts: Storefront[];
}

export const getStorefront = async (): Promise<
  ResponseOrError<StorefrontResponse>
> => {
  const { token } = useAuth.getState();
  const response:
    | AxiosResponse<StorefrontResponse>
    | AxiosError<StorefrontResponse> = await axios
    .get(endpoints(isDev).GET_STOREFRONT_ENDPOINT, {
      headers: {
        Authorization: token,
      },
    })
    .catch((_) => new AxiosError<StorefrontResponse>());

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
