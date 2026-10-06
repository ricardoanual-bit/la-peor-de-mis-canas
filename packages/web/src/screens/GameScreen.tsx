import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wheel from '../components/Wheel';
import Question from '../components/Question';
import { useGameStore } from '../Store/gameStore';
import { CATEGORIES, QUESTIONS, type Category } from '../questions';

interface SelectedQuestion {
	q: string;
	a: string;
	id: string;
}

const getRandomQuestion = (
	category: Category,
	hasUsedQuestion: (questionId: string) => boolean,
	resetUsedQuestions: () => void,
): SelectedQuestion => {
	const categoryQuestions = QUESTIONS[category].map((question, index) => ({
		...question,
		id: `${category}-${index}`,
	}));
	let availableQuestions = categoryQuestions.filter(
		(question) => !hasUsedQuestion(question.id),
	);

	if (availableQuestions.length === 0) {
		resetUsedQuestions();
		availableQuestions = categoryQuestions;
	}

	return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};

export default function GameScreen() {
	const navigate = useNavigate();
	const players = useGameStore((state) => state.players);
	const gameName = useGameStore((state) => state.gameName);
	const clearPlayers = useGameStore((state) => state.clearPlayers);
	const selectedCategory = useGameStore((state) => state.selectedCategory);
	const markQuestionAsUsed = useGameStore((state) => state.markQuestionAsUsed);
	const hasUsedQuestion = useGameStore((state) => state.hasUsedQuestion);
	const resetUsedQuestions = useGameStore((state) => state.resetUsedQuestions);
	const setSelectedCategory = useGameStore((state) => state.setSelectedCategory);
	const [spinning, setSpinning] = useState(false);
	const [currentPlayer, setCurrentPlayer] = useState(0);
	const [loser, setLoser] = useState<string | null>(null);
	const [round, setRound] = useState(1);
	const [mode, setMode] = useState<'choice' | 'categories' | 'question' | 'wheel' | 'result'>('choice');
	const [currentQuestion, setCurrentQuestion] = useState<SelectedQuestion | null>(null);
	const [resultMessage, setResultMessage] = useState('');
	const nextTurnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (nextTurnTimeout.current) clearTimeout(nextTurnTimeout.current);
	}, []);

	const handleTerminar = () => {
		if (nextTurnTimeout.current) clearTimeout(nextTurnTimeout.current);
		clearPlayers();
		navigate('/');
	};

	const handleChooseQuestion = () => setMode('categories');

	const handleSelectCategory = (category: Category) => {
		const question = getRandomQuestion(category, hasUsedQuestion, resetUsedQuestions);
		setCurrentQuestion(question);
		markQuestionAsUsed(question.id);
		setSelectedCategory(category);
		setMode('question');
	};

	const handleNextTurn = () => {
		setCurrentPlayer((playerIndex) => (playerIndex + 1) % players.length);
		setRound((currentRound) => currentRound + 1);
		setMode('choice');
		setLoser(null);
		setCurrentQuestion(null);
		setResultMessage('');
	};

	const handleAnswerCorrect = () => {
		setResultMessage('acertaste');
		setMode('result');
	};

	const handleAnswerWrong = () => {
		setResultMessage('fallaste');
		setMode('result');
	};

	const handleChooseWheel = () => {
		setMode('wheel');
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

				{mode === 'categories' && (
					<div className="space-y-4 max-w-2xl w-full">
						<div className="text-white text-center mb-4">
							<p className="text-xl font-bold">Elige una categoría:</p>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{CATEGORIES.map((category) => (
								<button
									key={category.key}
									type="button"
									onClick={() => handleSelectCategory(category.key)}
									className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-3 rounded-lg transition transform hover:scale-105 shadow-lg text-center"
								>
									<p className="text-2xl mb-1">{category.emoji}</p>
									<p className="text-sm">{category.label}</p>
								</button>
							))}
						</div>
					</div>
				)}

				{mode === 'question' && currentQuestion && selectedCategory && (
					<div className="space-y-6 w-full flex flex-col items-center">
						<Question
							question={currentQuestion.q}
							answer={currentQuestion.a}
							category={CATEGORIES.find(({ key }) => key === selectedCategory)?.label ?? selectedCategory}
							onAnswerCorrect={handleAnswerCorrect}
							onAnswerWrong={handleAnswerWrong}
						/>
					</div>
				)}

				{mode === 'result' && (
					<div className="space-y-6 flex flex-col items-center max-w-md w-full">
						{resultMessage === 'acertaste' ? (
							<div className="bg-green-400 border-4 border-green-600 rounded-lg p-8 text-center w-full animate-bounce">
								<p className="text-white font-black text-4xl mb-3">¡¡¡ACERTASTE!!!</p>
								<p className="text-white font-black text-2xl">👥 TODOS MENOS TÚ</p>
								<p className="text-white font-black text-3xl mt-2">¡¡¡TOMAN!!!</p>
							</div>
						) : (
							<div className="bg-red-400 border-4 border-red-600 rounded-lg p-8 text-center w-full animate-bounce">
								<p className="text-white font-black text-4xl mb-3">¡¡¡FALLASTE!!!</p>
								<p className="text-white font-black text-3xl">¡¡¡TÚ TOMAS!!!</p>
							</div>
						)}
						<button
							type="button"
							onClick={handleNextTurn}
							className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition text-lg"
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