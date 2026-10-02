import { useState } from 'react';
import LoginScreen from './LoginScreen';

export default function LandingScreen() {
	const [showLogin, setShowLogin] = useState(false);
	const [showSignup, setShowSignup] = useState(false);

	if (showLogin) {
		return <LoginScreen mode="login" onBack={() => setShowLogin(false)} />;
	}

	if (showSignup) {
		return <LoginScreen mode="signup" onBack={() => setShowSignup(false)} />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 flex flex-col items-center justify-center p-4">
			<div className="text-center">
				<div className="text-6xl mb-4">🍻</div>
				<h1 className="text-5xl font-bold text-white mb-4">
					La peor de mis cañas
				</h1>
				<p className="text-xl text-orange-100 mb-8">
					El juego de preguntas para beber con amigos
				</p>
				<div className="space-y-3 max-w-sm">
					<button
						onClick={() => setShowLogin(true)}
						className="w-full bg-white text-orange-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
					>
						Iniciar sesión
					</button>
					<button
						onClick={() => setShowSignup(true)}
						className="w-full bg-orange-900 text-white font-bold py-3 rounded-lg hover:bg-orange-800 transition"
					>
						Crear cuenta
					</button>
				</div>
			</div>
		</div>
	);
}
