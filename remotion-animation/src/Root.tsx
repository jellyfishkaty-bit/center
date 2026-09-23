import {Composition} from 'remotion';
import {KnittingLoop} from './KnittingLoop';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './constants';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="KnittingLoop"
				component={KnittingLoop}
				durationInFrames={DURATION_IN_FRAMES}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
			/>
		</>
	);
};
