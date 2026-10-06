import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface QuestionProps {
	question: string;
	answer: string;
	category: string;
	onAnswerCorrect: () => void;
	onAnswerWrong: () => void;
}

export default function Question({
	question,
	answer,
	category,
	onAnswerCorrect,
	onAnswerWrong,
}: QuestionProps) {
	const [showAnswer, setShowAnswer] = useState(false);
	const [answered, setAnswered] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const handleCorrect = () => {
		setIsCorrect(true);
		setAnswered(true);
		onAnswerCorrect();
	};

	const handleWrong = () => {
		setIsCorrect(false);
		setAnswered(true);
		onAnswerWrong();
	};

	return (
		<div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full border-4 border-yellow-400">
			<p className="text-xs font-black text-center mb-2 tracking-widest text-[#1a1a1a]">
				{category.toUpperCase()}
			</p>
			<h2
				className="text-4xl font-black text-black text-center mb-8 leading-tight"
				style={{ color: '#000000', textShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}
			>
				"{question}"
			</h2>

			<button
				type="button"
				onClick={() => setShowAnswer((isVisible) => !isVisible)}
				disabled={answered}
				aria-expanded={showAnswer}
				className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-black py-4 rounded-lg flex items-center justify-center gap-3 transition transform hover:scale-105 shadow-lg disabled:cursor-not-allowed"
			>
				{showAnswer ? (
					<>
						<EyeOff size={24} /> OCULTAR RESPUESTA
					</>
				) : (
					<>
						<Eye size={24} /> VER RESPUESTA
					</>
				)}
			</button>

			{showAnswer && (
				<div className="mt-6 p-6 bg-green-500 border-4 border-green-700 rounded-lg animate-pulse">
					<p
						className="text-center text-white font-black text-2xl"
						style={{ color: '#ffffff', textShadow: '0px 2px 4px rgba(0,0,0,0.3)' }}
					>
						"{answer}"
					</p>
				</div>
			)}

			{showAnswer && !answered && (
				<div className="mt-6 flex flex-col gap-3">
					<button
						type="button"
						onClick={handleCorrect}
						className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-lg text-lg transition transform hover:scale-105"
					>
						✅ ACERTÉ
					</button>
					<button
						type="button"
						onClick={handleWrong}
						className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-lg text-lg transition transform hover:scale-105"
					>
						❌ FALLÉ
					</button>
				</div>
			)}

			{answered && isCorrect !== null && (
				<div className={`mt-6 p-6 rounded-lg text-center ${isCorrect ? 'bg-green-400 border-4 border-green-600' : 'bg-red-400 border-4 border-red-600'}`}>
					<p className="text-white font-black text-3xl mb-2">
						{isCorrect ? '¡¡¡ACERTASTE!!!' : '¡¡¡FALLASTE!!!'}
					</p>
					<p className="text-white font-black text-xl">
						{isCorrect ? '👥 TODOS MENOS TÚ ¡¡¡TOMAN!!!' : '🍻 ¡¡¡TÚ TOMAS!!!'}
					</p>
				</div>
			)}
		</div>
	);
}
