# Deemix

A Deezer album downloader with a web interface, packaged as a macOS app.

This is a personal fork of the revived [deemix](https://github.com/bambanah/deemix) monorepo, which is based on the original work of [RemixDev](https://gitlab.com/RemixDev). It is released under the GPL-3.0 license, see [LICENSE.txt](LICENSE.txt).

## What it does

- Search for artists, tracks and albums and download them from Deezer
- Albums are saved as `Artist/Album/01. Title`, numbered continuously across all discs, with the artist image next to them
- Fixed tagging and naming rules (no settings for them): one main artist per track and album, no "Remaster", "feat.", "Deluxe Edition", "Bonus Track" and similar additions in titles and album names
- You need your own Deezer account. Log in with your ARL cookie in the settings

## Packages

- **deezer-sdk**: wrapper for Deezer's APIs
- **deemix**: the download, tagging and naming logic
- **webui**: [Vue.js](https://vuejs.org/) + [Express](https://expressjs.com/) web interface
- **gui**: the [Electron](https://www.electronjs.org/) app that wraps the web interface

## Development

Requires Node.js 24 and [pnpm](https://pnpm.io/) (`corepack enable`).

```bash
pnpm install
pnpm dev          # web interface on http://localhost:6595
pnpm run ci       # lint, type-check, build and test everything
```

## Building the macOS app

```bash
pnpm package
```

The app is created in `packages/gui/out/`. It is not signed, so macOS may warn on the first start. Remove the quarantine flag to open it:

```bash
xattr -cr packages/gui/out/*/Deemix.app
```
