import { playable } from '@replayablejs/runtime';
import { animate, release, type TweenPlaybackControls } from '@replayablejs/tween';

import type { LevelTransition, LevelTransitionOptions } from '#types/level-transition';

import { levelTransition } from '../../config/level-transition';
import { playSound } from '../../features/audio/play-sound';

/** Hide outgoing controls, then move the old level out and the new level in. */
export function playLevelTransition({
  outgoing,
  incoming,
  onComplete,
}: LevelTransitionOptions): LevelTransition {
  const { orientation, viewport } = playable.screen;
  const { duration, padding } = levelTransition;
  const portrait = orientation === 'portrait';
  const distance = (portrait ? viewport.width : viewport.height) + padding;
  const outgoingPosition = outgoing.container.position;
  const incomingPosition = incoming.position;
  let active = true;
  let animation: TweenPlaybackControls | undefined;

  // Place the incoming view offscreen before it can render its first frame.
  incomingPosition.set(portrait ? distance : 0, portrait ? 0 : -distance);
  outgoing.hideControls(moveLevels);

  return { finish, stop };

  function moveLevels(): void {
    if (!active) {
      return;
    }
    playSound('level-transition');
    animation = animate(
      [
        [
          outgoingPosition,
          { x: portrait ? -distance : 0, y: portrait ? 0 : distance },
          { duration, ease: 'backIn' },
        ],
        [incomingPosition, { x: 0, y: 0 }, { at: duration, duration, ease: 'backOut' }],
      ],
      { onComplete: finish },
    );
  }

  function finish(): void {
    if (!active) {
      return;
    }
    stop();
    incomingPosition.set(0, 0);
    onComplete();
  }

  /** Release queued writes before the scene destroys either gameplay wrapper. */
  function stop(): void {
    active = false;
    animation?.stop();
    release(outgoingPosition);
    release(incomingPosition);
  }
}
