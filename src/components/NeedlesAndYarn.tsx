import React from 'react';
import {useCurrentFrame} from 'remotion';
import {HEIGHT, PALETTE, PHASES, WIDTH, WORK_POINT} from '../constants';
import {loopingWave, phaseProgress} from '../utils/animation';

type Point = {x: number; y: number};

// The right (working) needle's tip sits here when it's pulled back,
// mid-air, about to dive into the next stitch. It returns to exactly this
// offset by the end of every cycle, which is what keeps the loop seamless.
const WITHDRAWN_OFFSET: Point = {x: 46, y: -34};
const RIGHT_FAR: Point = {x: 560, y: -640}; // shaft direction, up and to the right
const LEFT_TIP_OFFSET: Point = {x: -30, y: 16};
const LEFT_FAR: Point = {x: -560, y: 560}; // shaft direction, down and to the left
const YARN_SOURCE: Point = {x: 1000, y: 1000}; // hint of the yarn ball, off in the corner

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPoint = (a: Point, b: Point, t: number): Point => ({
	x: lerp(a.x, b.x, t),
	y: lerp(a.y, b.y, t),
});

/** A slightly wavy bezier so the yarn strand reads as soft, not rigid. */
const yarnPath = (from: Point, to: Point, frame: number, cycles: number) => {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const wave1 = loopingWave(frame, cycles, 0) * 22;
	const wave2 = loopingWave(frame, cycles, Math.PI / 2) * 16;
	const c1: Point = {x: from.x + dx * 0.33 + nx * wave1, y: from.y + dy * 0.33 + ny * wave1};
	const c2: Point = {x: from.x + dx * 0.66 + nx * wave2, y: from.y + dy * 0.66 + ny * wave2};
	return `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
};

const NeedleShaft: React.FC<{tip: Point; far: Point; flip?: boolean}> = ({tip, far}) => {
	const farX = tip.x + far.x;
	const farY = tip.y + far.y;
	const angle = Math.atan2(far.y, far.x);
	// Stop the shaft line a little short of the true tip so a separate
	// tapered polygon can form the point - reads much more "needle-like"
	// than a single flat-capped line.
	const backX = tip.x - Math.cos(angle) * 34;
	const backY = tip.y - Math.sin(angle) * 34;
	const perpX = Math.sin(angle) * 12;
	const perpY = -Math.cos(angle) * 12;

	return (
		<g>
			<line x1={farX} y1={farY} x2={backX} y2={backY} stroke={PALETTE.needleOutline} strokeWidth={30} strokeLinecap="round" />
			<line x1={farX} y1={farY} x2={backX} y2={backY} stroke={PALETTE.needleBody} strokeWidth={23} strokeLinecap="round" />
			<line
				x1={farX + perpX * 0.3}
				y1={farY + perpY * 0.3}
				x2={backX + perpX * 0.3}
				y2={backY + perpY * 0.3}
				stroke={PALETTE.needleHighlight}
				strokeWidth={6}
				strokeLinecap="round"
				opacity={0.6}
			/>
			<polygon
				points={`${tip.x},${tip.y} ${backX + perpX},${backY + perpY} ${backX - perpX},${backY - perpY}`}
				fill={PALETTE.needleBody}
				stroke={PALETTE.needleOutline}
				strokeWidth={2}
				strokeLinejoin="round"
			/>
		</g>
	);
};

/**
 * The two crossing needles, the working yarn strand, and the stitch that
 * forms between them. This is the heart of the loop's five-beat sequence:
 * insert -> wrap -> pull-through / slide-off -> (fabric grows, see
 * KnittedFabric) -> reset.
 */
export const NeedlesAndYarn: React.FC = () => {
	const frame = useCurrentFrame();

	// --- Phase 1: insert - the working needle's tip travels from its
	// withdrawn "ready" pose into the waiting stitch loop. ---
	const insertT = phaseProgress(frame, PHASES.insert.start, PHASES.insert.end);
	// --- Phase 3: pull-through - after the wrap, the needle retracts back
	// out to the withdrawn pose, carrying the freshly formed loop with it. ---
	const pullT = phaseProgress(frame, PHASES.pull.start, PHASES.pull.end);

	let rightOffset: Point;
	if (frame <= PHASES.insert.end) {
		rightOffset = lerpPoint(WITHDRAWN_OFFSET, {x: 0, y: 0}, insertT);
	} else if (frame <= PHASES.wrap.end) {
		// --- Phase 2: wrap - the tip holds still at the stitch while the
		// yarn spirals around it (see the wrapLoop circle below). ---
		rightOffset = {x: 0, y: 0};
	} else if (frame <= PHASES.pull.end) {
		rightOffset = lerpPoint({x: 0, y: 0}, WITHDRAWN_OFFSET, pullT);
	} else {
		// --- Phase 5: reset - holds the withdrawn pose, identical to the
		// frame-0 pose, so the loop point is invisible. ---
		rightOffset = WITHDRAWN_OFFSET;
	}

	const rightTip: Point = {x: WORK_POINT.x + rightOffset.x, y: WORK_POINT.y + rightOffset.y};

	// The holding needle mostly rests, with a whisper of idle sway (a
	// looping sine, so it re-syncs perfectly at the wrap point) to keep the
	// scene from feeling frozen between beats.
	const idleX = loopingWave(frame, 1, 2.1) * 2.5;
	const idleY = loopingWave(frame, 1, 0.4) * 2;
	const leftTip: Point = {
		x: WORK_POINT.x + LEFT_TIP_OFFSET.x + idleX,
		y: WORK_POINT.y + LEFT_TIP_OFFSET.y + idleY,
	};

	// --- Phase 2: wrap-around loop, drawn on progressively with a
	// stroke-dashoffset "reveal" as the yarn spirals the tip. ---
	const wrapT = phaseProgress(frame, PHASES.wrap.start, PHASES.wrap.end);

	// --- Phase 3 (second half): the new loop drops from the tip down into
	// the fabric, fading as it becomes part of the swatch. ---
	const newStitchPos = lerpPoint(WORK_POINT, {x: WORK_POINT.x, y: WORK_POINT.y + 50}, pullT);
	const newStitchOpacity = wrapT > 0 ? Math.max(0, 1 - Math.max(0, (pullT - 0.55) / 0.45)) : 0;
	const newStitchScale = 1 + pullT * 0.15;

	// --- Phase 3: the old stitch slides off the holding needle's tip and
	// fades away, making room for the next one. ---
	const oldStitchOffset = lerpPoint({x: 0, y: 0}, {x: -14, y: 44}, pullT);
	const oldStitchOpacity = 1 - pullT;
	const oldStitchScale = 1 - pullT * 0.55;

	const yarnD = yarnPath(YARN_SOURCE, rightTip, frame, 1);

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			style={{position: 'absolute', top: 0, left: 0}}
		>
			{/* Hint of the yarn ball tucked in the corner, gently bobbing. */}
			<g transform={`translate(${YARN_SOURCE.x}, ${YARN_SOURCE.y + loopingWave(frame, 1, 1) * 4})`}>
				<circle r={54} fill={PALETTE.yarnActiveDark} opacity={0.9} />
				<path d="M -30 -10 Q 0 30 30 -6" stroke={PALETTE.fabricHighlight} strokeWidth={4} fill="none" opacity={0.5} />
				<path d="M -26 14 Q 0 -22 28 12" stroke={PALETTE.fabricHighlight} strokeWidth={4} fill="none" opacity={0.5} />
			</g>

			{/* Working yarn strand, soft and slightly wavy. */}
			<path d={yarnD} stroke={PALETTE.yarnActive} strokeWidth={13} fill="none" strokeLinecap="round" />

			{/* Old stitch sliding off the holding needle. */}
			<ellipse
				cx={leftTip.x + oldStitchOffset.x}
				cy={leftTip.y + oldStitchOffset.y + 26}
				rx={22 * oldStitchScale}
				ry={15 * oldStitchScale}
				fill="none"
				stroke={PALETTE.fabricHighlight}
				strokeWidth={11}
				opacity={oldStitchOpacity}
			/>

			{/* Waiting stitches, patiently queued on the holding needle. */}
			{[44, 76, 108].map((d, i) => {
				const angle = Math.atan2(LEFT_FAR.y, LEFT_FAR.x);
				const px = leftTip.x + Math.cos(angle) * d;
				const py = leftTip.y + Math.sin(angle) * d;
				return (
					<ellipse
						key={i}
						cx={px}
						cy={py}
						rx={20}
						ry={13}
						fill="none"
						stroke={PALETTE.accentSageDark}
						strokeWidth={9}
						opacity={0.8}
						transform={`rotate(${(angle * 180) / Math.PI + 90} ${px} ${py})`}
					/>
				);
			})}

			{/* The holding needle (left), mostly still. */}
			<NeedleShaft tip={leftTip} far={LEFT_FAR} />

			{/* The new stitch, pulled through and dropping into the fabric. */}
			<ellipse
				cx={newStitchPos.x}
				cy={newStitchPos.y}
				rx={22 * newStitchScale}
				ry={15 * newStitchScale}
				fill="none"
				stroke={PALETTE.yarnActive}
				strokeWidth={12}
				opacity={newStitchOpacity}
			/>

			{/* Phase 2: the wrap - yarn spiraling the working tip. */}
			<circle
				cx={rightTip.x}
				cy={rightTip.y}
				r={32}
				fill="none"
				stroke={PALETTE.yarnActive}
				strokeWidth={13}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - wrapT}
				transform={`rotate(-90 ${rightTip.x} ${rightTip.y})`}
			/>

			{/* The working needle (right), inserting / wrapping / pulling. */}
			<NeedleShaft tip={rightTip} far={RIGHT_FAR} />
		</svg>
	);
};
