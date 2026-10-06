import { useEffect, useRef, useState } from 'react';

interface WheelProps {
	players: string[];
	isSpinning: boolean;
	onSpinComplete: (winner: string) => void;
}

export default function Wheel({ players, isSpinning, onSpinComplete }: WheelProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rotationRef = useRef(0);
	const playersRef = useRef(players);
	const onSpinCompleteRef = useRef(onSpinComplete);
	const [rotation, setRotation] = useState(0);

	useEffect(() => {
		playersRef.current = players;
		onSpinCompleteRef.current = onSpinComplete;
	}, [players, onSpinComplete]);

	useEffect(() => {
		if (!isSpinning) return;

		const spinPlayers = playersRef.current;
		if (spinPlayers.length === 0) return;
		const wheelOptions = [...spinPlayers, '¡Todos toman!'];

		const spins = Math.floor(Math.random() * 5) + 5;
		const stopAngle = Math.floor(Math.random() * 360);
		const totalRotation = spins * 360 + stopAngle;
		const startRotation = rotationRef.current;
		const startTime = performance.now();
		const duration = 3000;
		let animationFrame = 0;

		const animate = (timestamp: number) => {
			const progress = Math.min((timestamp - startTime) / duration, 1);
			const easeProgress = 1 - Math.pow(1 - progress, 3);
			const currentRotation = (startRotation + totalRotation * easeProgress) % 360;

			rotationRef.current = currentRotation;
			setRotation(currentRotation);

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
				return;
			}

			const normalizedAngle = (270 - currentRotation + 360) % 360;
			const segmentAngle = 360 / wheelOptions.length;
			const winnerIndex = Math.floor(normalizedAngle / segmentAngle);
			onSpinCompleteRef.current(wheelOptions[winnerIndex]);
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [isSpinning]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');
		if (!canvas || !context) return;

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const radius = 150;
		const colors = [
			'#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF',
			'#9D84B7', '#FF6B9D', '#C44569', '#FFA502', '#1B9CFC',
		];

		context.clearRect(0, 0, canvas.width, canvas.height);

		if (players.length === 0) {
			context.fillStyle = '#4B5563';
			context.font = 'bold 18px sans-serif';
			context.textAlign = 'center';
			context.fillText('Añade jugadores', centerX, centerY);
			return;
		}

		const wheelOptions = [...players, '¡Todos toman!'];
		const segmentAngle = (2 * Math.PI) / wheelOptions.length;

		wheelOptions.forEach((player, index) => {
			const startAngle = index * segmentAngle;
			const endAngle = (index + 1) * segmentAngle;

			context.beginPath();
			context.moveTo(centerX, centerY);
			context.arc(centerX, centerY, radius, startAngle, endAngle);
			context.closePath();
			context.fillStyle = colors[index % colors.length];
			context.fill();
			context.strokeStyle = '#fff';
			context.lineWidth = 3;
			context.stroke();

			context.save();
			context.translate(centerX, centerY);
			context.rotate(startAngle + segmentAngle / 2);
			context.fillStyle = '#fff';
			context.font = 'bold 14px sans-serif';
			context.textAlign = 'right';
			context.textBaseline = 'middle';
			context.fillText(player, radius - 30, 0);
			context.restore();
		});

		context.beginPath();
		context.arc(centerX, centerY, 15, 0, 2 * Math.PI);
		context.fillStyle = '#FFD700';
		context.fill();
		context.strokeStyle = '#FFA500';
		context.lineWidth = 3;
		context.stroke();
	}, [players]);

	return (
		<div className="flex items-center justify-center">
			<div className="relative aspect-square w-[min(400px,90vw)]">
				<canvas
					ref={canvasRef}
					width={400}
					height={400}
					aria-label={`Ruleta con ${players.length} jugadores y la opción ¡Todos toman!`}
					className="h-full w-full drop-shadow-2xl"
					style={{ transform: `rotate(${rotation}deg)` }}
				/>
				<div className="absolute left-1/2 top-[9%] z-10 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow" />
			</div>
		</div>
	);
}
