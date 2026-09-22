// Shared timing, sizing and palette constants for the KnittingLoop composition.
// Keeping these in one place makes every sub-component reference the same
// numbers, which is what keeps the loop mathematically seamless.

export const FPS = 30;
// 5 second loop (150 frames). Long enough to read all five animation beats,
// short enough to feel snappy when it repeats on a social feed.
export const DURATION_IN_FRAMES = 150;
export const WIDTH = 1080;
export const HEIGHT = 1080;

// The point in the scene where the two needle tips meet and new stitches
// are formed. Everything (needle offsets, yarn wrap, fabric top edge) is
// positioned relative to this so the whole "stitch factory" reads as one
// coherent close-up.
export const WORK_POINT = {x: 540, y: 600};

// --- Animation phase boundaries (in frames, out of DURATION_IN_FRAMES) ---
// The five story beats from the brief, laid out along the timeline so that
// frame 0 and frame (DURATION_IN_FRAMES - 1) land on matching poses, which
// is what makes the exported video loop without a visible seam.
export const PHASES = {
  insert: {start: 0, end: 30}, // needle tip travels into the waiting loop
  wrap: {start: 30, end: 68}, // yarn spirals around the tip
  pull: {start: 68, end: 106}, // new loop pulled through, old stitch slides off
  grow: {start: 96, end: 136}, // fabric gains a row (overlaps the tail of "pull")
  reset: {start: 136, end: DURATION_IN_FRAMES}, // settle back to the frame-0 pose
} as const;

export const PALETTE = {
  backgroundTop: '#f7ead2',
  backgroundBottom: '#ecd6ae',
  glow: '#fff3da',
  fabricBase: '#c97b5b',
  fabricShadow: '#a85f43',
  fabricHighlight: '#e0916d',
  accentSage: '#8fa377',
  accentSageDark: '#71875a',
  yarnActive: '#e0916d',
  yarnActiveDark: '#c97b5b',
  needleBody: '#b08a5f',
  needleHighlight: '#e2c99a',
  needleOutline: '#7c5c3c',
  dust: '#fff6e4',
} as const;
