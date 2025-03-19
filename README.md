# Chromatix Web App<!-- omit in toc -->

Chromatix is a web-based desktop music player for Plex (and hopefully more services in future).

> [!IMPORTANT]
> This codebase is probably a bit of a mess, probably lacks a lot of best practices, and uses some outdated technologies (e.g. create-react-app) that I should probably change, but I still like them or haven’t had time to learn new things (it’s a side project after all).
>
> I also started migrating a few utilities to TypeScript, but it’s a slow process and not complete yet.


# Table of Contents<!-- omit in toc -->
- [1. License](#1-license)
- [2. Getting Started](#2-getting-started)
- [3. Tech Stack](#3-tech-stack)
- [4. Code Structure](#4-code-structure)
- [5. Things I need to improve](#5-things-i-need-to-improve)
- [6. Things I hope to add](#6-things-i-hope-to-add)
- [7. Contributing](#7-contributing)
  - [7.1. Want to help?](#71-want-to-help)
  - [7.2. Please let me know what you’re working on](#72-please-let-me-know-what-youre-working-on)


# 1. License

At the moment the code is open source for transparency, but not for re-distribution in any form. You’re of course welcome to download, modify and build the code for personal use.

That said, if this repo goes more than 12 months without any commits, take this as advance permission that the code is free to use and distribute without limitation from 12 months after the last commit onwards.


# 2. Getting Started

Install with `npm install`

Develop with `npm start`

Deploy a new version to the staging environment with `npm run release`

(Essentially just tags a new version and pushes to the `staging` branch)

Deploy to production by merging the `staging` branch into the `production` branch.


# 3. Tech Stack

This project is built with Create React App, which is deprecated, I know.

It uses Rematch (Redux) for global state management.

It is hosted on Vercel.

Vercel Analytics is used for some basic usage data.

Radix UI is used for some components.

Tanstack Virtual is used for virtualisation of long lists of artists, albums and tracks etc.

The Plex API is entirely undocumented, as far as I can tell, so all Plex API requests are reverse engineered from official Plex clients. They may not be optimised as well as they could be if I had access to official documentation, and include lots of unnecessary data, but they do the job.

All data from the Plex API is transposed into a slightly different format - partly to exclude some data we don’t need, partly to make it a bit easier to understand, and partly because I hope to add other services in future and want to make it easier to switch between them with a consistent data structure.


# 4. Code Structure

Folder structure is hopefully fairly self-explanatory, but a few pointers:

Global state can be found in `/src/js/store`. Some state is saved to localStorage.

Connections to the Plex API can be found in `/src/js/services`.

The audio player is at `/src/js/services/player.js` but playback management is handled in the store, in the `models.player.js` file.


# 5. Things I need to improve

- Queue handling.
- Playback - gapless playback, transcoding etc.


# 6. Things I hope to add

- Linux app(s)
- Jellyfin support
- Column options
- Artist track view
- Alphabet quick jump down the side
- Lyrics
- Queue management
- Playlist management
- Apple AirPlay / Google Cast / Sonos support etc


# 7. Contributing

I’m not particularly looking for contributors, and hadn’t really planned to open the code base as I’m happy keeping this as a personal side project, but I keep getting requests to open source it for the sake of transparency, so here it is.


## 7.1. Want to help?

I don’t expect help, but if any keen devs with good knowledge of the tech do want to help, there’s a few key things that would be useful!

1. The actual player. Gapless playback is a high request, but I think quite challenging with web tech. There’s a few interesting libraries I’ve seen, but they have various pros and cons that don’t seem to make any of them perfect or flawless.
2. Performance improvements.
   - Especially the List components which use virtualisation.
   - API calls to Plex may be able to be optimised.
3. Automated testing. (I DEFINITELY don’t expect people to take on the grunt work, but hey, if that's something that floats anyone's boat then go for it.)


## 7.2. Please let me know what you’re working on

If you do see something you want to help with, feel free to message me here, on Reddit, or on Bluesky with any questions, or to ensure we aren’t working on the same things at once.

> [!IMPORTANT]
> I cant guarantee I’ll merge in any big features or changes, as I still view this largely as a personal project I want to maintain and control myself, so best to check with me before starting anything.
