# Chromatix - Web App<!-- omit in toc -->

Chromatix is a desktop music player for Plex, that transforms your listening experience and makes interacting with your music libraries a joy.

Get started at [https://chromatix.app/](https://chromatix.app/)

# Table of contents<!-- omit in toc -->

- [1. Introduction](#1-introduction)
- [2. License](#2-license)
- [3. Getting started](#3-getting-started)
- [4. Deployment](#4-deployment)
- [5. Tech stack](#5-tech-stack)
- [6. Code structure](#6-code-structure)
- [7. Husky + Git Commit Hooks](#7-husky--git-commit-hooks)
- [8. Roadmap, feature requests and bug reports](#8-roadmap-feature-requests-and-bug-reports)
- [9. Contributing](#9-contributing)
  - [9.1. Want to help?](#91-want-to-help)
  - [9.2. Please let me know what you’re working on](#92-please-let-me-know-what-youre-working-on)

# 1. Introduction

> [!IMPORTANT]
> Chromatix is a solo side project of mine, so I don't have the time or resources to maintain it as a full-time project. I do my best to keep it running, but please be patient with any issues or delays in updates.
>
> This codebase is probably a bit of a mess, probably lacks a lot of best practices, and uses some outdated technologies (e.g. create-react-app) that I should probably change, but I either still like them or haven’t had time to migrate to newer things yet.
>
> I also started migrating a few utilities to TypeScript, but it’s a slow process, not complete yet, and not a high priority for me.

# 2. License

At the moment the code is open source for transparency, but not for re-distribution in any form. You’re of course welcome to download, modify and build the code for personal use.

That said, if this repo goes more than 12 months without any commits, take this as advance permission that the code is free to use and distribute without limitation from 12 months after the last commit onwards.

# 3. Getting started

Install with `npm install`

Develop with `npm start`

# 4. Deployment

Deploy a new version to the staging environment with `npm run release:stage`

(Essentially just tags a new beta version and pushes to the `staging` branch)

Deploy to production by running `npm run release:prod`

(Essentially just tags a new version and pushes to the `production` branch)

# 5. Tech stack

This project is built with Create React App (which is deprecated, I know).

It uses Rematch (Redux) for global state management.

It is hosted on Vercel.

Vercel Analytics is used for some basic usage data and error logging.

Radix UI is used for some components.

Tanstack Virtual is used for virtualisation of long lists of artists, albums and tracks.

The Plex API is entirely undocumented, as far as I can tell, so all Plex API requests are reverse engineered from official Plex clients. They may not be optimised as well as they could be if I had access to official documentation, and include lots of unnecessary data, but they do the job.

All data from the Plex API is transposed into a slightly different format - partly to exclude some data we don’t need, partly to make it a bit easier to understand, and partly because I hope to add other services in future and want to make it easier to switch between them with a consistent data structure.

# 6. Code structure

Folder structure is hopefully fairly self-explanatory, but a few pointers:

Global state can be found in `/src/js/store`. Some state is saved to localStorage so that user preferences are remembered.

Connections to the Plex API can be found in `/src/js/services`.

The audio player is at `/src/js/services/player.js` but playback management is handled in the store, in the `models.player.js` file.

# 7. Husky + Git Commit Hooks

This repo uses [Husky](https://typicode.github.io/husky/) to ensure that certain tasks are run before committing code.

This includes:

1. Running eslint to check for code quality issues.
2. Running prettier to format code.
3. Running tests to ensure code correctness.

If any of these fail, the commit will be aborted, and you will need to fix the issues.

You can also run these tasks manually using the following commands:

```bash
npm run lint
npm run prettier
npm run test
```

# 8. Roadmap, feature requests and bug reports

You can find the roadmap at [Featurebase](https://chromatix.featurebase.app/roadmap).

This is also the best place for feature requests and bug reports, as it allows you to vote on features and see what others are requesting.

# 9. Contributing

I’m not particularly looking for contributors, and hadn’t really planned to open the code base as I’m happy keeping this as a personal side project, but I keep getting requests to open source it for the sake of transparency, so here it is.

## 9.1. Want to help?

I don’t expect help, but if any keen devs with good knowledge of the tech do want to help, there’s a few key things that would be useful!

1. The actual player. Gapless playback is a high request, but I think quite challenging with web tech. There’s a few interesting libraries I’ve seen, but they have various pros and cons that don’t seem to make any of them perfect or flawless.
2. Performance improvements.
   - Especially the List components which use virtualisation.
   - API calls to Plex may be able to be optimised.
3. Automated testing. (I DEFINITELY don’t expect people to take on the grunt work, but hey, if that's something that floats anyone's boat then go for it.)

## 9.2. Please let me know what you’re working on

If you do see something you want to help with, feel free get in touch here on Github, on [Reddit](https://www.reddit.com/r/chromatix/), or on [Bluesky](https://bsky.app/profile/chromaticnova.com) with any questions, or to ensure we aren’t working on the same things at once.

> [!IMPORTANT]
> I cant guarantee I’ll merge in any big features or changes, as I still view this largely as a personal project I want to maintain and control myself, so best to check with me before starting anything.
