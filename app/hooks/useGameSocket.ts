import { useEffect, useState, useMemo } from 'react';
import { webSocketService } from '@/utils/websocket';
import { GameModel, Player } from '@/types/game';
import { GameState } from '@/types/gameState';
import { RoundModel } from '@/types/round';
import { getApiDomain } from '@/utils/domain';

const baseURL = getApiDomain();

type GameWebSocketMessage = {
    event: string;
    players?: Player[];
    data?: GameModel;
    state?: GameState;
    [key: string]: any;
};

interface UseGameSocketParams {
    lobbyId: string;
    currentUser: { id: number; username: string; token: string } | null;
}

export const useGameSocket = ({ lobbyId, currentUser }: UseGameSocketParams) => {
    const [gameModel, setGameModel] = useState<GameModel | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameState, setGameState] = useState<GameState>(GameState.PRE_GAME);
    const [roundModel, setRoundModel] = useState<RoundModel | null>(null);

    // Join Game API
    const joinGame = async () => {
        if (!lobbyId || !currentUser) return;

        try {
            const response = await fetch(`${baseURL}/game/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({
                    sessionId: lobbyId,
                    userId: currentUser.id,
                }),
            });

            const text = await response.text();
            if (!response.ok) {
                throw new Error(`Join game failed: ${response.statusText}`);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('Failed to join game:', error);
            throw error;
        }
    };

    const requestGameModel = () => {
        if (!lobbyId || !currentUser) return;

        const message = {
            event: 'GAMEMODEL',
            gameID: lobbyId,
            userID: currentUser.id,
            token: currentUser.token,
        };

        webSocketService.sendMessage(JSON.stringify(message));

        setTimeout(() => {
            if (!gameModel) {
                console.log('No game model received after 5s, retrying...');
                webSocketService.sendMessage(JSON.stringify(message));
            }
        }, 5000);
    };

    // WebSocket listener
    useEffect(() => {
        if (!lobbyId || !currentUser) return;

        const listener = (data: unknown) => {
            try {
                const message = typeof data === 'string' ? JSON.parse(data) : (data as GameWebSocketMessage);

                // Log received event for debugging
                console.log('Received WebSocket event:', message.event);

                switch (message.event) {
                    case 'GAMEMODEL': {
                        const model = message.data || (message as GameModel);
                        setGameModel(model);

                        if (model.players && Array.isArray(model.players)) {
                            setPlayers(model.players);
                        }

                        break;
                    }

                    case 'ROUNDMODEL': {
                        // Handle round model updates if needed
                        break;
                    }

                    case 'GAMESTATECHANGED': {
                        if (message.state) {
                            console.log('Game state changed to:', message.state);
                            setGameState(message.state as GameState);
                        }
                        break;
                    }

                    case 'roundModel': {
                        setRoundModel(message);
                        break;
                    }

                    default:
                        console.warn("Unknown WebSocket event:", message.event);
                }
            } catch (err) {
                console.error('WebSocket parse error:', err);
            }
        };

        const setup = async () => {
            try {
                await joinGame();
                await webSocketService.connect(
                    'game',
                    lobbyId,
                    currentUser.token,
                    String(currentUser.id),
                );

                webSocketService.addListener(listener);
                requestGameModel();
            } catch (err) {
                console.error('WebSocket setup failed:', err);
            }
        };

        setup();

        return () => {
            webSocketService.removeListener(listener);
        };
    }, [lobbyId, currentUser]);

    // separate currentPlayer and otherPlayers
    const currentPlayer = useMemo(() => {
        if (!currentUser || !players) return undefined;
        return players.find((p) => p.userId === currentUser.id);
    }, [players, currentUser]);

    const otherPlayers = useMemo(() => {
        if (!currentUser || !players) return [];
        return players.filter((p) => p.userId !== currentUser.id);
    }, [players, currentUser]);

    const isHost = useMemo(() => {
        return currentPlayer?.userId === gameModel?.ownerId;
    }, [currentPlayer, gameModel]);

    // startGame
    const startGame = async () => {
        if (!gameModel || !currentUser) return;

        try {
            const response = await fetch(`${baseURL}/game/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({
                    sessionId: lobbyId,
                    userId: currentUser.id,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to start game: ${response.statusText}`);
            }

            const gameData = await response.json();
            console.log('Game started:', gameData);
        } catch (error) {
            console.error('Error starting game:', error);
        }
    };

    return {
        gameModel,
        players,
        currentPlayer,
        otherPlayers,
        isHost,
        startGame,
        requestGameModel,
        gameState,
        setGameState,
        roundModel
    };
};