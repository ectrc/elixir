export const getBase = (useDev: boolean) =>
  useDev ? "http://localhost:3000" : "https://prod.elixirfn.com";
export const pakBase = "https://builds.elixirfn.com/pak";
export const buildsEndpoint =
  "https://builds.elixirfn.com/versions/builds.json";
const forceProd = true;
export const isDev = forceProd ? false : process.env.NODE_ENV === "development";

const endpoints = (useDev: boolean) => {
  const base = getBase(useDev);

  return {
    POST_ACCESS_TOKEN_ENDPOINT: `${base}/api/launcher/account`,
    POST_EXCHANGE_CODE_ENDPOINT: `${base}/api/launcher/code`,
    GET_DISCORD_URI_ENDPOINT: `${base}/api/oauth/discord`,
    GET_FRIENDS_ENDPOINT: `${base}/api/launcher/friends`,
    GET_CONTENT_PAGES_ENDPOINT: `${base}/content/api/pages/fortnite-game`,
    GET_NEWS_ENDPOINT: `${base}/api/launcher/news`,
    GET_SIZES_ENDPOINT: `${base}/api/launcher/sizes`,
    GET_SERVERS_ENDPOINT: `${base}/api/launcher/health`,
    GET_BUILDS_ENDPOINT: `${base}/versions/builds.json`,
    GET_STOREFRONT_ENDPOINT: `${base}/api/launcher/storefront`,

    GET_USER_PUBLIC_ENDPOINT: (displayName: string) =>
      `${base}/account/api/public/account/displayName/${displayName}`,
    POST_ADD_FRIEND_ENDPOINT: (accountId: string, friendId: string) =>
      `${base}/api/launcher/friends/${accountId}/${friendId}`,

    POST_CREATE_SERVER_ENDPOINT: `${base}/api/launcher/dev/server/create`,
    POST_EDIT_SERVER_ENDPOINT: `${base}/api/launcher/dev/server/update`,
    POST_DELETE_SERVER_ENDPOINT: `${base}/api/launcher/dev/server/remove`,
    POST_DELETE_ALL_SERVERS_ENDPOINT: `${base}/api/launcher/dev/server/kill`,
  };
};

export default endpoints;
