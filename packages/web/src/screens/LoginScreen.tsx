import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Props {
	mode: 'login' | 'signup';
	onBack: () => void;
}

export default function LoginScreen({ mode, onBack }: Props) {
	const { signIn, signUp } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError('');

		try {
			if (mode === 'login') {
				await signIn(email, password);
			} else {
				await signUp(email, password, username);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error desconocido');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 flex flex-col items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
				<button
					onClick={onBack}
					className="text-gray-600 hover:text-gray-800 font-semibold mb-4"
				>
					← Volver
				</button>

				<h2 className="text-3xl font-bold mb-6 text-gray-800">
					{mode === 'login' ? 'Inicia sesión' : 'Crear cuenta'}
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === 'signup' && (
						<input
							type="text"
							placeholder="Nombre de usuario"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							required
						/>
					)}

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						required
					/>

					<input
						type="password"
						placeholder="Contraseña"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						required
					/>

					{error && <div className="text-red-600 text-sm">{error}</div>}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
					>
						{loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
					</button>
				</form>
			</div>
		</div>
	);
}
