import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HEIGHT, PALETTE, WIDTH, WORK_POINT} from '../constants';
import {loopingWave} from '../utils/animation';

/**
 * Warm cream backdrop with a soft, gently "breathing" glow behind the
 * working point. The glow's pulse is built from a looping sine wave so it
 * never jumps when the clip restarts.
 */
export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	// One full breathing cycle per loop - subtle, ambient, seamless.
	const glowPulse = loopingWave(frame, 1);
	const glowOpacity = 0.35 + glowPulse * 0.08;
	const glowRadius = 420 + glowPulse * 14;

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			style={{position: 'absolute', top: 0, left: 0}}
		>
			<defs>
				<linearGradient id="bg-gradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={PALETTE.backgroundTop} />
					<stop offset="100%" stopColor={PALETTE.backgroundBottom} />
				</linearGradient>
				<radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor={PALETTE.glow} stopOpacity={glowOpacity} />
					<stop offset="100%" stopColor={PALETTE.glow} stopOpacity={0} />
				</radialGradient>
				<radialGradient id="bg-vignette" cx="50%" cy="42%" r="72%">
					<stop offset="60%" stopColor="#000000" stopOpacity={0} />
					<stop offset="100%" stopColor="#3a2413" stopOpacity={0.16} />
				</radialGradient>
			</defs>

			<rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#bg-gradient)" />
			<circle
				cx={WORK_POINT.x}
				cy={WORK_POINT.y - 40}
				r={glowRadius}
				fill="url(#bg-glow)"
			/>
			<rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#bg-vignette)" />
		</svg>
	);
};
