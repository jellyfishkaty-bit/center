import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HEIGHT, PALETTE, WIDTH, WORK_POINT} from '../constants';
import {phaseProgress} from '../utils/animation';
import {PHASES} from '../constants';

const FABRIC_LEFT = 150;
const FABRIC_RIGHT = 930;
const FABRIC_TOP = WORK_POINT.y + 40;
const FABRIC_WIDTH = FABRIC_RIGHT - FABRIC_LEFT;
const FABRIC_HEIGHT = HEIGHT - FABRIC_TOP;

const ROW_HEIGHT = 46;
const STITCH_WIDTH = 56;
const BUMP_HEIGHT = 15;
// The pattern's true repeat unit is 2 rows (rows alternate a half-stitch
// offset for the classic knit "brick" look). Scrolling by exactly this many
// rows per loop means the pattern lines up pixel-for-pixel with itself at
// the wrap point, which is what makes the "fabric grows" illusion seamless.
const ROW_SHIFT_PER_LOOP = 2;

const buildRowPath = (rowOffset: number) => {
	const count = Math.ceil(FABRIC_WIDTH / STITCH_WIDTH) + 3;
	let d = `M ${-STITCH_WIDTH + rowOffset} 0`;
	for (let i = 0; i < count; i++) {
		const startX = -STITCH_WIDTH + rowOffset + i * STITCH_WIDTH;
		const cx = startX + STITCH_WIDTH / 2;
		const ex = startX + STITCH_WIDTH;
		d += ` Q ${cx} ${BUMP_HEIGHT} ${ex} 0`;
	}
	return d;
};

/**
 * The growing knitted swatch. Rendered as a tall, tiled strip of stockinette
 * "V" rows that scrolls upward by two rows over the course of the "grow"
 * phase, then holds - because the stitch pattern repeats every two rows,
 * a two-row scroll lines up exactly with the frame-0 pose, so the loop
 * point is invisible even though the fabric visibly gained a row.
 */
export const KnittedFabric: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// --- Phase 4: fabric grows - the whole tiled row-strip scrolls upward
	// by exactly two rows (one full pattern repeat) over the grow window.
	// Because the stockinette pattern repeats every two rows, this makes
	// frame (DURATION_IN_FRAMES - 1) line up pixel-for-pixel with frame 0,
	// even though the swatch visibly gained a row. ---
	const growProgress = phaseProgress(frame, PHASES.grow.start, PHASES.grow.end);
	const scrollOffset = growProgress * ROW_SHIFT_PER_LOOP * ROW_HEIGHT;

	// A springy squash-and-stretch bounce on the newest row as it settles
	// into place, so "a row was just added" reads as a clear beat rather
	// than a plain scroll. The spring overshoots past 1 and relaxes back to
	// 1, so outside the grow window the row sits at its normal scale.
	const settle = spring({
		frame: frame - PHASES.grow.start,
		fps,
		config: {damping: 8, stiffness: 180, mass: 0.5},
	});
	const newRowScale = 1 + Math.max(0, settle - 1) * 1.2;

	const visibleRowCount = Math.ceil(FABRIC_HEIGHT / ROW_HEIGHT) + 4;
	const rows = useMemo(() => {
		const list: {index: number; path: string}[] = [];
		for (let i = -2; i < visibleRowCount; i++) {
			const rowOffset = i % 2 === 0 ? 0 : STITCH_WIDTH / 2;
			list.push({index: i, path: buildRowPath(rowOffset)});
		}
		return list;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visibleRowCount]);

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			style={{position: 'absolute', top: 0, left: 0}}
		>
			<defs>
				<clipPath id="fabric-clip">
					<rect
						x={FABRIC_LEFT}
						y={FABRIC_TOP}
						width={FABRIC_WIDTH}
						height={FABRIC_HEIGHT}
						rx={28}
					/>
				</clipPath>
			</defs>

			{/* soft shadow the swatch casts on the backdrop */}
			<rect
				x={FABRIC_LEFT - 10}
				y={FABRIC_TOP + 6}
				width={FABRIC_WIDTH + 20}
				height={FABRIC_HEIGHT}
				rx={30}
				fill="#3a2413"
				opacity={0.08}
			/>

			<rect
				x={FABRIC_LEFT}
				y={FABRIC_TOP}
				width={FABRIC_WIDTH}
				height={FABRIC_HEIGHT}
				rx={28}
				fill={PALETTE.fabricBase}
			/>

			<g clipPath="url(#fabric-clip)">
				<g transform={`translate(${FABRIC_LEFT}, ${FABRIC_TOP - scrollOffset})`}>
					{rows.map((row) => {
						const isNewest = row.index === 0;
						const y = row.index * ROW_HEIGHT + ROW_HEIGHT;
						const color = row.index % 2 === 0 ? PALETTE.fabricShadow : PALETTE.fabricHighlight;
						return (
							<g
								key={row.index}
								transform={`translate(0, ${y}) ${
									isNewest ? `scale(1, ${newRowScale})` : ''
								}`}
								style={{transformOrigin: `0px 0px`}}
							>
								<path
									d={row.path}
									fill="none"
									stroke={color}
									strokeWidth={9}
									strokeLinecap="round"
									strokeLinejoin="round"
									opacity={0.85}
								/>
							</g>
						);
					})}
				</g>
			</g>

			{/* selvedge trim - a static sage accent framing the swatch edges */}
			<rect
				x={FABRIC_LEFT - 6}
				y={FABRIC_TOP}
				width={10}
				height={FABRIC_HEIGHT}
				rx={5}
				fill={PALETTE.accentSage}
				opacity={0.55}
			/>
			<rect
				x={FABRIC_RIGHT - 4}
				y={FABRIC_TOP}
				width={10}
				height={FABRIC_HEIGHT}
				rx={5}
				fill={PALETTE.accentSageDark}
				opacity={0.55}
			/>
		</svg>
	);
};
