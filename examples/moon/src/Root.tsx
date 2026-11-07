import { Composition } from 'remotion';
import { Video, TOTAL_FRAMES } from './Video';
import { tokens } from './tokens';

const canvas = tokens.canvas;

export const RemotionRoot = () => (
  <Composition
    id="Main"
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={canvas.fps}
    width={canvas.width}
    height={canvas.height}
  />
);
