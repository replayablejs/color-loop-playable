import type { ReplayableAssetsConfigInput } from '@replayablejs/config';

export default {
  sourceDir: 'assets',
  outDir: 'src/assets/resources',
  // Audio loads after the scene is ready, without blocking interaction.
  bundles: {
    secondary: { include: ['sounds/**'] },
  },
  // Replayable processes source assets and generates their typed registries.
  assets: {
    // Include translations in primary so they are ready before scene creation.
    locales: [{}],
    sounds: [
      {
        options: { channels: 'mono', bitrate: 64 },
      },
    ],
    fonts: [{ options: { family: 'Archivo Black' } }],
    // Chip parts share one atlas; packing preserves each frame’s original bounds.
    atlases: [{}],
    sprites: [
      {},
      {
        match: 'logo.png',
        // The layout caps the logo at 256px; 512px covers the maximum 2x resolution.
        options: { scale: 512 / 1467 },
      },
    ],
  },
  emit: {
    assets: 'src/assets/assets.ts',
    registries: 'src/assets/registries',
  },
} satisfies ReplayableAssetsConfigInput;
