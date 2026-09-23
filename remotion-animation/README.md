# Knitting Loop

A cozy, hand-drawn style looping animation of hand-knitting, built with [Remotion](https://www.remotion.dev/) (React + TypeScript).

1080x1080, 5 second seamless loop at 30fps.

## Preview

```bash
npm install
npm start
```

This opens Remotion Studio where you can scrub the `KnittingLoop` composition.

## Render

```bash
npm run build
```

Outputs `out/knitting-loop.mp4`.

## Structure

- `src/KnittingLoop.tsx` - the reusable `<KnittingLoop />` component, composing the scene
- `src/components/Background.tsx` - warm gradient backdrop with a breathing glow
- `src/components/AmbientParticles.tsx` - drifting dust motes for atmosphere
- `src/components/KnittedFabric.tsx` - the growing stockinette swatch
- `src/components/NeedlesAndYarn.tsx` - the two crossing needles, yarn strand and stitch formation
- `src/utils/animation.ts` - shared easing/looping-wave helpers
- `src/constants.ts` - timing, sizing and palette constants
