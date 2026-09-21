# Color Loop

A small color-matching puzzle built as a Replayable showcase, with original graphics and assets.

## Development

Requires Node.js 24+ and pnpm 10.32.1.

```sh
pnpm install
pnpm dev
```

Run any gameplay version explicitly:

```sh
pnpm dev --version starter-ramp
pnpm dev --version challenge-ramp
pnpm dev --version switchback-reveal
pnpm dev --version quick-switchback
pnpm dev --version switchback-move-teaser
```

Run one command at a time. Stop the server with `Ctrl+C` before starting another version.

| Version                  | Endcard trigger                    |
| ------------------------ | ---------------------------------- |
| `starter-ramp`           | After 3 completed levels           |
| `challenge-ramp`         | After 4 completed levels           |
| `switchback-reveal`      | After 2 completed levels           |
| `quick-switchback`       | After 1 completed level            |
| `switchback-move-teaser` | After 10 accepted color selections |

[Version settings](config/versions.ts) select the sequence and completion limits.
Rejected taps do not count. Behind the endcard, queued chips and level transitions
continue while player input is disabled.

## Work on Replayable locally

Use the same local-package workflow as the Music Mixer example. Stop the development
server before connecting or refreshing. Install dependencies in your cloned Replayable
repository first:

```sh
pnpm --dir /path/to/cloned/replayable install --frozen-lockfile
```

Then run these commands from Color Loop:

```sh
# Build and connect the toolkit checkout.
pnpm replayable:local connect /path/to/cloned/replayable

# Rebuild and reinstall after changing toolkit source.
pnpm replayable:local refresh

# Inspect the current connection.
pnpm replayable:local status

# Return to the saved published dependencies.
pnpm replayable:local restore
```

The helper builds and packs the required Replayable packages, including their toolkit
dependencies. Temporary package paths and overrides keep everything on the same local
checkout. It saves the original manifest and lockfile, and refuses to overwrite dependency
files edited after connecting. Restore before committing dependency files.

Color Loop uses published Replayable `0.1.0-alpha.6` packages, including the `release()`
API. A local toolkit checkout is optional and only needed when developing Replayable itself.

`pnpm replayable:local --help` lists options. The helper supports macOS and Linux; use WSL
on Windows.

## Validation, builds, and network exports

```sh
# Formatting, lint, and TypeScript checks.
pnpm check

# Build every configured version/network/language combination.
pnpm build

# Package the builds for upload.
pnpm export
```

All five versions target Preview, AppLovin, Meta, Google, Liftoff, Mintegral,
Moloco, and Unity in English: 40 builds and exports in total.
[Network settings](config/networks.ts) control which targets are enabled.

Builds live at `dist/<version>/<network>/en/index.html`. Export filenames use
underscores in version names:

| Network   | Export example                          |
| --------- | --------------------------------------- |
| Preview   | `exports/preview_starter_ramp_en.html`  |
| AppLovin  | `exports/applovin_starter_ramp_en.html` |
| Meta      | `exports/meta_starter_ramp_en.html`     |
| Google    | `exports/google_starter_ramp_en.zip`    |
| Liftoff   | `exports/liftoff_starter_ramp_en.zip`   |
| Mintegral | `exports/mintegral_starter_ramp_en.zip` |
| Moloco    | `exports/moloco_starter_ramp_en.html`   |
| Unity     | `exports/unity_starter_ramp_en.html`    |

Upload the generated HTML or ZIP for the chosen network and version. Generated
builds, exports, and asset registries are ignored by Git; regenerate them locally.
Store links intentionally point to the Unity Ads testing app for this showcase.

## Catalog and GitHub Pages

```sh
pnpm build
pnpm catalog
pnpm catalog:preview
```

Open `http://127.0.0.1:4176/`. The catalog includes five browser previews and all
40 exports, with filenames, formats, and sizes taken from Replayable's public
export results. `pnpm catalog` packages existing builds and generates `.site/`;
missing builds or export validation errors stop generation. `pnpm preview`
serves exports directly at `http://127.0.0.1:4174/`.

Version descriptions live in `scripts/catalog/packs.mts`. The catalog uses the
same renderer, styling, and network testing links as Music Mixer.

## CI and deployment

[The workflow](.github/workflows/ci.yml) matches Music Mixer: pull requests,
pushes to `main`, and manual runs install locked dependencies, build all variants,
check formatting/lint/types, and export the catalog on Linux, Windows, and macOS.
Build runs before type checking to generate asset registries.

After all three platforms pass, pushes and manual runs on `main` deploy the
Linux-generated `.site/` to GitHub Pages. Pull requests and manual runs on other
branches only validate. The site includes every browser preview and downloadable
network export. Versions, languages, and networks are discovered from configuration.

To activate deployment, push this project to its GitHub repository and select
**Settings → Pages → Build and deployment → Source → GitHub Actions**.
The workflow uses GitHub's built-in token; no deployment secret is required.
Pages write permissions are limited to the deployment job. This checkout has not
yet been connected to a remote, so remote CI and deployment remain unverified.

## Audio

Original WAV sources live in `assets/sounds/`. The asset pipeline compresses them
as mono audio at 64 kbps. All seven effects and the music loop belong to the
secondary bundle, loaded after the scene is created without delaying interaction.

Effects cover accepted selections, rejected moves, chip landings, chain clears,
level transitions, and level success/failure. Outcome sounds play after a level's
animations settle; opening the endcard alone does not trigger them.

The quiet music loop plays at 18% volume with a one-second fade-in and continues
through transitions and the endcard. Replayable manages audio permission, mute,
and pause/resume; scene teardown stops music. The preview includes a mute control.
Effect volumes are in `src/features/audio/play-sound.ts`; music settings are in
`src/scene/create-main-scene.ts`.

## Structure

- `src/main.ts`: installs Pixi, awaits Replayable readiness, mounts the scene, and initializes devtools and secondary loading.
- `src/scene/create-main-scene.ts`: scene composition.
- `src/types/`: shared types.
- `config/`: focused configuration files, assembled by `replayable.config.ts`.
- `assets/`: original source assets; generated modules belong in `src/assets/`.

Portrait and landscape layouts use safe-area regions with matching reciprocal aspect-ratio limits.
