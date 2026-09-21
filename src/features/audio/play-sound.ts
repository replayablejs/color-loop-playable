import { playable } from '@replayablejs/runtime';

import { sounds } from '#registries';

// Keep repeated gameplay effects softer than the final result.
const volumes = {
  selection: 0.7,
  rejection: 0.55,
  'chip-landing': 0.55,
  match: 0.5,
  'level-transition': 0.7,
  success: 0.8,
  failure: 0.7,
} as const;

/** Replayable drops unavailable one-shots instead of replaying them after resume. */
export function playSound(name: keyof typeof volumes): void {
  playable.audio.playOneShot(sounds[name], { volume: volumes[name] });
}
