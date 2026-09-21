import { playable } from '@replayablejs/runtime';
import { animate, release, type TweenPlaybackControls } from '@replayablejs/tween';
import { Container, Graphics } from 'pixi.js';

import type { ColorControl } from '#types/color-control';
import type { ChipColor } from '#types/level';

import { palette } from '../../config/palette';
import { createTile } from '../tile/create-tile';
import { colorControlsStyle } from './configs/color-controls-style';
import { playColorControlFeed } from './play-color-control-feed';

/** Own one slot's artwork and input; the model decides what a tap does. */
export function createColorControl(
  initialColor: ChipColor | null,
  onSelect: () => void,
): ColorControl {
  const container = new Container({ label: 'color-control' });
  const { chipSize, traySize, trayRadius, chipCenterX, chipCenterY } = colorControlsStyle;

  const artwork = new Container({ label: 'control-artwork' });
  const tray = new Graphics()
    .roundRect(0, 0, traySize, traySize, trayRadius)
    .fill({ color: palette.track, alpha: 0.22 });
  let chip: Container | undefined;
  let color: ChipColor | null | undefined;
  let feedback: TweenPlaybackControls | undefined;
  let feedAnimation: TweenPlaybackControls | undefined;

  container.addChild(tray, artwork);
  container.boundsArea = tray.getLocalBounds().rectangle.clone();
  container.cursor = 'pointer';
  container.on('pointertap', onSelect);
  container.once('destroyed', () => {
    stopFeed();
    stopFeedback();
  });
  setColor(initialColor);

  return { container, setColor, playFeed, finishFeed, playEntrance, playReject };

  /** Keep the tray and listener; replace only artwork whose color changed. */
  function setColor(nextColor: ChipColor | null): void {
    if (color === nextColor) {
      return;
    }
    color = nextColor;
    // The model refills immediately; keep the outgoing chip visible until it exits.
    if (!feedAnimation) {
      renderChip();
    }
  }

  function playFeed(): void {
    if (!chip || feedAnimation) {
      return;
    }
    stopFeedback();
    container.eventMode = 'none';
    feedAnimation = playColorControlFeed(chip, finishFeed);
  }

  /** Also settle a running feed before controls reflow during orientation changes. */
  function finishFeed(): void {
    if (!feedAnimation) {
      return;
    }
    stopFeed();
    renderChip();
  }

  /** Disconnect queued writes before replacing or destroying the outgoing artwork. */
  function stopFeed(): void {
    feedAnimation?.stop();
    feedAnimation = undefined;
    if (chip) {
      release(chip);
    }
  }

  /** Chips lag behind the tray's entrance, then settle into place. */
  function playEntrance(): void {
    stopFeedback();
    const portrait = playable.screen.orientation === 'portrait';
    const distance = chipSize * 0.2;
    feedback = animate([
      [
        artwork.position,
        { x: portrait ? 0 : -distance, y: portrait ? -distance : 0 },
        { at: 0.12, duration: 0.1, ease: [1 / 3, 1, 2 / 3, 1] },
      ],
      [artwork.position, { x: 0, y: 0 }, { at: 0.22, duration: 0.18, ease: 'backOut' }],
    ]);
  }

  function playReject(): void {
    if (!chip || feedAnimation) {
      return;
    }
    stopFeedback();
    const distance = chipSize * 0.08;
    feedback = animate([
      [artwork.position, { x: -distance }, { duration: 0.08, ease: [1 / 3, 1, 2 / 3, 1] }],
      [artwork.position, { x: distance }, { duration: 0.08, ease: [1 / 3, 1, 2 / 3, 1] }],
      [artwork.position, { x: 0 }, { duration: 0.08, ease: [1 / 3, 1, 2 / 3, 1] }],
    ]);
  }

  function stopFeedback(): void {
    feedback?.stop();
    feedback = undefined;
    release(artwork.position);
    artwork.position.set(0, 0);
  }

  function renderChip(): void {
    stopFeedback();
    chip?.destroy({ children: true });
    chip = undefined;

    // Empty slots remain visible until the whole controls group exits.
    container.eventMode = color == null ? 'none' : 'static';
    if (color == null) {
      return;
    }

    chip = createTile('dot', chipSize, color);
    chip.position.set(chipCenterX, chipCenterY);
    artwork.addChild(chip);
  }
}
