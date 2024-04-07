import axios, { AxiosError, AxiosResponse } from "axios";
import endpoints, { isDev } from "./endpoints";
import useAuth from "src/state/auth";

interface FriendsResponse {
  friends: Array<{
    accountId: string;
    activeCharacterTemplateId: string;
    created: string;
    direction: string;
    displayName: string;
    favorite: boolean;
    status: string;
  }>;
  success: boolean;
}

export const getFriends = async (): Promise<
  ResponseOrError<FriendsResponse>
> => {
  const { token } = useAuth.getState();
  const response: AxiosResponse<FriendsResponse> | AxiosError<FriendsResponse> =
    await axios
      .get(endpoints(isDev).GET_FRIENDS_ENDPOINT, {
        headers: {
          Authorization: token,
        },
      })
      .catch((_) => new AxiosError<FriendsResponse>());

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

interface PublicPlayerResponse {
  id: string;
  displayName: string;
  externalAuths: string[];
}

export const getPublicPlayer = async (
  displayName: string
): Promise<ResponseOrError<PublicPlayerResponse>> => {
  const response:
    | AxiosResponse<PublicPlayerResponse>
    | AxiosError<PublicPlayerResponse> = await axios
    .get(endpoints(isDev).GET_USER_PUBLIC_ENDPOINT(displayName))
    .catch((_) => new AxiosError<PublicPlayerResponse>());

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

export const postAddFriend = async (
  accountId: string,
  friendAccountId: string
): Promise<ResponseOrError<null>> => {
  const { token } = useAuth.getState();
  const response: AxiosResponse<null> | AxiosError<null> = await axios
    .post(
      endpoints(isDev).POST_ADD_FRIEND_ENDPOINT(accountId, friendAccountId),
      {
        accountId,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .catch((_) => new AxiosError<null>());

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
