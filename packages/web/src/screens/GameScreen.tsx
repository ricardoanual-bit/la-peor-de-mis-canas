import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wheel from '../components/Wheel';
import Question from '../components/Question';
import { useGameStore } from '../Store/gameStore';

const questions = [
	{ q: '¿Cuál es la capital de Francia?', a: 'París' },
	{ q: '¿Cuántos continentes hay?', a: 'Siete' },
	{ q: '¿En qué año cayó el Muro de Berlín?', a: '1989' },
	{ q: '¿Cuál es el planeta más grande del sistema solar?', a: 'Júpiter' },
	{ q: '¿Quién pintó la Mona Lisa?', a: 'Leonardo da Vinci' },
	{ q: '¿Cuál es el río más largo del mundo?', a: 'El Nilo' },
	{ q: '¿En qué país se originó el fútbol moderno?', a: 'Inglaterra' },
	{ q: '¿Cuántos años tiene la Tierra aproximadamente?', a: '4.5 mil millones' },
];

export default function GameScreen() {
	const navigate = useNavigate();
	const players = useGameStore((state) => state.players);
	const gameName = useGameStore((state) => state.gameName);
	const clearPlayers = useGameStore((state) => state.clearPlayers);
	const [spinning, setSpinning] = useState(false);
	const [currentPlayer, setCurrentPlayer] = useState(0);
	const [loser, setLoser] = useState<string | null>(null);
	const [round, setRound] = useState(1);
	const [mode, setMode] = useState<'choice' | 'question' | 'wheel'>('choice');
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const nextTurnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (nextTurnTimeout.current) clearTimeout(nextTurnTimeout.current);
	}, []);

	const handleTerminar = () => {
		clearPlayers();
		navigate('/');
	};

	const handleChooseQuestion = () => {
		setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
		setMode('question');
	};

	const handleChooseWheel = () => {
		setMode('wheel');
	};

	const handleNextTurn = () => {
		setCurrentPlayer((playerIndex) => (playerIndex + 1) % players.length);
		setRound((currentRound) => currentRound + 1);
		setMode('choice');
		setLoser(null);
	};

	const handleSpinComplete = (winner: string) => {
		setLoser(winner);
		setSpinning(false);

		nextTurnTimeout.current = setTimeout(() => {
			handleNextTurn();
			nextTurnTimeout.current = null;
		}, 4000);
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 flex flex-col">
			<div className="bg-black bg-opacity-40 text-white p-4">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold">La peor de mis cañas 🍻</h1>
						{gameName && <p className="text-orange-100 text-sm">{gameName}</p>}
						<p className="text-orange-200 text-sm mt-1">
							Turno de: <span className="font-bold text-lg">{players[currentPlayer]}</span>
						</p>
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
				{mode === 'choice' && !loser && (
					<div className="space-y-4 max-w-md w-full">
						<div className="text-white text-center mb-6">
							<p className="text-xl font-bold">¿Qué prefieres?</p>
						</div>

						<button
							onClick={handleChooseQuestion}
							className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg transition text-lg"
						>
							📚 Responder pregunta
						</button>

						<button
							onClick={handleChooseWheel}
							className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-lg transition text-lg"
						>
							🎡 Girar ruleta
						</button>
					</div>
				)}

				{mode === 'question' && (
					<div className="space-y-6 w-full flex flex-col items-center">
						<Question question={currentQuestion.q} answer={currentQuestion.a} />
						<button
							onClick={handleNextTurn}
							className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition"
						>
							Siguiente turno →
						</button>
					</div>
				)}

				{mode === 'wheel' && (
					<div className="space-y-6 flex flex-col items-center">
						<Wheel
							players={players}
							isSpinning={spinning}
							onSpinComplete={handleSpinComplete}
						/>

						{!loser ? (
							<button
								onClick={handleSpin}
								disabled={spinning}
								className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-black font-bold py-4 px-8 rounded-xl text-2xl transition transform hover:scale-110 shadow-lg disabled:cursor-not-allowed"
							>
								{spinning ? '🎡 GIRANDO...' : '🎡 ¡¡¡ GIRAR RULETA !!!'}
							</button>
						) : (
							<div className="bg-yellow-300 text-black rounded-xl p-6 text-center shadow-lg max-w-md w-full animate-bounce">
								<p className="text-3xl font-bold mb-2">
									{loser === '¡Todos toman!' ? '¡TODOS TOMAN!' : `¡¡¡ ${loser} !!!`}
								</p>
								<p className="text-xl font-bold">
									🍻 {loser === '¡Todos toman!' ? '¡SALUD!' : '¡¡¡ DEBES TOMAR !!!'} 🍻
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			<div className="bg-black bg-opacity-40 text-white p-4 text-center">
				<p className="text-lg font-semibold">
					Ronda {round} de 10 • {players.length} jugadores
				</p>
			</div>
		</div>
	);
}