import {Easing, interpolate} from 'remotion';
import {DURATION_IN_FRAMES} from '../constants';

/**
 * Maps the current frame onto a 0-1 progress value for a given phase
 * window, with smooth ease-in-out easing and clamping outside the window.
 * This is the workhorse used to sequence every "story beat" (insert, wrap,
 * pull, grow, reset) without any linear/robotic motion.
 */
export const phaseProgress = (
	frame: number,
	start: number,
	end: number,
	easing: (input: number) => number = Easing.inOut(Easing.ease),
): number => {
	return interpolate(frame, [start, end], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});
};

/**
 * A sine wave whose frequency is an integer multiple of the loop length.
 * Because DURATION_IN_FRAMES is a full period, `frame` and
 * `frame + DURATION_IN_FRAMES` always produce the identical value - this is
 * what lets ambient motion (dust drift, idle sway, yarn wobble) run
 * continuously without ever showing a jump when the render loops back to
 * frame 0.
 */
export const loopingWave = (
	frame: number,
	cycles: number,
	phaseOffset = 0,
): number => {
	return Math.sin((frame / DURATION_IN_FRAMES) * Math.PI * 2 * cycles + phaseOffset);
};
