import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {HEIGHT, PALETTE, WIDTH} from '../constants';
import {loopingWave} from '../utils/animation';

type Particle = {
	x: number;
	y: number;
	r: number;
	driftCycles: number;
	phase: number;
	baseOpacity: number;
};

// Fixed, hand-picked seeds (not random per-frame) so particles drift on
// consistent, repeatable paths - randomness would still be periodic here,
// but hand-picked values give more control over composition/balance.
const PARTICLES: Particle[] = [
	{x: 200, y: 260, r: 4, driftCycles: 1, phase: 0.2, baseOpacity: 0.5},
	{x: 860, y: 180, r: 3, driftCycles: 1, phase: 1.4, baseOpacity: 0.4},
	{x: 760, y: 420, r: 5, driftCycles: 2, phase: 2.6, baseOpacity: 0.45},
	{x: 300, y: 480, r: 3, driftCycles: 1, phase: 3.3, baseOpacity: 0.35},
	{x: 620, y: 160, r: 2.5, driftCycles: 2, phase: 0.8, baseOpacity: 0.5},
	{x: 150, y: 560, r: 3.5, driftCycles: 1, phase: 4.1, baseOpacity: 0.4},
	{x: 920, y: 340, r: 2.5, driftCycles: 1, phase: 1.9, baseOpacity: 0.35},
	{x: 470, y: 120, r: 3, driftCycles: 2, phase: 5.0, baseOpacity: 0.45},
	{x: 680, y: 300, r: 2, driftCycles: 1, phase: 2.2, baseOpacity: 0.3},
	{x: 380, y: 340, r: 2.5, driftCycles: 1, phase: 3.8, baseOpacity: 0.4},
];

/**
 * Soft dust motes drifting through the light above the knitting. Every
 * motion here is a sum of sine waves whose frequency is a whole number of
 * cycles per loop, so the field looks alive but re-syncs perfectly at the
 * loop point.
 */
export const AmbientParticles: React.FC = () => {
	const frame = useCurrentFrame();

	const particles = useMemo(() => PARTICLES, []);

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			style={{position: 'absolute', top: 0, left: 0}}
		>
			{particles.map((p, i) => {
				const driftX = loopingWave(frame, p.driftCycles, p.phase) * 18;
				const driftY = loopingWave(frame, p.driftCycles, p.phase + 1.7) * 24;
				const twinkle = loopingWave(frame, p.driftCycles * 2, p.phase);
				const opacity = Math.max(0, p.baseOpacity + twinkle * 0.2);

				return (
					<circle
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						cx={p.x + driftX}
						cy={p.y + driftY}
						r={p.r}
						fill={PALETTE.dust}
						opacity={opacity}
					/>
				);
			})}
		</svg>
	);
};
