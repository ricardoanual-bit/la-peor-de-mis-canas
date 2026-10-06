import { create } from 'zustand';

interface GameState {
	players: string[];
	gameName: string;
	usedQuestions: Set<string>;
	selectedCategory: string | null;
	addPlayer: (player: string) => void;
	removePlayer: (player: string) => void;
	clearPlayers: () => void;
	setGameName: (name: string) => void;
	setSelectedCategory: (category: string) => void;
	markQuestionAsUsed: (questionId: string) => void;
	hasUsedQuestion: (questionId: string) => boolean;
	resetUsedQuestions: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
	players: [],
	gameName: '',
	usedQuestions: new Set(),
	selectedCategory: null,
	addPlayer: (player) =>
		set((state) => ({
			players: [...state.players, player],
		})),
	removePlayer: (player) =>
		set((state) => ({
			players: state.players.filter((currentPlayer) => currentPlayer !== player),
		})),
	clearPlayers: () => set({
		players: [],
		gameName: '',
		usedQuestions: new Set(),
		selectedCategory: null,
	}),
	setGameName: (name) => set({ gameName: name }),
	setSelectedCategory: (category) => set({ selectedCategory: category }),
	markQuestionAsUsed: (questionId) =>
		set((state) => ({
			usedQuestions: new Set(state.usedQuestions).add(questionId),
		})),
	hasUsedQuestion: (questionId) => get().usedQuestions.has(questionId),
	resetUsedQuestions: () => set({ usedQuestions: new Set() }),
}));
