import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useGameStore } from '../Store/gameStore';

export default function CreateGameScreen() {
	const navigate = useNavigate();
	const { players, gameName, addPlayer, removePlayer, setGameName, clearPlayers } = useGameStore();
	const [inputValue, setInputValue] = useState('');
	const [gameNameInput, setGameNameInput] = useState(gameName);

	const handleAddPlayer = () => {
		if (inputValue.trim()) {
			addPlayer(inputValue.trim());
			setInputValue('');
		}
	};

	const handleStartGame = () => {
		if (players.length < 2) {
			alert('Necesitas al menos 2 jugadores para jugar');
			return;
		}

		setGameName(gameNameInput.trim());
		navigate('/game');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 mb-6">
				<button
					onClick={() => {
						clearPlayers();
						navigate('/');
					}}
					className="text-white hover:text-orange-200 font-semibold"
				>
					← Volver
				</button>
				<h1 className="text-2xl font-bold mt-2">Crear nuevo juego</h1>
			</div>

			<div className="max-w-2xl mx-auto p-4 space-y-6">
				<div className="bg-white rounded-lg shadow-lg p-6">
					<label className="block text-gray-700 font-semibold mb-2">
						Nombre del juego (opcional)
					</label>
					<input
						type="text"
						placeholder="Ej: Juego de viernes con amigos"
						value={gameNameInput}
						onChange={(event) => setGameNameInput(event.target.value)}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
					/>
				</div>

				<div className="bg-white rounded-lg shadow-lg p-6">
					<label className="block text-gray-700 font-semibold mb-4">
						Agregar participantes
					</label>

					<div className="flex gap-2 mb-4">
						<input
							type="text"
							placeholder="Nombre del participante"
							value={inputValue}
							onChange={(event) => setInputValue(event.target.value)}
							onKeyDown={(event) => event.key === 'Enter' && handleAddPlayer()}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
						<button
							type="button"
							onClick={handleAddPlayer}
							className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
						>
							<Plus size={20} /> Agregar
						</button>
					</div>

					{players.length > 0 ? (
						<div className="space-y-2">
							<p className="text-sm text-gray-600 mb-3">
								{players.length} participante{players.length !== 1 ? 's' : ''}
							</p>
							<div className="grid grid-cols-2 gap-2">
									{players.map((player, index) => (
									<div
										key={`${player}-${index}`}
										className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 flex justify-between items-center"
									>
										<span className="font-semibold text-gray-800">{player}</span>
										<button
											type="button"
												onClick={() => removePlayer(player)}
											aria-label={`Eliminar a ${player}`}
											className="text-red-600 hover:text-red-800 transition"
										>
											<X size={18} />
										</button>
									</div>
								))}
							</div>
						</div>
					) : (
						<p className="text-gray-500 text-center py-4">No hay participantes aún</p>
					)}
					</div>

				<button
					type="button"
					onClick={handleStartGame}
					disabled={players.length < 2}
					className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition disabled:cursor-not-allowed text-lg"
				>
					{players.length < 2
						? `Agrega al menos 2 participantes (${players.length})`
						: '🍻 ¡¡¡ EMPEZAR A JUGAR !!!'}
				</button>
			</div>
		</div>
	);
}