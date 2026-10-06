import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface QuestionProps {
	question: string;
	answer: string;
}

export default function Question({ question, answer }: QuestionProps) {
	const [showAnswer, setShowAnswer] = useState(false);

	return (
		<div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full border-4 border-yellow-300">
			<p className="text-gray-900 text-xs font-black text-center mb-3 tracking-widest">
				PREGUNTA DE CULTURA GENERAL
			</p>
			<h2
				className="text-4xl font-black text-black text-center mb-8 leading-tight drop-shadow-lg"
				style={{ color: '#000000', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
			>
				"{question}"
			</h2>

			<button
				type="button"
				onClick={() => setShowAnswer((isVisible) => !isVisible)}
				aria-expanded={showAnswer}
				className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black py-4 rounded-lg flex items-center justify-center gap-3 transition transform hover:scale-105 shadow-lg"
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
					<p className="text-center text-white font-black text-2xl">"{answer}"</p>
				</div>
			)}
		</div>
	);
}
