import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wheel from '../components/Wheel';
import { useGameStore } from '../Store/gameStore';

const questions = [
	'¿Cuál es tu bebida alcohólica favorita?',
	'¿Cuál ha sido tu noche más divertida?',
	'¿Qué canción siempre te hace bailar?',
	'¿Cuál es el viaje que nunca olvidarás?',
];

export default function GameScreen() {
	const navigate = useNavigate();
	const players = useGameStore((state) => state.players);
	const gameName = useGameStore((state) => state.gameName);
	const clearPlayers = useGameStore((state) => state.clearPlayers);
	const [spinning, setSpinning] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState('¿Cuál es tu bebida alcohólica favorita?');
	const [loser, setLoser] = useState<string | null>(null);
	const [round, setRound] = useState(1);
	const nextRoundTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (nextRoundTimeout.current) clearTimeout(nextRoundTimeout.current);
	}, []);

	const handleTerminar = () => {
		clearPlayers();
		navigate('/');
	};

	if (players.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-xl text-gray-600 mb-4">No hay jugadores en el juego</p>
					<button
						onClick={() => navigate('/')}
						className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2 rounded-lg"
					>
						Volver al dashboard
					</button>
				</div>
			</div>
		);
	}

	const handleSpin = () => {
		if (spinning) return;
		setSpinning(true);
		setLoser(null);
	};

	const handleSpinComplete = (winner: string) => {
		setLoser(winner);
		setSpinning(false);

		nextRoundTimeout.current = setTimeout(() => {
			setRound((currentRound) => currentRound + 1);
			setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
			setLoser(null);
			nextRoundTimeout.current = null;
		}, 4000);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 flex flex-col">
			<div className="bg-black bg-opacity-40 text-white p-4">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold">La peor de mis cañas 🍻</h1>
						{gameName && <p className="text-orange-100 text-sm">{gameName}</p>}
					</div>
					<button
						onClick={handleTerminar}
						className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
					>
						Terminar
					</button>
				</div>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center p-4">
				<div className="mb-6">
					<Wheel
						players={players}
						isSpinning={spinning}
						onSpinComplete={handleSpinComplete}
					/>
				</div>

				<div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mb-6">
					<p className="text-gray-500 text-sm font-semibold text-center mb-2">PREGUNTA</p>
					<h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
						"{currentQuestion}"
					</h2>
					<p className="text-sm text-gray-600 text-center">
						Dificultad: <span className="font-bold text-orange-600">Media</span>
					</p>
				</div>

				{loser ? (
					<div className="bg-yellow-300 text-black rounded-xl p-6 text-center shadow-lg max-w-md w-full animate-bounce">
						<p className="text-3xl font-bold mb-2">¡¡¡ {loser} !!!</p>
						<p className="text-xl font-bold">🍻 ¡¡¡ DEBES TOMAR !!! 🍻</p>
					</div>
				) : (
					<button
						onClick={handleSpin}
						disabled={spinning}
						className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-black font-bold py-4 px-8 rounded-xl text-2xl transition transform hover:scale-110 shadow-lg disabled:cursor-not-allowed"
					>
						{spinning ? '🎡 GIRANDO...' : '🎡 ¡¡¡ GIRAR RULETA !!!'}
					</button>
				)}
			</div>

			<div className="bg-black bg-opacity-40 text-white p-4 text-center">
				<p className="text-lg font-semibold">Ronda {round} de 10 • {players.length} jugadores</p>
			</div>
		</div>
	);
}