import { create } from 'zustand';

interface GameStore {
	players: string[];
	gameName: string;
	addPlayer: (name: string) => void;
	removePlayer: (index: number) => void;
	clearPlayers: () => void;
	setGameName: (name: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
	players: [],
	gameName: '',
	addPlayer: (name) =>
		set((state) => ({
			players: [...state.players, name],
		})),
	removePlayer: (index) =>
		set((state) => ({
			players: state.players.filter((_, playerIndex) => playerIndex !== index),
		})),
	clearPlayers: () => set({ players: [] }),
	setGameName: (name) => set({ gameName: name }),
}));
