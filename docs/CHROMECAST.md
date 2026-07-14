# Chromecast Support

Chromatix can cast music to Google Cast devices (Chromecast, Chromecast Audio, Google/Nest speakers, and other Cast-enabled speakers) on your local network. The audio streams directly from your Plex or Jellyfin server to the Cast device — the browser only acts as a remote control, so you can keep browsing (or close the volume right down) while music plays on your speakers.

## Table of contents<!-- omit in toc -->

- [1. Using it](#1-using-it)
- [2. Requirements](#2-requirements)
- [3. How it works](#3-how-it-works)
  - [3.1. Architecture](#31-architecture)
  - [3.2. What the Cast device plays](#32-what-the-cast-device-plays)
  - [3.3. Session handoff](#33-session-handoff)
  - [3.4. Volume](#34-volume)
- [4. Limitations](#4-limitations)
- [5. Troubleshooting](#5-troubleshooting)
- [6. Files involved](#6-files-involved)

## 1. Using it

1. Open Chromatix in Chrome (or another Chromium browser with Cast support, e.g. Edge).
2. When Cast devices are discovered on your network, a cast icon appears in the bottom control bar (next to the queue and volume buttons).
3. Click it and pick a device. If a track is playing, it hands off to the device from the same position.
4. Playback controls, the progress scrubber, and the volume slider now control the Cast device. The volume slider adjusts the device's own volume, and stays in sync if you change it elsewhere (e.g. the Google Home app).
5. Click the cast button again and choose **Stop casting** to disconnect. The current track is handed back to the browser, paused, at the position the device reached.

The cast button can be hidden under **Settings → Controls → Secondary Controls** if you never use it.

## 2. Requirements

- **Browser**: Google Chrome or another Chromium browser that ships the Cast API (Edge works; Brave needs its Media Router setting enabled). Firefox, Safari, and iOS browsers don't support the Cast Web Sender API. Casting is also unavailable in the Chromatix desktop (Electron) app — Electron doesn't include Chrome's Cast internals.
- **Network**: the Cast device must be able to reach your media server directly. It fetches the stream itself — the browser doesn't proxy the audio — so the device and the server need to be on the same network (or otherwise routable).
  - **Plex with "secure connections"** uses `https://…plex.direct:32400` URLs. These are public DNS names that resolve to your server's LAN IP, so they work on Cast devices out of the box in most homes. If your router has strict DNS-rebinding protection that intercepts the Google DNS (8.8.8.8) that Cast devices use, see [Troubleshooting](#5-troubleshooting).
  - **Jellyfin** just needs its server URL reachable from the device (a LAN IP or hostname works; the stream URL carries the auth token as a query parameter).
- **HTTPS**: the hosted app at `chromatix.app` satisfies the Cast SDK's secure-origin requirement; `http://localhost` also works for development.

## 3. How it works

### 3.1. Architecture

Playback in Chromatix is routed by `src/js/services/player.ts` to one of three sub-players, all exposing the same interface (`loadTrack`, `pause`, `resume`, `setProgress`, `getCurrentProgress`, `setVolume`, …):

| Sub-player         | Used for                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| `player.native.ts` | Codecs the browser plays natively (HTMLAudioElement)                       |
| `player.dash.ts`   | Plex tracks the browser can't play — in-browser DASH transcode via dash.js |
| `player.cast.ts`   | **All playback while a cast session is connected**                         |

`player.cast.ts` wraps the [Google Cast Web Sender (CAF) SDK](https://developers.google.com/cast/docs/web_sender). The SDK script is injected at player init (skipped in Electron); if the browser doesn't support casting, the SDK reports unavailable and the cast button never renders. Sessions use the **Default Media Receiver** (`CC1AD845`), so no receiver app registration with Google is required.

As with the other sub-players, `player.cast.ts` holds no app state: it translates remote-player events (media finished, remote pause, device volume changed, session ended) into the same callbacks the local players use, plus a few cast-specific ones, and the Rematch store (`models.player.js`) remains the single source of truth for playback state. Track progression therefore works exactly as it does locally: when the receiver reports the track finished (`idleReason === FINISHED`), the store's `playerNext` loads the next track onto the device.

### 3.2. What the Cast device plays

Cast devices can direct play MP3, AAC, FLAC (up to 96 kHz / 24-bit), Vorbis, Opus, and WAV — but not ALAC, AIFF, or WMA. `src/js/utils/requiresCastTranscoding.ts` holds this allowlist (a static list, unlike `requiresTranscoding.ts`, which probes the _browser's_ capabilities — irrelevant when the playback device is remote).

- **Direct play** — compatible codecs use the same original-file URL (`track.src`) the browser uses, streamed straight from the server.
- **Transcode** — incompatible codecs get a `castSrc` computed at load time:
  - Plex: `src/js/utils/getCastSrc.ts` builds a **progressive MP3 (320 kbps)** URL via Plex's universal transcoder — the same transcoder the DASH player uses, but with `protocol=http`, because adaptive protocols (DASH/HLS) require CORS headers on the media server which Plex doesn't send, while progressive streams have no CORS requirement on the Default Media Receiver.
  - Jellyfin: `src/js/utils/getJellyCastSrc.ts` builds a progressive MP3 URL via Jellyfin's `/Audio/{id}/universal` endpoint (`transcodingProtocol=http`, `transcodingContainer=mp3`).

Auth tokens ride along as query parameters on both stream and artwork URLs, because the receiver fetches them itself and cannot send headers.

### 3.3. Session handoff

- **Connecting**: the local player's position and play state are captured, local players are silenced, and the current track is loaded onto the device at the same position.
- **Disconnecting**: the device's last position is captured (via the SDK's `savedPlayerState`), and the track is reloaded in the browser at that position — **paused**, so your laptop doesn't unexpectedly start blasting audio.
- **Page reload while casting**: the session is rejoined automatically (`ORIGIN_SCOPED` auto-join). If the device is mid-track, Chromatix adopts the remote state instead of interrupting playback.
- **Logout**: the cast session is ended and the device stops.

### 3.4. Volume

While casting, the volume slider controls the **device's own volume** (like the Spotify connect-style behaviour):

- On connect, Chromatix adopts the device's current volume into the slider — connecting never blasts your speakers with the app's local volume.
- Volume changes made elsewhere (device buttons, Google Home app, another sender) sync back to the slider.
- On disconnect, local player volume is re-aligned with the slider.

## 4. Limitations

- **No gapless playback**: tracks are loaded onto the receiver one at a time when the previous one finishes, so there's a short gap — same as local playback in Chromatix today. (The Cast queueing API could improve this in future.)
- **Seeking within transcoded tracks** may be unreliable: the receiver seeks progressive transcode streams with HTTP range requests, which the Plex/Jellyfin transcoder may not fully support until the transcode has buffered. Direct-played tracks seek fine.
- **Hi-res FLAC above 96 kHz / 24-bit** is outside Chromecast Audio's direct-play spec, but is still direct played (track metadata doesn't expose sample rate/bit depth to check). If a track fails on the device, Chromatix shows the standard playback error and auto-advances.
- **Hardware media keys** may not work while casting: the browser only reliably routes media-key events to pages that are playing audio locally.
- **One sender at a time is authoritative**: remote pause/volume from other senders sync back, but track changes made by other apps controlling the same device will end Chromatix's media session.
- **Closing the tab while casting** leaves the device playing the current track (the session survives; reopening Chromatix rejoins it), but the next track won't auto-load until a sender is connected — the Default Media Receiver has no queue of its own.

## 5. Troubleshooting

- **No cast button**: the button only renders when the Cast SDK reports devices on your network. Check you're in Chrome/Edge, the device is on the same network/VLAN as the computer, and mDNS isn't blocked between them.
- **Connects but errors on every track (Plex, secure connections)**: the device likely can't resolve your `*.plex.direct` URL. Cast devices use Google DNS (8.8.8.8) directly, which normally sidesteps router DNS-rebinding protection — but if your router intercepts outbound DNS (port 53), whitelist `plex.direct` in the router's resolver (e.g. dnsmasq: `rebind-domain-ok=/plex.direct/`).
- **Connects but errors on every track (Jellyfin / insecure Plex)**: check the server base URL Chromatix is using is one the device can reach (a LAN IP, not `localhost` or a hostname only your computer knows). Self-signed HTTPS certificates are rejected by Cast devices — use plain `http://` on the LAN or a real certificate.
- **Track plays but artwork/titles missing in Google Home**: harmless — some receivers only surface metadata on displays, not speakers.

## 6. Files involved

| File                                          | Role                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/js/services/player.cast.ts`              | Cast sub-player: SDK loading, session lifecycle, remote events, media loading                         |
| `src/js/services/player.ts`                   | Player router: routes all playback to the cast player while connected                                 |
| `src/js/store/models.player.js`               | Cast state (`castAvailable`/`castConnected`/`castDeviceName`), handoff effects, `castSrc` computation |
| `src/js/utils/requiresCastTranscoding.ts`     | Chromecast codec allowlist                                                                            |
| `src/js/utils/getCastSrc.ts`                  | Plex progressive MP3 transcode URL builder                                                            |
| `src/js/utils/getJellyCastSrc.ts`             | Jellyfin progressive MP3 transcode URL builder                                                        |
| `src/types/cast.d.ts`                         | Minimal ambient types for the Cast Web Sender SDK                                                     |
| `src/types/player.ts`                         | Shared player/track types, incl. cast callbacks                                                       |
| `src/js/components/ControlBar/ControlBar.jsx` | Cast button UI                                                                                        |
| `src/js/components/SettingsControls/`         | Setting to show/hide the cast button                                                                  |
