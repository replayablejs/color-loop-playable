import { createSprite } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';
import { animate, release, type TweenPlaybackControls } from '@replayablejs/tween';
import { Container } from 'pixi.js';

import { sprites } from '#registries';
import type { Tutorial, TutorialTarget } from '#types/tutorial';

const demonstrationDelaySeconds = 3;
// Cropping the 256px canvas to 207px keeps the visible hand at its existing size.
const handWidthRatio = 1.8 * (207 / 256);

/** The opening level teaches one interaction; the first control tap completes it. */
export function createTutorial(getTarget: () => TutorialTarget | undefined): Tutorial {
  const container = new Container({ label: 'tutorial', eventMode: 'none', visible: false });

  let completed = false;
  let motion: TweenPlaybackControls | undefined;
  let fade: TweenPlaybackControls | undefined;
  let approachDistance = 0;

  const hand = createSprite({
    texture: sprites.hand,
    // Fingertip in the trimmed artwork stays fixed while the hand presses.
    anchor: { x: 19.32 / 207, y: 18.4 / 216 },
  });
  const timer = playable.timers.createInactivityTimer({
    duration: demonstrationDelaySeconds,
    onTimeout: appear,
  });

  container.addChild(hand);

  return { container, restart, consume, destroy };

  function restart(): void {
    cancel();
    if (completed) {
      return;
    }
    timer.restart();
  }

  function consume(): void {
    completed = true;
    cancel();
  }

  /** Approach the first available control, then press and retreat. */
  function appear(): void {
    const target = getTarget();
    if (completed || !target) {
      return;
    }

    const position = container.toLocal(target.position);
    const localSize = target.size / container.worldTransform.a;
    hand.scale.set((localSize * handWidthRatio) / hand.texture.width);
    approachDistance = localSize;
    hand.position.set(position.x + approachDistance, position.y + approachDistance);
    hand.alpha = 0;
    container.visible = true;

    motion = animate(
      hand,
      { x: position.x, y: position.y, alpha: 1 },
      {
        duration: 0.3,
        ease: [0.445, 0.05, 0.55, 0.95],
        onComplete: tap,
      },
    );
  }

  function tap(): void {
    const restingScale = hand.scale.x;
    const pressedScale = restingScale * 0.9;
    motion = animate(
      hand.scale,
      {
        x: [restingScale, pressedScale, restingScale],
        y: [restingScale, pressedScale, restingScale],
      },
      {
        duration: 0.4,
        times: [0, 0.4, 1],
        ease: 'easeInOut',
        onComplete: disappear,
      },
    );
  }

  function disappear(): void {
    fade = animate(
      hand,
      { alpha: 0 },
      {
        duration: 0.2,
        ease: [0.39, 0.575, 0.565, 1],
      },
    );
    motion = animate(
      hand,
      { x: hand.x + approachDistance, y: hand.y + approachDistance },
      {
        duration: 0.3,
        ease: [0.445, 0.05, 0.55, 0.95],
        onComplete: restart,
      },
    );
  }

  function cancel(): void {
    timer.stop();
    motion?.stop();
    fade?.stop();
    motion = undefined;
    fade = undefined;
    release(hand);
    release(hand.scale);
    container.visible = false;
  }

  function destroy(): void {
    consume();
    container.destroy({ children: true });
  }
}
