/**
 * Adds a Jellyfin access token to a stream URL, replacing any existing one. Audio elements can't
 * send headers, so the token goes in the URL. ApiKey works on all current servers; the legacy
 * api_key is kept for older ones (newer servers ignore it) and can be removed once older servers
 * no longer need supporting.
 *
 * @param src - The track's stream URL, as built by jellyTranspose (without a token).
 * @param accessToken - The current Jellyfin access token.
 */

const getJellyStreamSrc = (src: string, accessToken: string): string => {
  const url = new URL(src);
  url.searchParams.set('ApiKey', accessToken);
  url.searchParams.set('api_key', accessToken);
  return url.toString();
};

export default getJellyStreamSrc;
