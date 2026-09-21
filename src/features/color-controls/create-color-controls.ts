import { playable } from '@replayablejs/runtime';
import { animate, release, type TweenPlaybackControls } from '@replayablejs/tween';
import { Container, Rectangle } from 'pixi.js';

import type { ColorControls } from '#types/color-control';
import type { ChipColor } from '#types/level';
import type { TutorialTarget } from '#types/tutorial';

import { colorControlsStyle } from './configs/color-controls-style';
import { createColorControl } from './create-color-control';

/** Arrange fixed control slots and pass each slot its supplied color. */
export function createColorControls(
  initialColors: readonly (ChipColor | null)[],
  onSelect: (controlIndex: number) => void,
): ColorControls {
  const container = new Container({ label: 'color-controls' });
  const content = new Container({ label: 'controls-content', alpha: 0 });

  let transition: TweenPlaybackControls | undefined;
  let afterHide: (() => void) | undefined;
  let isShown = false;
  let colors = initialColors;

  const controls = initialColors.map((color, controlIndex) =>
    createColorControl(color, () => onSelect(controlIndex)),
  );

  content.addChild(...controls.map((control) => control.container));
  container.addChild(content);
  container.once('destroyed', stopTransition);
  resize();

  return {
    container,
    refresh,
    resize,
    playFeed,
    playReject,
    getTutorialTarget,
    show,
    hide,
  };

  function refresh(nextColors: readonly (ChipColor | null)[]): void {
    colors = nextColors;
    controls.forEach((control, index) => control.setColor(colors[index] ?? null));
  }

  /** Reposition existing slots before the parent layout measures and fits them. */
  function resize(): void {
    finishTransition();

    const portrait = playable.screen.orientation === 'portrait';
    const { spacing, traySize } = colorControlsStyle;

    controls.forEach((control, index) => {
      control.finishFeed();
      const offset = index * spacing;
      control.container.position.set(portrait ? offset : 0, portrait ? 0 : offset);
    });

    // Explicit slot bounds stay stable even when a chip is hidden or cleared.
    const length = traySize + Math.max(0, controls.length - 1) * spacing;
    container.boundsArea = new Rectangle(
      0,
      0,
      portrait ? length : traySize,
      portrait ? traySize : length,
    );
  }

  function playFeed(controlIndex: number): void {
    controls[controlIndex].playFeed();
  }

  function playReject(controlIndex: number): void {
    controls[controlIndex].playReject();
  }

  /** Use the first occupied slot, with coordinates shared across layout containers. */
  function getTutorialTarget(): TutorialTarget | undefined {
    const index = colors.findIndex((color) => color !== null);
    if (index === -1) {
      return undefined;
    }

    const slot = controls[index].container;
    const { chipCenterX, chipCenterY, chipSize } = colorControlsStyle;
    const position = slot.toGlobal({ x: chipCenterX, y: chipCenterY });
    return { position, size: chipSize * slot.worldTransform.a };
  }

  /** Enter from below in portrait or from the right in landscape. */
  function show(): void {
    stopTransition();
    isShown = true;

    const portrait = playable.screen.orientation === 'portrait';
    const distance = colorControlsStyle.chipSize * 2;
    content.position.set(portrait ? 0 : distance, portrait ? distance : 0);
    content.alpha = 0;

    transition = animate(
      content,
      { x: 0, y: 0, alpha: 1 },
      {
        duration: 0.16,
        ease: [0.165, 0.84, 0.44, 1],
      },
    );
    controls.forEach((control) => control.playEntrance());
  }

  /** Called after the last board animation, before the next level moves in. */
  function hide(onComplete: () => void): void {
    stopTransition();
    isShown = false;
    afterHide = onComplete;

    const portrait = playable.screen.orientation === 'portrait';
    const distance = colorControlsStyle.chipSize * 2;
    transition = animate(
      content,
      {
        x: portrait ? 0 : distance,
        y: portrait ? distance : 0,
        alpha: 0,
      },
      { duration: 0.16, ease: [0.895, 0.03, 0.685, 0.22], onComplete: finishTransition },
    );
  }

  /** Settle before resizing, and deliver a pending exit callback once. */
  function finishTransition(): void {
    stopTransition();
    content.position.set(0, 0);
    content.alpha = isShown ? 1 : 0;

    const callback = afterHide;
    afterHide = undefined;
    callback?.();
  }

  function stopTransition(): void {
    transition?.stop();
    transition = undefined;
    release(content);
  }
}
