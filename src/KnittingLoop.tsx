import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background} from './components/Background';
import {AmbientParticles} from './components/AmbientParticles';
import {KnittedFabric} from './components/KnittedFabric';
import {NeedlesAndYarn} from './components/NeedlesAndYarn';

/**
 * A cozy, hand-drawn style close-up of hand-knitting, looping seamlessly.
 *
 * One 5 second cycle plays out five beats:
 *   1. insert  - the working needle's tip dives into the waiting stitch
 *   2. wrap    - yarn spirals around the tip in a small loop
 *   3. pull    - the new loop is drawn through as the old stitch slides off
 *   4. grow    - the knitted swatch below gains a row
 *   5. reset   - everything eases back to the exact frame-0 pose
 *
 * Every animated value in this scene is built from either `interpolate()`
 * (see `phaseProgress` in utils/animation.ts) for the sequenced story
 * beats, or `spring()` for springy, physical settles - always with
 * ease-in-out, never linear. Ambient motion (dust, idle sway, yarn wobble)
 * uses sine waves whose frequency is a whole number of cycles per loop, and
 * the fabric's "growth" is a scroll across a pattern that repeats every two
 * rows - both tricks are what let this composition loop back to frame 0
 * without any visible seam.
 *
 * See KnittedFabric.tsx and NeedlesAndYarn.tsx for the phase-by-phase
 * breakdown of each element.
 */
export const KnittingLoop: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#f7ead2'}}>
			<Background />
			<KnittedFabric />
			<NeedlesAndYarn />
			<AmbientParticles />
		</AbsoluteFill>
	);
};
