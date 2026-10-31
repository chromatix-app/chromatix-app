/**
 * Adds a Jellyfin access token to a stream URL, replacing any existing one. Audio elements can't
 * send headers, so the token goes in the URL. ApiKey works on all current servers; the legacy
 * api_key is kept for older ones (newer servers ignore it) and can be removed once older servers
 * no longer need supporting. An invalid URL is returned unchanged, so the player's normal error
 * handling deals with it.
 *
 * @param src - The track's stream URL, as built by jellyTranspose (without a token).
 * @param accessToken - The current Jellyfin access token.
 */

const getJellyStreamSrc = (src: string, accessToken: string): string => {
  try {
    const url = new URL(src);
    url.searchParams.set('ApiKey', accessToken);
    url.searchParams.set('api_key', accessToken);
    return url.toString();
  } catch {
    return src;
  }
};

export default getJellyStreamSrc;
